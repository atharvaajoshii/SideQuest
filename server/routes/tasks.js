const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Create task (protected)
router.post('/', authMiddleware, taskController.createTask);

// Get all tasks
router.get('/', taskController.getTasks);

// Get single task
router.get('/:id', taskController.getTaskById);

module.exports = router;