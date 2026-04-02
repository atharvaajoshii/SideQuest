const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// GET /api/notifications - Get all notifications
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread-count - Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// PUT /api/notifications/read-all - Mark all notifications as read (MUST be before /:id/read)
router.put('/read-all', notificationController.markAllAsRead);

// PUT /api/notifications/:id/read - Mark a notification as read
router.put('/:id/read', notificationController.markNotificationAsRead);

module.exports = router;
