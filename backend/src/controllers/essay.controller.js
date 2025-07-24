const { google } = require('googleapis');
const { getFirestore } = require('../config/firebase');
const { getGoogleAuthClient } = require('../utils/googleAuth');
const admin = require('../config/firebase').admin();

const db = getFirestore();
const essaysCollection = db.collection('essays');

const getEssays = async (req, res) => {
  try {
    const snapshot = await essaysCollection
      .where('userId', '==', req.user.userId)
      .orderBy('dateAdded', 'desc')
      .get();
    
    const userEssays = [];
    snapshot.forEach(doc => {
      userEssays.push({ id: doc.id, ...doc.data() });
    });

    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.json({ essays: userEssays });
    }

    const enrichedEssays = await Promise.all(
      userEssays.map(async (essay) => {
        try {
          const docs = google.docs({ version: 'v1', auth: oauth2Client });
          const drive = google.drive({ version: 'v3', auth: oauth2Client });

          const fileInfo = await drive.files.get({
            fileId: essay.googleDocId,
            fields: 'id,name,createdTime,modifiedTime,size'
          });

          const docInfo = await docs.documents.get({
            documentId: essay.googleDocId,
            fields: 'body.content(paragraph(elements(textRun(content))))'
          });

          const stats = calculateStats(docInfo.data);

          await essaysCollection.doc(essay.id).update({
            title: fileInfo.data.name,
            lastModified: fileInfo.data.modifiedTime,
            characterCount: stats.characterCount,
            wordCount: stats.wordCount,
            lastSynced: admin.firestore.FieldValue.serverTimestamp()
          });

          return {
            ...essay,
            title: fileInfo.data.name,
            lastModified: fileInfo.data.modifiedTime,
            createdDate: fileInfo.data.createdTime,
            ...stats
          };
        } catch (error) {
          console.error(`Error fetching metadata for ${essay.googleDocId}:`, error);
          return essay;
        }
      })
    );

    res.json({ essays: enrichedEssays });
  } catch (error) {
    console.error('Error getting essays:', error);
    res.status(500).json({ error: 'Failed to get essays' });
  }
};

const getHealthCheck = (req, res) => {
  res.json({ status: 'OK', message: 'online' });
};

const addEssayByUrl = async (req, res) => {
  try {
    const { url, description } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Google Docs URL is required' });
    }

    const docIdMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (!docIdMatch) {
      return res.status(400).json({ error: 'Invalid Google Docs URL' });
    }
    
    const googleDocId = docIdMatch[1];

    const existingSnapshot = await essaysCollection
      .where('userId', '==', req.user.userId)
      .where('googleDocId', '==', googleDocId)
      .get();
    
    if (!existingSnapshot.empty) {
      return res.status(400).json({ error: 'Essay already exists in your collection' });
    }

    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }
    
    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      const fileInfo = await drive.files.get({
        fileId: googleDocId,
        fields: 'id,name,createdTime,modifiedTime,mimeType'
      });

      if (fileInfo.data.mimeType !== 'application/vnd.google-apps.document') {
        return res.status(400).json({ error: 'URL must be a Google Docs document' });
      }

      const docInfo = await docs.documents.get({
        documentId: googleDocId,
        fields: 'body.content(paragraph(elements(textRun(content))))'
      });

      const stats = calculateStats(docInfo.data);

      const essayData = {
        googleDocId,
        title: fileInfo.data.name,
        description: description || '',
        tags: [],
        createdDate: fileInfo.data.createdTime,
        lastModified: fileInfo.data.modifiedTime,
        userId: req.user.userId,
        dateAdded: admin.firestore.FieldValue.serverTimestamp(),
        lastSynced: admin.firestore.FieldValue.serverTimestamp(),
        ...stats
      };

      const docRef = await essaysCollection.add(essayData);

      res.json({
        message: 'Essay added successfully',
        essay: {
          id: docRef.id,
          ...essayData,
          ...stats
        }
      });

    } catch (googleError) {
      console.error('Google API Error:', googleError);
      
      if (googleError.code === 404) {
        return res.status(404).json({ 
          error: 'Document not found. Please check the URL and ensure you have access to the document.' 
        });
      }
      
      if (googleError.code === 403) {
        return res.status(403).json({ 
          error: 'Access denied. Please ensure the document is shared with you or you are the owner.' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to access Google document. Please try again.' 
      });
    }

  } catch (error) {
    console.error('Error adding essay:', error);
    res.status(500).json({ error: 'Failed to add essay' });
  }
};

