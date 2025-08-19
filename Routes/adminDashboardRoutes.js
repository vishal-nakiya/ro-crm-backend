const express = require('express');
const router = express.Router();
const adminDashboardController = require('../http/Controllers/adminDashboardController');
const authMiddleware = require('../http/middlewares/authMiddleware');

// Route to get admin dashboard KPIs (requires admin authentication)
router.get('/kpis', authMiddleware, adminDashboardController().getDashboardKPIs);

// Route to get detailed analytics with optional date filtering (requires admin authentication)
router.get('/analytics', authMiddleware, adminDashboardController().getDetailedAnalytics);

module.exports = router;
