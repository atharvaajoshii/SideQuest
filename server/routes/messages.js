const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/messages/conversations - Get all conversations
router.get('/conversations', messageController.getConversations);

// GET /api/messages/:userId - Get messages with a specific user
router.get('/:userId', messageController.getMessages);

// POST /api/messages - Send a message
router.post('/', messageController.sendMessage);

// PUT /api/messages/:senderId/read - Mark messages as read
router.put('/:senderId/read', messageController.markAsRead);

// DELETE /api/messages/:id - Delete a single message
router.delete('/:id', messageController.deleteMessage);

// DELETE /api/messages/conversation/:userId - Delete entire conversation
router.delete('/conversation/:userId', messageController.deleteConversation);

module.exports = router;
