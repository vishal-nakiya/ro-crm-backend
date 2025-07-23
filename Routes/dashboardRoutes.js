const express = require('express');
const router = express.Router();
const dashboardController = require('../http/Controllers/dashboardController');
const mobileMiddleware = require('../http/middlewares/mobileMiddleware');

// Route to get dashboard details (requires authentication)
router.get('/details', mobileMiddleware, dashboardController().dashboardDetails);

module.exports = router; 