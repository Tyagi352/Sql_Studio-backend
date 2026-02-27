const Assignment = require('../models/Assignment');
const { executeQuery } = require('../services/sqlEngine');

// @desc  Get all assignments
// @route GET /api/assignments
const getAssignments = async (req, res, next) => {
    try {
        const { difficulty, topic } = req.query;
        const filter = { isActive: true };
        if (difficulty) filter.difficulty = difficulty;
        if (topic) filter.topic = topic;

        const assignments = await Assignment.find(filter)
            .select('-schema -seedData -expectedQuery')
            .sort('order');

        const completedIds = req.user.completedAssignments.map((id) => id.toString());
        const enriched = assignments.map((a) => ({
            ...a.toObject(),
            completed: completedIds.includes(a._id.toString()),
        }));

        res.json({ success: true, count: assignments.length, assignments: enriched });
    } catch (err) {
        next(err);
    }
};

// @desc  Get single assignment (with schema info, but NOT expected query)
// @route GET /api/assignments/:id
const getAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findById(req.params.id).select('-expectedQuery');

        if (!assignment || !assignment.isActive) {
            return res.status(404).json({ success: false, message: 'Assignment not found.' });
        }

        const completed = req.user.completedAssignments
            .map((id) => id.toString())
            .includes(assignment._id.toString());

        res.json({ success: true, assignment: { ...assignment.toObject(), completed } });
    } catch (err) {
        next(err);
    }
};

// @desc  Get pre-loaded sample data for an assignment (all tables as rows)
// @route GET /api/assignments/:id/sample-data
const getSampleData = async (req, res, next) => {
    try {
        const assignment = await Assignment.findById(req.params.id).select('schema seedData isActive');
        if (!assignment || !assignment.isActive) {
            return res.status(404).json({ success: false, message: 'Assignment not found.' });
        }

        // Extract table names from CREATE TABLE statements in the schema
        const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["'`]?(\w+)["'`]?/gi;
        const tableNames = [];
        let match;
        while ((match = tableRegex.exec(assignment.schema)) !== null) {
            tableNames.push(match[1]);
        }

        if (tableNames.length === 0) {
            return res.json({ success: true, tables: [] });
        }

        // Run SELECT * on each table using the sql.js engine
        const tables = await Promise.all(
            tableNames.map(async (tableName) => {
                const result = await executeQuery(
                    assignment.schema,
                    assignment.seedData,
                    `SELECT * FROM ${tableName} LIMIT 50`
                );
                return {
                    tableName,
                    columns: result.columns,
                    rows: result.rows,
                    error: result.error,
                };
            })
        );

        res.json({ success: true, tables });
    } catch (err) {
        next(err);
    }
};

// @desc  Create assignment (admin only)
// @route POST /api/assignments
const createAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.create(req.body);
        res.status(201).json({ success: true, assignment });
    } catch (err) {
        next(err);
    }
};

// @desc  Update assignment (admin only)
// @route PUT /api/assignments/:id
const updateAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
        res.json({ success: true, assignment });
    } catch (err) {
        next(err);
    }
};

// @desc  Delete assignment (admin only)
// @route DELETE /api/assignments/:id
const deleteAssignment = async (req, res, next) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });
        res.json({ success: true, message: 'Assignment deactivated.' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAssignments,
    getAssignment,
    getSampleData,
    createAssignment,
    updateAssignment,
    deleteAssignment,
};
