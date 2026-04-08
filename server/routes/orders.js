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

// POST /api/orders/task/:taskId/accept - Accept a freelancer's offer (MUST be before /:id)
router.post('/task/:taskId/accept', orderController.acceptFreelancerOffer);

// POST /api/orders/task/:taskId/apply - Apply for a task (MUST be before /:id)
router.post('/task/:taskId/apply', orderController.applyForTask);

// POST /api/orders/offer/reject - Reject a freelancer's offer
router.post('/offer/reject', orderController.rejectOffer);

// GET /api/orders/task/:taskId/offers - Get all offers for a task (poster only, MUST be before /:id)
router.get('/task/:taskId/offers', orderController.getTaskOffers);

// GET /api/orders/:id - Get order by ID
router.get('/:id', orderController.getOrderById);

// POST /api/orders/:id/complete - Mark order as completed
router.post('/:id/complete', orderController.markOrderCompleted);

module.exports = router;
