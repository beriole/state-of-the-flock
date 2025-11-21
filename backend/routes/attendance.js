// routes/attendance.js
const express = require('express');
const attendanceController = require('../controllers/attendanceController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/attendance
router.get('/', attendanceController.getAttendance);

// POST /api/attendance/bulk
router.post('/bulk', attendanceController.bulkAttendance);

// GET /api/attendance/stats/summary
router.get('/stats/summary', attendanceController.getAttendanceStats);

// GET /api/attendance/call-list
router.get('/call-list', attendanceController.generateCallList);

module.exports = router;