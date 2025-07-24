const { google } = require('googleapis');

const getGoogleAuthClient = (req) => {
  const accessToken = req.cookies.access_token;
  
  if (!accessToken) {
    throw new Error('No access token found in cookies');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  oauth2Client.setCredentials({ 
    access_token: accessToken 
  });
  
  return oauth2Client;
};

module.exports = {
  getGoogleAuthClient
};
