const express = require('express');
const router = express.Router();
const negotiationController = require('../controllers/negotiationController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/negotiations/task/:taskId/all - Get ALL negotiations for a task (poster view)
// MUST be before /task/:taskId to avoid conflict
router.get('/task/:taskId/all', negotiationController.getAllNegotiationsForTask);

// GET /api/negotiations/task/:taskId - Get or create negotiation for a task (freelancer view)
router.get('/task/:taskId', negotiationController.getOrCreateNegotiation);

// GET /api/negotiations/user/:userId - Get negotiation with specific user
// MUST be before /:id to avoid "user" being treated as an ID
router.get('/user/:userId', negotiationController.getNegotiationWithUser);

// GET /api/negotiations/:id - Get negotiation by ID
router.get('/:id', negotiationController.getNegotiationById);

module.exports = router;
