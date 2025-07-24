const { google } = require('googleapis');
const { getGoogleAuthClient } = require('../utils/googleAuth');

const getEssays = async (req, res) => {
  try {
    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // First, get or create the Essay Binder label to get its ID
      const essayBinderLabel = await getOrCreateEssayBinderLabel(oauth2Client);
      const labelId = essayBinderLabel.id;

      // Query Drive for all documents with our Essay Binder label
      const searchResponse = await drive.files.list({
        q: `labels:'${labelId}' and mimeType='application/vnd.google-apps.document' and trashed=false`,
        fields: 'files(id,name,createdTime,modifiedTime,labelInfo,labels)',
        includeLabels: 'labelInfo,labels',
        pageSize: 100 // Adjust as needed
      });

      const files = searchResponse.data.files || [];

      // Enrich each file with content stats and extract tags
      const essays = await Promise.all(
        files.map(async (file) => {
          try {
            // Get document content as plain text for stats calculation
            const contentResponse = await drive.files.export({
              fileId: file.id,
              mimeType: 'text/plain'
            });

            const stats = calculateStatsFromText(contentResponse.data);
            
            // Extract tags from the Essay Binder label
            let tags = [];
            if (file.labelInfo && file.labelInfo.labels) {
              const labelData = file.labelInfo.labels[labelId];
              if (labelData && labelData.fields) {
                const tagField = labelData.fields[ESSAY_BINDER_LABEL.fields.tags];
                if (tagField && tagField.textValue) {
                  tags = tagField.textValue.split(',').map(t => t.trim()).filter(t => t);
                }
              }
            }

            return {
              id: `essay_${file.id}`, // Generate consistent ID
              googleDocId: file.id,
              title: file.name,
              tags: tags,
              createdDate: file.createdTime,
              lastModified: file.modifiedTime,
              dateAdded: file.createdTime, // Use creation time as fallback
              addedVia: 'label-query', // Indicate this was found via label query
              ...stats
            };
          } catch (error) {
            console.error(`Error processing file ${file.id}:`, error);
            // Return basic info if content can't be fetched
            return {
              id: `essay_${file.id}`,
              googleDocId: file.id,
              title: file.name,
              tags: [],
              createdDate: file.createdTime,
              lastModified: file.modifiedTime,
              dateAdded: file.createdTime,
              addedVia: 'label-query',
              characterCount: 0,
              wordCount: 0
            };
          }
        })
      );

      res.json({ essays });
    } catch (driveError) {
      console.error('Drive API Error:', driveError);
      res.status(500).json({ error: 'Failed to fetch essays from Drive' });
    }
  } catch (error) {
    console.error('Error getting essays:', error);
    res.status(500).json({ error: 'Failed to get essays' });
  }
};

const addEssayByFileId = async (req, res) => {
  try {
    const { fileId, fileName } = req.body;
    
    if (!fileId) {
      return res.status(400).json({ error: 'Google Docs file ID is required' });
    }

    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Verify access to the file and get metadata
      const fileInfo = await drive.files.get({
        fileId: fileId,
        includeLabels: 'id,name,createdTime,modifiedTime,mimeType,labelInfo,labels'
      });

      if (fileInfo.data.mimeType !== 'application/vnd.google-apps.document') {
        return res.status(400).json({ error: 'Selected file must be a Google Docs document' });
      }

      // Get or create the Essay Binder label
      const essayBinderLabel = await getOrCreateEssayBinderLabel(oauth2Client);

      // Check if the document already has our label applied
      const existingLabel = fileInfo.data.labelInfo?.labels?.[essayBinderLabel.id];
      if (existingLabel) {
        return res.status(400).json({ error: 'Essay is already in your collection' });
      }

      // Get document content as plain text for stats calculation
      const contentResponse = await drive.files.export({
        fileId: fileId,
        mimeType: 'text/plain'
      });

      const stats = calculateStatsFromText(contentResponse.data);

      // Apply the Essay Binder label with initial metadata
      await drive.files.modifyLabels({
        fileId: fileId,
        requestBody: {
          labelModifications: [{
            labelId: essayBinderLabel.id,
            fieldModifications: [
              {
                fieldId: ESSAY_BINDER_LABEL.fields.wordCount,
                setIntegerValues: [stats.wordCount]
              },
              {
                fieldId: ESSAY_BINDER_LABEL.fields.characterCount,
                setIntegerValues: [stats.characterCount]
              },
              {
                fieldId: ESSAY_BINDER_LABEL.fields.tags,
                setTextValues: [''] // Start with empty tags
              }
            ]
          }]
        }
      });

      const essayData = {
        id: `essay_${fileId}`,
        googleDocId: fileId,
        title: fileInfo.data.name,
        tags: [],
        createdDate: fileInfo.data.createdTime,
        lastModified: fileInfo.data.modifiedTime,
        dateAdded: new Date().toISOString(),
        addedVia: 'file-picker',
        ...stats
      };

      res.json({
        message: 'Essay added successfully via File Picker',
        essay: essayData
      });

    } catch (googleError) {
      console.error('Google API Error:', googleError);
      
      if (googleError.code === 404) {
        return res.status(404).json({ 
          error: 'Document not found or access denied. Please ensure the file is accessible.' 
        });
      }
      
      if (googleError.code === 403) {
        return res.status(403).json({ 
          error: 'Access denied. You may need to re-authenticate with proper permissions.' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to access Google document. Please try again.' 
      });
    }

  } catch (error) {
    console.error('Error adding essay by file ID:', error);
    res.status(500).json({ error: 'Failed to add essay' });
  }
};

