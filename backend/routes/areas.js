// routes/areas.js
const express = require('express');
const areaController = require('../controllers/areaController');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Routes pour les zones (réservées aux Bishops et Administrateurs)
const areaRoles = ['Bishop', 'Governor'];

// GET /api/areas
router.get('/', requireRole(areaRoles), areaController.getAreas);

// GET /api/areas/:id
router.get('/:id', requireRole(areaRoles), areaController.getAreaById);

// POST /api/areas
router.post('/', requireRole(areaRoles), areaController.createArea);

// PUT /api/areas/:id
router.put('/:id', requireRole(areaRoles), areaController.updateArea);

// DELETE /api/areas/:id
router.delete('/:id', requireRole(areaRoles), areaController.deleteArea);

// POST /api/areas/assign
router.post('/assign', requireRole(areaRoles), areaController.assignAreaToUser);

// GET /api/areas/:id/leaders
router.get('/:id/leaders', requireRole(areaRoles), areaController.getAreaLeaders);

module.exports = router;