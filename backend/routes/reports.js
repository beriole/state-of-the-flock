// routes/reports.js
const express = require('express');
const reportController = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/reports/attendance
router.get('/attendance', reportController.getAttendanceReport);

// GET /api/reports/bacenta
router.get('/bacenta', reportController.getBacentaReport);


// GET /api/reports/export
router.get('/export', reportController.exportData);

// GET /api/reports/member-growth
router.get('/member-growth', reportController.getMemberGrowthReport);

// GET /api/reports/governor/attendance
router.get('/governor/attendance', reportController.getGovernorAttendanceReport);

// GET /api/reports/call-logs
router.get('/call-logs', reportController.getCallLogReport);

module.exports = router;