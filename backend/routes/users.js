// routes/users.js
const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// GET /api/users
router.get('/', requireRole(['Bishop', 'Assisting_Overseer', 'Governor']), userController.getUsers);

// GET /api/users/:id
router.get('/:id', userController.getUserById);

// POST /api/users
router.post('/', requireRole(['Bishop', 'Assisting_Overseer', 'Governor']), userController.createUser);

// PUT /api/users/settings
router.put('/settings', userController.updateSettings);

// PUT /api/users/:id
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id
router.delete('/:id', requireRole(['Bishop', 'Governor']), userController.deleteUser);

module.exports = router;