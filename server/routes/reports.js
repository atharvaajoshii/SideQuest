const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

// All report routes require authentication
router.use(authMiddleware);

// Submit a new report
router.post('/', reportController.submitReport);

// Get my reports
router.get('/my', reportController.getMyReports);

module.exports = router;
