const express = require('express');
const router = express.Router();
const { authenticateSession } = require('../middleware/auth.middleware');
const { 
  getEssays, 
  getHealthCheck, 
  getAvailableLabels,
  addEssayByUrl, 
  addEssayByFileId, 
  removeEssay, 
  addDriveLabelToEssay,
  removeDriveLabelFromEssay,
  updateEssayMetadata,
  addTagToEssay,
  removeTagFromEssay
} = require('../controllers/essay.controller');
  
router.get('/', authenticateSession, getEssays);
router.get('/health', getHealthCheck);
router.get('/labels', authenticateSession, getAvailableLabels);
router.post('/add', authenticateSession, addEssayByUrl);
router.post('/add-by-file', authenticateSession, addEssayByFileId);
router.delete('/:essayId', authenticateSession, removeEssay);

// Drive-native label management
router.post('/:essayId/drive-labels', authenticateSession, addDriveLabelToEssay);
router.delete('/:essayId/drive-labels', authenticateSession, removeDriveLabelFromEssay);

// Essay Binder standardized label management
router.put('/:essayId/metadata', authenticateSession, updateEssayMetadata);
router.post('/:essayId/tags', authenticateSession, addTagToEssay);
router.delete('/:essayId/tags', authenticateSession, removeTagFromEssay);

module.exports = router;