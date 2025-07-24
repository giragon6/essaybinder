const jwt = require('jsonwebtoken'); 

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

module.exports = {
  authenticateSession
};