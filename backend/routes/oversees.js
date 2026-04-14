const express = require('express');
const router = express.Router();
const overseeController = require('../controllers/overseeController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Only Bishop can manage oversees
router.use(authMiddleware);
const bishopOnly = ['Bishop'];

router.post('/', requireRole(bishopOnly), overseeController.createOversee);
router.get('/', requireRole(bishopOnly), overseeController.getAllOversees);
router.put('/:id', requireRole(bishopOnly), overseeController.updateOversee);
router.delete('/:id', requireRole(bishopOnly), overseeController.deleteOversee);

module.exports = router;
