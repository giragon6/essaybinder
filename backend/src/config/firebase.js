const admin = require('firebase-admin');
const { encryptRefreshToken, decryptRefreshToken } = require('../utils/encryption');

const initFirebase = () => { 
  return null //test

  if (!admin.apps.length) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }
  return admin;
};

const getFirestore = () => {
  const adminInstance = initFirebase();
  return adminInstance.firestore();
};

const storeUserToken = async (userId, token) => {
  try {
    const db = getFirestore();
    
    const encryptedRefreshToken = encryptRefreshToken(token.refresh_token);
    
    await db.collection('users').doc(userId).set({
      encryptedRefreshToken,
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error storing user token:', error);
    throw error;
  }
};

const getUserToken = async (userId) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.encryptedRefreshToken) {
        const refreshToken = decryptRefreshToken(userData.encryptedRefreshToken);
        return { refreshToken };
      }
    } 
    return null;
  } catch (error) {
    console.error('Error getting user token:', error);
    return null;
  }
};

module.exports = {
  initFirebase,
  getFirestore,
  storeUserToken,
  getUserToken,
  encryptRefreshToken,
  decryptRefreshToken,
  admin: () => initFirebase()
};