// routes/ministryRoutes.js
const express = require('express');
const router = express.Router();
const ministryController = require('../controllers/ministryController');
const { authMiddleware } = require('../middleware/auth');

// Protection globale (authentification requise)
router.use(authMiddleware);

// Routes
router.get('/', ministryController.getAllMinistries);
router.post('/', ministryController.createMinistry);
router.delete('/:id', ministryController.deleteMinistry);
router.get('/:id/members', ministryController.getMinistryMembers);

// Gestion des présences
router.get('/overview', ministryController.getMinistriesAttendanceOverview);
router.post('/:id/attendance', ministryController.markAttendance);
router.get('/:id/attendance/stats', ministryController.getMinistryAttendanceStats);
router.post('/headcounts', ministryController.saveHeadcounts);

module.exports = router;