const addEssayByUrl = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'Google Docs URL is required' });
    }

    const docIdMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (!docIdMatch) {
      return res.status(400).json({ error: 'Invalid Google Docs URL' });
    }
    
    const googleDocId = docIdMatch[1];

    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      const fileInfo = await drive.files.get({
        fileId: googleDocId,
        includeLabels: 'id,name,createdTime,modifiedTime,mimeType,labelInfo,labels'
      });

      if (fileInfo.data.mimeType !== 'application/vnd.google-apps.document') {
        return res.status(400).json({ error: 'URL must be a Google Docs document' });
      }

      // Get or create the Essay Binder label
      const essayBinderLabel = await getOrCreateEssayBinderLabel(oauth2Client);

      // Check if the document already has our label applied
      const existingLabel = fileInfo.data.labelInfo?.labels?.[essayBinderLabel.id];
      if (existingLabel) {
        return res.status(400).json({ error: 'Essay is already in your collection' });
      }

      // Get document content as plain text for stats calculation
      const contentResponse = await drive.files.export({
        fileId: googleDocId,
        mimeType: 'text/plain'
      });

      const stats = calculateStatsFromText(contentResponse.data);

      // Apply the Essay Binder label with initial metadata
      await drive.files.modifyLabels({
        fileId: googleDocId,
        requestBody: {
          labelModifications: [{
            labelId: essayBinderLabel.id,
            fieldModifications: [
              {
                fieldId: ESSAY_BINDER_LABEL.fields.wordCount,
                setIntegerValues: [stats.wordCount]
              },
              {
                fieldId: ESSAY_BINDER_LABEL.fields.characterCount,
                setIntegerValues: [stats.characterCount]
              },
              {
                fieldId: ESSAY_BINDER_LABEL.fields.tags,
                setTextValues: [''] // Start with empty tags
              }
            ]
          }]
        }
      });

      const essayData = {
        id: `essay_${googleDocId}`,
        googleDocId,
        title: fileInfo.data.name,
        tags: [],
        createdDate: fileInfo.data.createdTime,
        lastModified: fileInfo.data.modifiedTime,
        dateAdded: new Date().toISOString(),
        addedVia: 'url',
        ...stats
      };

      res.json({
        message: 'Essay added successfully',
        essay: essayData
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
    
    // Extract Google Doc ID from essay ID
    const googleDocId = essayId.replace('essay_', '');
    
    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }
    
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Get or create the Essay Binder label to get its ID
      const essayBinderLabel = await getOrCreateEssayBinderLabel(oauth2Client);

      // Remove the Essay Binder label from the document
      await drive.files.modifyLabels({
        fileId: googleDocId,
        requestBody: {
          labelModifications: [{
            labelId: essayBinderLabel.id,
            removeLabel: true
          }]
        }
      });

      res.json({ success: true, message: 'Essay removed from catalog' });
    } catch (driveError) {
      console.error('Drive API Error:', driveError);
      
      if (driveError.code === 404) {
        return res.status(404).json({ error: 'Essay not found' });
      }
      
      res.status(500).json({ error: 'Failed to remove essay from catalog' });
    }
  } catch (error) {
    console.error('Error removing essay:', error);
    res.status(500).json({ error: 'Failed to remove essay' });
  }
};

