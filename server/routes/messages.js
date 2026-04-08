const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/unread-count', messageController.getUnreadCount);
router.get('/conversations', messageController.getConversations);
router.get('/:userId', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.put('/:senderId/read', messageController.markAsRead);

// ⚠️ ORDER MATTERS (IMPORTANT)
router.delete('/conversation/:userId', messageController.deleteConversation);
router.delete('/:id', messageController.deleteMessage);

module.exports = router;