const removeEssay = async (req, res) => {
  try {
    const { essayId } = req.params;
    
    const essayDoc = await essaysCollection.doc(essayId).get();
    
    if (!essayDoc.exists || essayDoc.data().userId !== req.user.userId) {
      return res.status(404).json({ error: 'Essay not found' });
    }

    await essaysCollection.doc(essayId).delete();
    
    res.json({ success: true, message: 'Essay removed from catalog' });
  } catch (error) {
    console.error('Error removing essay:', error);
    res.status(500).json({ error: 'Failed to remove essay' });
  }
};

const addTagToEssay = async (req, res) => {
  try {
    const { essayId } = req.params;
    const { tag } = req.body;

    const essayDoc = await essaysCollection.doc(essayId).get();
    
    if (!essayDoc.exists || essayDoc.data().userId !== req.user.userId) {
      return res.status(404).json({ error: 'Essay not found' });
    }

    const essayData = essayDoc.data();
    const currentTags = essayData.tags || [];
    
    if (!currentTags.includes(tag)) {
      await essaysCollection.doc(essayId).update({
        tags: admin.firestore.FieldValue.arrayUnion(tag)
      });
    }

    res.json({ success: true, message: 'Tag added successfully' });
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'Failed to add tag' });
  }
};

const removeTagFromEssay = async (req, res) => {
  try {
    const { essayId } = req.params;
    const { tag } = req.body;

    const essayDoc = await essaysCollection.doc(essayId).get();
    
    if (!essayDoc.exists || essayDoc.data().userId !== req.user.userId) {
      return res.status(404).json({ error: 'Essay not found' });
    }

    await essaysCollection.doc(essayId).update({
      tags: admin.firestore.FieldValue.arrayRemove(tag)
    });

    res.json({ success: true, message: 'Tag removed successfully' });
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
};

const updateEssayTheme = async (req, res) => {
  try {
    const { essayId } = req.params;
    const { theme } = req.body;

    const essayDoc = await essaysCollection.doc(essayId).get();
    
    if (!essayDoc.exists || essayDoc.data().userId !== req.user.userId) {
      return res.status(404).json({ error: 'Essay not found' });
    }

    await essaysCollection.doc(essayId).update({
      theme: theme,
      lastModified: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'Theme updated successfully' });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ error: 'Failed to update theme' });
  }
};

function extractDocId(url) {
  const patterns = [
    /\/document\/d\/([a-zA-Z0-9-_]+)/,                  // normal link
    /\/document\/d\/([a-zA-Z0-9-_]+)\/edit/,            // edit link
    /docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/, // full link
    /^([a-zA-Z0-9-_]+)$/                                // id only
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
}

// Helper function to calculate stats without storing content
function calculateStats(docData) {
  let characterCount = 0;    
  let wordCount = 0;
  
  if (docData.body && docData.body.content) {
    for (const element of docData.body.content) {
      if (element.paragraph) {
        for (const textElement of element.paragraph.elements || []) {
          if (textElement.textRun && textElement.textRun.content) {
            const text = textElement.textRun.content;
            characterCount += text.length;
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            wordCount += words.length;
          }
        }
      }
    }
  }
  
  return { characterCount, wordCount };
}

module.exports = {
  getEssays,
  getHealthCheck,
  addEssayByUrl,
  removeEssay,
  addTagToEssay,
  removeTagFromEssay,
  updateEssayTheme
};