// routes/members.js
const express = require('express');
const memberController = require('../controllers/memberController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configuration spécifique de multer pour l'import (permet CSV/Excel)
const importStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, '..', 'uploads/imports');
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        cb(null, `import-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const importUpload = multer({ storage: importStorage });

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/members
router.get('/', memberController.getMembers);

// GET /api/members/:id
router.get('/:id', memberController.getMemberById);

// POST /api/members
router.post('/', requireRole(['Bishop', 'Assisting_Overseer', 'Governor', 'Area_Pastor', 'Data_Clerk', 'Bacenta_Leader']), memberController.createMember);

// PUT /api/members/bulk-assign
router.put('/bulk-assign', requireRole(['Bishop', 'Assisting_Overseer', 'Governor']), memberController.bulkAssign);

// PUT /api/members/:id
router.put('/:id', requireRole(['Bishop', 'Assisting_Overseer', 'Governor', 'Area_Pastor', 'Data_Clerk', 'Bacenta_Leader']), memberController.updateMember);

// DELETE /api/members/:id
router.delete('/:id', requireRole(['Bishop', 'Assisting_Overseer']), memberController.deleteMember);

// POST /api/members/import - Import members from CSV file
router.post('/import', requireRole(['Bishop', 'Assisting_Overseer', 'Governor', 'Area_Pastor', 'Data_Clerk', 'Bacenta_Leader']), importUpload.single('file'), memberController.importMembers);

// POST /api/members/:id/photo
router.post('/:id/photo', upload.single('photo'), memberController.uploadPhoto);

module.exports = router;