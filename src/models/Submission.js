const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true,
        },
        query: {
            type: String,
            required: true,
        },
        passed: {
            type: Boolean,
            required: true,
        },
        result: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        error: {
            type: String,
            default: null,
        },
        executionTime: {
            type: Number, // in ms
            default: 0,
        },
        hintsUsed: {
            type: Number,
            default: 0,
        },
        pointsEarned: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
