const express = require('express');
const router = express.Router();
const { getMySubmissions, getProgress, getLeaderboard } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/me', getMySubmissions);
router.get('/progress', getProgress);
router.get('/leaderboard', getLeaderboard);

module.exports = router;
