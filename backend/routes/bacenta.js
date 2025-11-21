// routes/bacenta.js
const express = require('express');
const bacentaController = require('../controllers/bacentaController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/bacenta/meetings
router.get('/meetings', bacentaController.getBacentaMeetings);

// POST /api/bacenta/meetings
router.post('/meetings', bacentaController.createBacentaMeeting);

// GET /api/bacenta/meetings/:id
router.get('/meetings/:id', bacentaController.getBacentaMeetingById);

// PUT /api/bacenta/meetings/:id
router.put('/meetings/:id', bacentaController.updateBacentaMeeting);

// DELETE /api/bacenta/meetings/:id
router.delete('/meetings/:id', bacentaController.deleteBacentaMeeting);

// POST /api/bacenta/:meetingId/attendance
router.post('/:meetingId/attendance', bacentaController.markBacentaAttendance);

// POST /api/bacenta/:meetingId/offerings
router.post('/:meetingId/offerings', bacentaController.addBacentaOfferings);

// PUT /api/bacenta/meetings/:id/verify
router.put('/meetings/:id/verify', bacentaController.verifyBacentaMeeting);

// GET /api/bacenta/stats
router.get('/stats', bacentaController.getBacentaStats);
// routes/bacenta.js - Importer Multer


// GET /api/bacenta/members
router.get('/members', bacentaController.getBacentaMembers);

// PUT /api/bacenta/meetings/:id/photo - Uploader une photo pour une réunion
router.put('/meetings/:id/photo', upload.single('photo'), bacentaController.uploadBacentaMeetingPhoto);
module.exports = router;