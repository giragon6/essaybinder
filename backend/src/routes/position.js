const express = require('express');
const router = express.Router();
const positionController = require('../controllers/position.controller');
const { authenticateSession } = require('../middleware/auth.middleware');

router.get('/', authenticateSession, positionController.getPositions);
router.put('/', authenticateSession, positionController.savePositions);

module.exports = router;
