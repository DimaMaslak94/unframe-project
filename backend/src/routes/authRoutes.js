const express = require('express');
const router = express.Router();
// const dotenv = require('dotenv');
// const path = require('path');

// // Load environment variables
// dotenv.config({ path: path.join(__dirname, "..", "..", '.env') });

// Route to initiate OAuth flow
router.get('/google', (req, res) => {
  const oauth2Client = req.oauth2Client;
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    prompt: 'consent',      // Force consent screen to get a new refresh token
    scope: ['https://www.googleapis.com/auth/drive.file'], // Add necessary scopes
  });
  res.redirect(authUrl);
});

// Callback route to handle authorization code
router.get('/google/callback', async (req, res) => {
  const oauth2Client = req.oauth2Client;
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code); // Exchange code for tokens
    oauth2Client.setCredentials(tokens); // Set credentials for future requests

    // Log tokens for development purposes (should be stored securely in production)
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);

    // Redirect to client with token in URL parameters
    res.redirect(`http://localhost:8080?loggedIn=true&token=${tokens.access_token}`);
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Error retrieving access token');
  }
});

module.exports = router;