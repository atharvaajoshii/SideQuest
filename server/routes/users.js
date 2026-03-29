const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/users/me - Get current user profile (protected)
router.get('/me', authMiddleware, userController.getCurrentUser);

// PUT /api/users/me - Update current user (protected)
router.put('/me', authMiddleware, userController.updateCurrentUser);

// POST /api/users/change-password - Change password (protected)
router.post('/change-password', authMiddleware, userController.changePassword);

// GET /api/users/stats - Get user statistics (protected, admin)
router.get('/stats', authMiddleware, userController.getUserStats);

// GET /api/users - Get all users (protected, admin)
router.get('/', authMiddleware, userController.getAllUsers);

// GET /api/users/:id - Get user by ID (public) - MUST be before other /:id routes
router.get('/:id', userController.getUserById);

// PUT /api/users/:id/role - Update user role (protected, admin)
router.put('/:id/role', authMiddleware, userController.updateUserRole);

// PUT /api/users/:id/toggle-status - Toggle user status (protected, admin)
router.put('/:id/toggle-status', authMiddleware, userController.toggleUserStatus);

// DELETE /api/users/:id - Delete user (protected, admin)
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
