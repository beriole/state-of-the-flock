// routes/sync.js
const express = require('express');
const syncController = require('../controllers/syncController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// POST /api/sync/sheets
router.post('/sheets', requireRole(['Bishop', 'Data_Clerk']), syncController.syncWithSheets);

// GET /api/sync/logs
router.get('/logs', requireRole(['Bishop', 'Data_Clerk']), syncController.getSyncLogs);

module.exports = router;