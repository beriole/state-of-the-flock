// routes/members.js
const express = require('express');
const memberController = require('../controllers/memberController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/members
router.get('/', memberController.getMembers);

// GET /api/members/:id
router.get('/:id', memberController.getMemberById);

// POST /api/members
router.post('/', requireRole(['Bishop', 'Assisting_Overseer', 'Governor', 'Area_Pastor', 'Data_Clerk', 'Bacenta_Leader']), memberController.createMember);

// PUT /api/members/:id
router.put('/:id', requireRole(['Bishop', 'Assisting_Overseer', 'Governor', 'Area_Pastor', 'Data_Clerk', 'Bacenta_Leader']), memberController.updateMember);

// DELETE /api/members/:id
router.delete('/:id', requireRole(['Bishop', 'Assisting_Overseer']), memberController.deleteMember);

// POST /api/members/import - Import members from CSV file
router.post('/import', requireRole(['Bishop', 'Assisting_Overseer', 'Governor', 'Area_Pastor', 'Data_Clerk', 'Bacenta_Leader']), upload.single('file'), memberController.importMembers);

// POST /api/members/:id/photo
router.post('/:id/photo', upload.single('photo'), memberController.uploadPhoto);

module.exports = router;