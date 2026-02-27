const express = require('express');
const router = express.Router();
const { executeSQL, getHintOnly } = require('../controllers/executionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', executeSQL);
router.post('/hint', getHintOnly);

module.exports = router;
