// routes/auth.js
const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/verify
router.get('/verify', authMiddleware, authController.verifyToken);

// POST /api/auth/change-password
router.post('/change-password', authMiddleware, authController.changePassword);

// POST /api/auth/logout
router.post('/logout', authController.logout);

module.exports = router;