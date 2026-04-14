const express = require('express');
const router = express.Router();
const overseeController = require('../controllers/overseeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Only Bishop can manage oversees
router.use(authMiddleware);
router.use(roleMiddleware('Bishop'));

router.post('/', overseeController.createOversee);
router.get('/', overseeController.getAllOversees);
router.put('/:id', overseeController.updateOversee);
router.delete('/:id', overseeController.deleteOversee);

module.exports = router;
