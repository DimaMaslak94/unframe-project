const express = require('express');
const oauth2Client = require('../services/oauthClient');
const router = express.Router();

// Route to initiate OAuth flow
router.get('/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Request a refresh token
    prompt: 'consent',      // Force consent screen to get a new refresh token
    scope: ['https://www.googleapis.com/auth/drive.file'], // Add necessary scopes
  });
  res.redirect(authUrl);
});

// Callback route to handle authorization code
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code); // Exchange code for tokens
    oauth2Client.setCredentials(tokens); // Set credentials for future requests

    // Log tokens for development purposes (should be stored securely in production (like AWS Secret Manger))
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);

    // Redirect or respond to client as needed
    res.send('Authorization successful! Tokens received. You can close this tab.');
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Error retrieving access token');
  }
});

module.exports = router;