const addDriveLabelToEssay = async (req, res) => {
  try {
    const { essayId } = req.params;
    const { labelId, fieldId, value } = req.body;
    const userId = req.user.userId;

    const userEssays = userEssayCache.get(userId) || [];
    const essay = userEssays.find(e => e.id === essayId);
    
    if (!essay) {
      return res.status(404).json({ error: 'Essay not found' });
    }

    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Apply label to the Google Drive file
      await drive.files.modifyLabels({
        fileId: essay.googleDocId,
        requestBody: {
          labelModifications: [{
            labelId: labelId,
            fieldModifications: [{
              fieldId: fieldId,
              setTextValues: [value]
            }]
          }]
        }
      });

      // Refresh the essay data to get updated labels
      const fileInfo = await drive.files.get({
        fileId: essay.googleDocId,
        includeLabels: 'labelInfo,labels'
      });

      const driveLabels = extractLabelsFromFileInfo(fileInfo.data);

      // Update cache
      essay.driveLabels = driveLabels;
      userEssayCache.set(userId, userEssays);

      res.json({ success: true, message: 'Drive label added successfully', driveLabels });
    } catch (driveError) {
      console.error('Drive label error:', driveError);
      res.status(500).json({ error: 'Failed to add Drive label' });
    }
  } catch (error) {
    console.error('Error adding Drive label:', error);
    res.status(500).json({ error: 'Failed to add Drive label' });
  }
};

const removeDriveLabelFromEssay = async (req, res) => {
  try {
    const { essayId } = req.params;
    const { labelId, fieldId } = req.body;
    const userId = req.user.userId;

    const userEssays = userEssayCache.get(userId) || [];
    const essay = userEssays.find(e => e.id === essayId);
    
    if (!essay) {
      return res.status(404).json({ error: 'Essay not found' });
    }

    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Remove label from the Google Drive file
      await drive.files.modifyLabels({
        fileId: essay.googleDocId,
        requestBody: {
          labelModifications: [{
            labelId: labelId,
            fieldModifications: [{
              fieldId: fieldId,
              unsetValues: true
            }]
          }]
        }
      });

      // Refresh the essay data to get updated labels
      const fileInfo = await drive.files.get({
        fileId: essay.googleDocId,
        includeLabels: 'labelInfo,labels'
      });

      const driveLabels = extractLabelsFromFileInfo(fileInfo.data);

      // Update cache
      essay.driveLabels = driveLabels;
      userEssayCache.set(userId, userEssays);

      res.json({ success: true, message: 'Drive label removed successfully', driveLabels });
    } catch (driveError) {
      console.error('Drive label error:', driveError);
      res.status(500).json({ error: 'Failed to remove Drive label' });
    }
  } catch (error) {
    console.error('Error removing Drive label:', error);
    res.status(500).json({ error: 'Failed to remove Drive label' });
  }
};

const getHealthCheck = (req, res) => {
  res.json({ status: 'OK', message: 'Drive-native essay service online' });
};

// Configuration for the standard Essay Binder label
const ESSAY_BINDER_LABEL = {
  name: 'Essay Binder',
  fields: {
    wordCount: 'word_count',
    characterCount: 'character_count', 
    tags: 'tags'
  }
};

// Get or create the standard Essay Binder label
const getOrCreateEssayBinderLabel = async (oauth2Client) => {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const driveLabels = google.drivelabels({ version: 'v2', auth: oauth2Client });
  
  try {
    // First, try to find existing Essay Binder label
    const response = await driveLabels.labels.list({
      view: 'LABEL_VIEW_FULL',
      useAdminAccess: false  // Explicitly disable admin access
    });

    const existingLabel = response.data.labels?.find(
      label => label.properties?.title === ESSAY_BINDER_LABEL.name
    );

    if (existingLabel) {
      return existingLabel;
    }

    // Create the label if it doesn't exist
    const newLabel = await driveLabels.labels.create({
      useAdminAccess: false,  // Explicitly disable admin access
      requestBody: {
        labelType: 'USER',  // Back to USER since SHARED is in closed beta
        properties: {
          title: ESSAY_BINDER_LABEL.name,
          description: 'Essay metadata managed by Essay Binder app'
        },
        fields: [
          {
            id: ESSAY_BINDER_LABEL.fields.wordCount,
            valueType: 'INTEGER',
            properties: {
              displayName: 'Word Count'
            }
          },
          {
            id: ESSAY_BINDER_LABEL.fields.characterCount,
            valueType: 'INTEGER', 
            properties: {
              displayName: 'Character Count'
            }
          },
          {
            id: ESSAY_BINDER_LABEL.fields.tags,
            valueType: 'TEXT',
            properties: {
              displayName: 'Tags'
            }
          }
        ]
      }
    });

    return newLabel.data;
  } catch (error) {
    console.error('Error getting/creating Essay Binder label:', error);
    throw error;
  }
};

