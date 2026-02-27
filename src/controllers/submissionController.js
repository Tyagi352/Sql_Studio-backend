const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// @desc  Get my submissions
// @route GET /api/submissions/me
const getMySubmissions = async (req, res, next) => {
    try {
        const { assignmentId } = req.query;
        const filter = { user: req.user._id };
        if (assignmentId) filter.assignment = assignmentId;

        const submissions = await Submission.find(filter)
            .populate('assignment', 'title topic difficulty points')
            .sort('-createdAt')
            .limit(50);

        res.json({ success: true, count: submissions.length, submissions });
    } catch (err) {
        next(err);
    }
};

// @desc  Get progress summary
// @route GET /api/submissions/progress
const getProgress = async (req, res, next) => {
    try {
        const totalAssignments = await Assignment.countDocuments({ isActive: true });
        const completedCount = req.user.completedAssignments.length;

        const submissionCount = await Submission.countDocuments({ user: req.user._id });
        const passedCount = await Submission.countDocuments({ user: req.user._id, passed: true });

        // Per-difficulty progress
        const difficulties = ['easy', 'medium', 'hard'];
        const difficultyStats = {};
        for (const diff of difficulties) {
            const total = await Assignment.countDocuments({ difficulty: diff, isActive: true });
            const completed = await Assignment.countDocuments({
                difficulty: diff,
                isActive: true,
                _id: { $in: req.user.completedAssignments },
            });
            difficultyStats[diff] = { total, completed };
        }

        res.json({
            success: true,
            progress: {
                totalAssignments,
                completedAssignments: completedCount,
                completionPercent: totalAssignments > 0 ? Math.round((completedCount / totalAssignments) * 100) : 0,
                totalPoints: req.user.totalPoints,
                totalSubmissions: submissionCount,
                passedSubmissions: passedCount,
                accuracy: submissionCount > 0 ? Math.round((passedCount / submissionCount) * 100) : 0,
                difficultyStats,
            },
        });
    } catch (err) {
        next(err);
    }
};

// @desc  Get leaderboard
// @route GET /api/submissions/leaderboard
const getLeaderboard = async (req, res, next) => {
    try {
        const { mongoose } = require('mongoose');
        const User = require('../models/User');
        const leaders = await User.find({ role: 'student' })
            .select('name totalPoints completedAssignments')
            .sort('-totalPoints')
            .limit(10);

        const leaderboard = leaders.map((u, i) => ({
            rank: i + 1,
            name: u.name,
            totalPoints: u.totalPoints,
            completedCount: u.completedAssignments.length,
            isCurrentUser: u._id.toString() === req.user._id.toString(),
        }));

        res.json({ success: true, leaderboard });
    } catch (err) {
        next(err);
    }
};

module.exports = { getMySubmissions, getProgress, getLeaderboard };
