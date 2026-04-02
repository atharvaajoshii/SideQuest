const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Create task (protected)
router.post('/', authMiddleware, taskController.createTask);

// Get all tasks (public, filtered)
router.get('/', taskController.getTasks);

// Get recommended tasks for current user (protected)
router.get('/feed/recommended', authMiddleware, taskController.getRecommendedTasks);

// Get my posted tasks (protected)
router.get('/my-tasks', authMiddleware, taskController.getMyTasks);

// Get tasks I'm working on as freelancer (protected)
router.get('/my-work', authMiddleware, taskController.getMyAcceptedTasks);

// Update task price from negotiation (protected, must own task) — MUST be before /:id
router.post('/update-price', authMiddleware, taskController.updateTaskPriceFromNegotiation);

// Get single task
router.get('/:id', taskController.getTaskById);

// Update task (protected, must own task)
router.put('/:id', authMiddleware, taskController.updateTask);

// Delete task (protected, must own task)
router.delete('/:id', authMiddleware, taskController.deleteTask);

// Toggle task visibility (protected, must own task)
router.patch('/:id/visibility', authMiddleware, taskController.toggleTaskVisibility);

module.exports = router;