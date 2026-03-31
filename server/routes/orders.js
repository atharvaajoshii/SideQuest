const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes are protected
router.use(authMiddleware);

// GET /api/orders - Get all orders for current user
router.get('/', orderController.getUserOrders);

// POST /api/orders - Create new order
router.post('/', orderController.createOrder);

// GET /api/orders/:id - Get order by ID
router.get('/:id', orderController.getOrderById);

// POST /api/orders/:id/complete - Mark order as completed
router.post('/:id/complete', orderController.markOrderCompleted);

module.exports = router;
