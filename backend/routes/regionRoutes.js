// routes/regionRoutes.js
const express = require('express');
const router = express.Router();
const regionController = require('../controllers/regionController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', regionController.getRegions);
router.post('/', regionController.createRegion);
router.put('/:id', regionController.updateRegion);

module.exports = router;
