// routes/callLogs.js
const express = require('express');
const callLogController = require('../controllers/callLogController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/call-logs
router.get('/', callLogController.getCallLogs);

// POST /api/call-logs
router.post('/', callLogController.createCallLog);

// GET /api/call-logs/:id
router.get('/:id', callLogController.getCallLogById);

// PUT /api/call-logs/:id
router.put('/:id', callLogController.updateCallLog);

// DELETE /api/call-logs/:id
router.delete('/:id', callLogController.deleteCallLog);

module.exports = router;