// Update essay metadata using the standard label
const updateEssayMetadata = async (req, res) => {
  try {
    const { essayId } = req.params;
    const { wordCount, characterCount, tags } = req.body;

    // Extract Google Doc ID from essay ID
    const googleDocId = essayId.replace('essay_', '');

    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Get or create the Essay Binder label
      const label = await getOrCreateEssayBinderLabel(oauth2Client);

      // Prepare field modifications
      const fieldModifications = [];

      if (wordCount !== undefined) {
        fieldModifications.push({
          fieldId: ESSAY_BINDER_LABEL.fields.wordCount,
          setIntegerValues: [parseInt(wordCount)]
        });
      }

      if (characterCount !== undefined) {
        fieldModifications.push({
          fieldId: ESSAY_BINDER_LABEL.fields.characterCount,
          setIntegerValues: [parseInt(characterCount)]
        });
      }

      if (tags !== undefined) {
        // Convert tags array to comma-separated string
        const tagsString = Array.isArray(tags) ? tags.join(', ') : tags;
        fieldModifications.push({
          fieldId: ESSAY_BINDER_LABEL.fields.tags,
          setTextValues: [tagsString]
        });
      }

      // Apply label modifications to the Google Drive file
      if (fieldModifications.length > 0) {
        await drive.files.modifyLabels({
          fileId: googleDocId,
          requestBody: {
            labelModifications: [{
              labelId: label.id,
              fieldModifications: fieldModifications
            }]
          }
        });
      }

      res.json({ 
        success: true, 
        message: 'Essay metadata updated successfully'
      });
    } catch (driveError) {
      console.error('Drive label error:', driveError);
      res.status(500).json({ error: 'Failed to update essay metadata' });
    }
  } catch (error) {
    console.error('Error updating essay metadata:', error);
    res.status(500).json({ error: 'Failed to update essay metadata' });
  }
};

// Add tag to essay
const addTagToEssay = async (req, res) => {
  try {
    const { essayId } = req.params;
    const { tag } = req.body;

    if (!tag || !tag.trim()) {
      return res.status(400).json({ error: 'Tag is required' });
    }

    // Extract Google Doc ID from essay ID
    const googleDocId = essayId.replace('essay_', '');

    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Get or create the Essay Binder label
      const essayBinderLabel = await getOrCreateEssayBinderLabel(oauth2Client);

      // Get current tags from Drive label
      const fileInfo = await drive.files.get({
        fileId: googleDocId,
        includeLabels: 'labelInfo'
      });

      let currentTags = [];
      const labelData = fileInfo.data.labelInfo?.labels?.[essayBinderLabel.id];
      
      if (labelData && labelData.fields) {
        const tagField = labelData.fields[ESSAY_BINDER_LABEL.fields.tags];
        if (tagField && tagField.textValue) {
          currentTags = tagField.textValue.split(',').map(t => t.trim()).filter(t => t);
        }
      }

      // Add new tag if not already present
      const newTag = tag.trim();
      if (!currentTags.includes(newTag)) {
        currentTags.push(newTag);
      }

      // Update tags field
      await drive.files.modifyLabels({
        fileId: googleDocId,
        requestBody: {
          labelModifications: [{
            labelId: essayBinderLabel.id,
            fieldModifications: [{
              fieldId: ESSAY_BINDER_LABEL.fields.tags,
              setTextValues: [currentTags.join(', ')]
            }]
          }]
        }
      });

      res.json({ 
        success: true, 
        message: 'Tag added successfully',
        tags: currentTags
      });
    } catch (driveError) {
      console.error('Drive tag error:', driveError);
      res.status(500).json({ error: 'Failed to add tag' });
    }
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'Failed to add tag' });
  }
};

