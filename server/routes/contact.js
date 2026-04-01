const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route - anyone can submit a contact message
router.post('/', contactController.submitContactMessage);

// Admin-only routes
router.get('/', authMiddleware, contactController.getAllMessages);
router.get('/stats', authMiddleware, contactController.getStats);
router.get('/:id', authMiddleware, contactController.getMessageById);
router.put('/:id', authMiddleware, contactController.updateMessageStatus);
router.delete('/:id', authMiddleware, contactController.deleteMessage);

module.exports = router;
