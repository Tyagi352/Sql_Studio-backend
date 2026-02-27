const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
            required: true,
        },
        topic: {
            type: String,
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        schema: {
            type: String, // CREATE TABLE SQL statements
            required: true,
        },
        seedData: {
            type: String, // INSERT INTO SQL statements
            required: true,
        },
        sampleQuery: {
            type: String, // Example query that works (shown to students)
            default: '',
        },
        expectedQuery: {
            type: String, // Reference correct query
            required: true,
        },
        hints: {
            type: [String],
            default: [],
        },
        points: {
            type: Number,
            default: 10,
        },
        tableInfo: {
            type: String, // Human-readable description of tables/columns
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
