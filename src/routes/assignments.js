const express = require('express');
const router = express.Router();
const {
    getAssignments,
    getAssignment,
    getSampleData,
    createAssignment,
    updateAssignment,
    deleteAssignment,
} = require('../controllers/assignmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getAssignments).post(adminOnly, createAssignment);
router.get('/:id/sample-data', getSampleData);
router
    .route('/:id')
    .get(getAssignment)
    .put(adminOnly, updateAssignment)
    .delete(adminOnly, deleteAssignment);

module.exports = router;
