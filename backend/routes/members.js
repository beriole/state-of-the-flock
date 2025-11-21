// routes/members.js
const express = require('express');
const memberController = require('../controllers/memberController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/members
router.get('/', memberController.getMembers);

// GET /api/members/:id
router.get('/:id', memberController.getMemberById);

// POST /api/members
router.post('/', requireRole(['Bishop', 'Assisting_Overseer', 'Area_Pastor', 'Data_Clerk', 'Bacenta_Leader']), memberController.createMember);

// PUT /api/members/:id
router.put('/:id', requireRole(['Bishop', 'Assisting_Overseer', 'Area_Pastor', 'Data_Clerk']), memberController.updateMember);

// DELETE /api/members/:id
router.delete('/:id', requireRole(['Bishop', 'Assisting_Overseer']), memberController.deleteMember);

module.exports = router;