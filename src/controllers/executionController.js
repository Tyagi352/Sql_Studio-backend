const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { compareResults } = require('../services/sqlEngine');
const { getHint } = require('../services/hintEngine');

// @desc  Execute a student SQL query
// @route POST /api/execute
const executeSQL = async (req, res, next) => {
    try {
        const { assignmentId, query, hintIndex } = req.body;

        if (!assignmentId || !query) {
            return res.status(400).json({ success: false, message: 'assignmentId and query are required.' });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment || !assignment.isActive) {
            return res.status(404).json({ success: false, message: 'Assignment not found.' });
        }

        // Execute and compare
        const { passed, studentResult, expectedResult, mismatch } = await compareResults(
            assignment.schema,
            assignment.seedData,
            assignment.expectedQuery,
            query
        );

        // Build hint if query failed (Gemini-powered — async)
        let hint = null;
        if (!passed) {
            hint = await getHint(assignment, query, hintIndex ?? 0);
        }

        // Save submission
        const pointsEarned = passed ? assignment.points : 0;
        const hintsUsed = hintIndex !== undefined ? hintIndex + 1 : 0;

        const submission = await Submission.create({
            user: req.user._id,
            assignment: assignmentId,
            query,
            passed,
            result: studentResult.rows,
            error: studentResult.error,
            executionTime: studentResult.executionTime,
            hintsUsed,
            pointsEarned,
        });

        // Update user progress if passed and not already completed
        if (passed) {
            const alreadyCompleted = req.user.completedAssignments
                .map((id) => id.toString())
                .includes(assignmentId);

            if (!alreadyCompleted) {
                await User.findByIdAndUpdate(req.user._id, {
                    $addToSet: { completedAssignments: assignmentId },
                    $inc: { totalPoints: assignment.points },
                });
            }
        }

        res.json({
            success: true,
            passed,
            mismatch,
            studentResult: {
                columns: studentResult.columns,
                rows: studentResult.rows,
                error: studentResult.error,
                executionTime: studentResult.executionTime,
                isEmpty: studentResult.isEmpty,
            },
            hint,
            submissionId: submission._id,
            pointsEarned: passed ? assignment.points : 0,
        });
    } catch (err) {
        next(err);
    }
};

// @desc  Get a hint for an assignment without executing
// @route POST /api/execute/hint
const getHintOnly = async (req, res, next) => {
    try {
        const { assignmentId, query, hintIndex } = req.body;

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found.' });
        }

        const hint = await getHint(assignment, query || '', hintIndex || 0);
        res.json({ success: true, ...hint });
    } catch (err) {
        next(err);
    }
};

module.exports = { executeSQL, getHintOnly };
