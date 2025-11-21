// routes/notifications.js
const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

// GET /api/notifications
router.get('/', notificationController.getMyNotifications);

// PUT /api/notifications/read-all
router.put('/read-all', notificationController.markAllAsRead);

// PUT /api/notifications/:id/read
router.put('/:id/read', notificationController.markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
