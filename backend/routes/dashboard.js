// routes/dashboard.js
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/dashboard
router.get('/', dashboardController.getLeaderDashboard);

// GET /api/dashboard/area/:area_id/stats
router.get('/area/:area_id/stats', dashboardController.getAreaStats);

// GET /api/dashboard/leader/:leader_id/stats
router.get('/leader/:leader_id/stats', dashboardController.getLeaderStats);

module.exports = router;