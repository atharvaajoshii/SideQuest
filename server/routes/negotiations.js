const express = require('express');
const router = express.Router();
const negotiationController = require('../controllers/negotiationController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/negotiations/task/:taskId - Get or create negotiation for a task
router.get('/task/:taskId', negotiationController.getOrCreateNegotiation);

module.exports = router;
