// routes/ministryRoutes.js
const express = require('express');
const router = express.Router();
const ministryController = require('../controllers/ministryController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protection globale (authentification requise)
router.use(authenticateToken);

// Routes
router.get('/', ministryController.getAllMinistries);
router.post('/', ministryController.createMinistry);
router.delete('/:id', ministryController.deleteMinistry);
router.get('/:id/members', ministryController.getMinistryMembers);

// Gestion des présences
router.post('/:id/attendance', ministryController.markAttendance);
router.get('/:id/attendance/stats', ministryController.getMinistryAttendanceStats);

module.exports = router;
