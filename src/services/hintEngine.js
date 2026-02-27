const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialise Gemini client (lazy – only when first hint is requested)
let genAI;

const getGenAI = () => {
    if (!genAI) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables.');
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

/**
 * Build a structured system prompt for the hint model.
 * The model is instructed to be a helpful SQL tutor — never giving
 * the full answer, only pointing the student in the right direction.
 */
const buildPrompt = ({ assignment, studentQuery, hintIndex }) => {
    const level = hintIndex === 0 ? 'structural (explain which SQL clauses to use, like SELECT or WHERE)'
        : hintIndex === 1 ? 'template (provide a structural SQL snippet with placeholders like SELECT ___ FROM ___)'
            : 'specific (point out exactly what is missing or wrong in their query, but DO NOT write the exact final answer)';

    return `You are an expert SQL tutor helping a student solve a database assignment.

## Assignment
**Title:** ${assignment.title}
**Description:** ${assignment.description}
**Topic:** ${assignment.topic}
**Difficulty:** ${assignment.difficulty}

## Database Schema
\`\`\`sql
${assignment.schema || assignment.tableInfo || 'Not provided'}
\`\`\`

## Student's Current Query
\`\`\`sql
${studentQuery || '(no query written yet)'}
\`\`\`

## Your Task
Give a **${level}** hint (Hint #${hintIndex + 1}).

Rules:
- DO NOT write or reveal the exactly correct SQL query.
- Make the hint actionable and structural (e.g., mentioning which tables to use, which columns, or the necessary SQL clauses).
- If giving a template, use ___ for placeholders.
- Keep the hint to 1-3 sentences maximum.
- Be encouraging and educational.
- If the query is empty or trivially wrong, guide them toward starting.

Respond with ONLY the hint text. No preamble, no labels. You MAY use markdown for code snippets like \`SELECT\`.`;
};

/**
 * Get a Gemini-powered hint for the student.
 *
 * @param {Object} assignment - Mongoose Assignment document
 * @param {string} studentQuery - The student's current SQL query
 * @param {number} hintIndex - 0-based hint level (0 = gentlest)
 * @returns {Promise<{ hint: string, level: number, exhausted: boolean }>}
 */
const getHint = async (assignment, studentQuery, hintIndex = 0) => {
    const MAX_HINTS = 3;
    const clampedIndex = Math.min(hintIndex, MAX_HINTS - 1);

    // If hints are pre-stored on the assignment, use them as context
    // but still enhance via Gemini for truly intelligent responses.
    // (Stored hints are used as a fallback if Gemini fails)
    const fallbackHints = assignment.hints || [];

    try {
        const model = getGenAI().getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.4,
            },
        });

        const prompt = buildPrompt({
            assignment,
            studentQuery,
            hintIndex: clampedIndex,
        });

        const result = await model.generateContent(prompt);
        const hint = result.response.text().trim();

        return {
            hint,
            level: clampedIndex + 1,
            exhausted: clampedIndex >= MAX_HINTS - 1,
        };
    } catch (err) {
        console.error('Gemini hint error:', err.message);

        // Graceful fallback to pre-stored hints if available
        const fallback = fallbackHints[clampedIndex];
        return {
            hint: fallback || 'Think carefully about which SQL clauses you need for this query.',
            level: clampedIndex + 1,
            exhausted: clampedIndex >= MAX_HINTS - 1,
            fromFallback: true,
        };
    }
};

module.exports = { getHint };
