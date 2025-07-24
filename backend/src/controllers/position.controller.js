const admin = require('firebase-admin');
const db = admin.firestore();

const getPositions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const positionDoc = await db.collection('positions').doc(userId).get();
    
    if (positionDoc.exists) {
      const data = positionDoc.data();
      res.json({ positions: data.positions || {} });
    } else {
      res.json({ positions: {} });
    }
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
};

const savePositions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { positions } = req.body;
    
    if (!positions || typeof positions !== 'object') {
      return res.status(400).json({ error: 'Invalid positions data' });
    }
    
    await db.collection('positions').doc(userId).set({
      positions,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving positions:', error);
    res.status(500).json({ error: 'Failed to save positions' });
  }
};

module.exports = {
  getPositions,
  savePositions
};
