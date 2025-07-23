const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); 
const axios = require('axios');

const authenticateSession = (req, res, next) => {
  const sessionToken = req.cookies.session;
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'No session' });
  }

  try {
    const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('session');
    res.status(401).json({ error: 'Invalid session' });
  }
};

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
    
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID + '.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    
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

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days (ms)
    });

    res.cookie('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours (ms)
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
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    const { access_token } = response.data;
    
    res.json({ access_token });
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
  res.clearCookie('refresh_token');
  res.json({ success: true });
});

module.exports = router;