// Remove tag from essay
const removeTagFromEssay = async (req, res) => {
  try {
    const { essayId } = req.params;
    const { tag } = req.body;

    if (!tag || !tag.trim()) {
      return res.status(400).json({ error: 'Tag is required' });
    }

    // Extract Google Doc ID from essay ID
    const googleDocId = essayId.replace('essay_', '');

    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      // Get or create the Essay Binder label
      const essayBinderLabel = await getOrCreateEssayBinderLabel(oauth2Client);

      // Get current tags from Drive label
      const fileInfo = await drive.files.get({
        fileId: googleDocId,
        includeLabels: 'labelInfo'
      });

      let currentTags = [];
      const labelData = fileInfo.data.labelInfo?.labels?.[essayBinderLabel.id];
      
      if (labelData && labelData.fields) {
        const tagField = labelData.fields[ESSAY_BINDER_LABEL.fields.tags];
        if (tagField && tagField.textValue) {
          currentTags = tagField.textValue.split(',').map(t => t.trim()).filter(t => t);
        }
      }

      // Remove tag
      const tagToRemove = tag.trim();
      currentTags = currentTags.filter(t => t !== tagToRemove);

      // Update tags field
      await drive.files.modifyLabels({
        fileId: googleDocId,
        requestBody: {
          labelModifications: [{
            labelId: essayBinderLabel.id,
            fieldModifications: [{
              fieldId: ESSAY_BINDER_LABEL.fields.tags,
              setTextValues: [currentTags.join(', ')]
            }]
          }]
        }
      });

      res.json({ 
        success: true, 
        message: 'Tag removed successfully',
        tags: currentTags
      });
    } catch (driveError) {
      console.error('Drive tag error:', driveError);
      res.status(500).json({ error: 'Failed to remove tag' });
    }
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
};

const getAvailableLabels = async (req, res) => {
  try {
    let oauth2Client;
    try {
      oauth2Client = getGoogleAuthClient(req);
    } catch (error) {
      return res.status(401).json({ error: 'No valid Google authentication found. Please re-authenticate.' });
    }

    const driveLabels = google.drivelabels({ version: 'v2', auth: oauth2Client });

    try {
      // Get available Drive labels for the user
      const response = await driveLabels.labels.list({
        view: 'LABEL_VIEW_FULL',
        useAdminAccess: false  // Explicitly disable admin access
      });

      const labels = response.data.labels || [];
      
      // Filter and format labels for frontend use
      const formattedLabels = labels
        .filter(label => label.labelType === 'USER')  // Only USER labels since SHARED is in closed beta
        .map(label => ({
          id: label.id,
          name: label.properties?.title || label.name,
          fields: label.fields ? Object.values(label.fields).map(field => ({
            id: field.id,
            displayName: field.properties?.displayName || field.id,
            valueType: field.valueType,
            options: field.selectionOptions?.choices ? 
              Object.values(field.selectionOptions.choices).map(choice => ({
                id: choice.id,
                displayName: choice.properties?.displayName || choice.id
              })) : null
          })) : []
        }));

      res.json({ labels: formattedLabels });
    } catch (driveError) {
      console.error('Drive labels fetch error:', driveError);
      res.status(500).json({ error: 'Failed to fetch Drive labels' });
    }
  } catch (error) {
    console.error('Error fetching Drive labels:', error);
    res.status(500).json({ error: 'Failed to fetch Drive labels' });
  }
};

// Helper function to calculate stats from plain text
function calculateStatsFromText(textContent) {
  if (!textContent || typeof textContent !== 'string') {
    return { characterCount: 0, wordCount: 0 };
  }
  
  const characterCount = textContent.length;
  const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  return { characterCount, wordCount };
}

// Helper function to extract Drive labels from file info
function extractLabelsFromFileInfo(fileData) {
  const labels = [];
  
  // Extract custom labels if available
  if (fileData.labelInfo && fileData.labelInfo.labels) {
    for (const [labelId, labelData] of Object.entries(fileData.labelInfo.labels)) {
      if (labelData.fields) {
        // Extract label fields - this will depend on your label schema
        Object.entries(labelData.fields).forEach(([fieldId, fieldValue]) => {
          if (fieldValue.textValue) {
            labels.push({
              labelId,
              fieldId,
              value: fieldValue.textValue,
              type: 'custom'
            });
          }
        });
      }
    }
  }
  
  // Extract built-in labels if available
  if (fileData.labels) {
    Object.entries(fileData.labels).forEach(([key, value]) => {
      if (value === true) {
        labels.push({
          labelId: key,
          value: key,
          type: 'builtin'
        });
      }
    });
  }
  
  return labels;
}

module.exports = {
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
};
