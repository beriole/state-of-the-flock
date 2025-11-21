// routes/dashboard.js
const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/dashboard
router.get('/', dashboardController.getLeaderDashboard);

module.exports = router;