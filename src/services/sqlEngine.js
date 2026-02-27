const initSqlJs = require('sql.js');

let SQL = null;

const getSQL = async () => {
    if (!SQL) {
        SQL = await initSqlJs();
    }
    return SQL;
};

/**
 * Execute a student's SQL query against the assignment's schema + seed data
 * Returns { columns, rows, error, executionTime }
 */
const executeQuery = async (schema, seedData, studentQuery) => {
    const startTime = Date.now();
    let db = null;

    try {
        const SQL = await getSQL();
        db = new SQL.Database();

        // Setup schema
        db.run(schema);

        // Seed initial data
        db.run(seedData);

        // Execute student query
        const results = db.exec(studentQuery.trim());

        const executionTime = Date.now() - startTime;

        if (!results || results.length === 0) {
            return {
                columns: [],
                rows: [],
                error: null,
                executionTime,
                isEmpty: true,
            };
        }

        const { columns, values } = results[0];

        return {
            columns,
            rows: values.map((row) => {
                const obj = {};
                columns.forEach((col, i) => {
                    obj[col] = row[i];
                });
                return obj;
            }),
            error: null,
            executionTime,
            isEmpty: false,
        };
    } catch (err) {
        return {
            columns: [],
            rows: [],
            error: err.message,
            executionTime: Date.now() - startTime,
            isEmpty: false,
        };
    } finally {
        if (db) db.close();
    }
};

/**
 * Execute expected query and student query, compare results
 * Returns { passed, studentResult, expectedResult, mismatch }
 */
const compareResults = async (schema, seedData, expectedQuery, studentQuery) => {
    const [expectedResult, studentResult] = await Promise.all([
        executeQuery(schema, seedData, expectedQuery),
        executeQuery(schema, seedData, studentQuery),
    ]);

    if (studentResult.error) {
        return {
            passed: false,
            studentResult,
            expectedResult,
            mismatch: 'syntax_error',
        };
    }

    // Normalize comparison: stringify rows for comparison
    const normalizeRows = (rows) =>
        rows.map((row) =>
            Object.fromEntries(
                Object.entries(row).map(([k, v]) => [k, v === null ? null : String(v)])
            )
        );

    const expectedNorm = JSON.stringify(normalizeRows(expectedResult.rows));
    const studentNorm = JSON.stringify(normalizeRows(studentResult.rows));
    const passed = expectedNorm === studentNorm;

    return {
        passed,
        studentResult,
        expectedResult,
        mismatch: passed ? null : 'result_mismatch',
    };
};

module.exports = { executeQuery, compareResults };
