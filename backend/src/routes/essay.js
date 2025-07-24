const express = require('express');
const router = express.Router();
const { authenticateSession } = require('../middleware/auth.middleware');
const { getEssays, getHealthCheck, addEssayByUrl, removeEssay, addTagToEssay, removeTagFromEssay, updateEssayTheme } = require('../controllers/essay.controller');
  
router.get('/', authenticateSession, getEssays);
router.get('/health', getHealthCheck); // Remove auth middleware for health check
router.post('/add', authenticateSession, addEssayByUrl);
router.delete('/:essayId', authenticateSession, removeEssay);
router.post('/:essayId/tags', authenticateSession, addTagToEssay);
router.delete('/:essayId/tags', authenticateSession, removeTagFromEssay);
router.put('/:essayId/theme', authenticateSession, updateEssayTheme);

module.exports = router;