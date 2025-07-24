const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { authenticateSession } = require('../middleware/auth.middleware');
const { storeUserToken, getUserToken } = require('../config/firebase');

router.post('/exchange-code', async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;

    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    });

    const { access_token, id_token, refresh_token } = tokenResponse.data;

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    
    // Decode the token to see its audience before verification
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(id_token);
    
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    if (refresh_token) {
      await storeUserToken(payload.sub, {
        refresh_token
      });
    }
    
    const sessionToken = jwt.sign(
      {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1hr
    });

    res.cookie('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24hr
    });

    res.json({
      success: true,
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      }
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(400).json({ error: 'Token exchange failed' });
  }
});

router.post('/refresh-token', async (req, res) => {
  try {
    const sessionToken = req.cookies.session;
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token' });
    }

    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const userToken = await getUserToken(userId);
    
    if (!userToken || !userToken.refreshToken) {
      return res.status(401).json({ error: 'No refresh token found' });
    }

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: userToken.refreshToken,
      grant_type: 'refresh_token'
    });

    const { access_token } = response.data;
    
    // Store new access token in secure httpOnly cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

router.get('/user', authenticateSession, (req, res) => {
  res.json({ user: req.user });
});

router.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('access_token');
  res.json({ success: true });
});

module.exports = router;