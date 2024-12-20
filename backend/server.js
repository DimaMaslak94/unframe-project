const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/authRoutes');
const driveRoutes = require('./src/routes/driveRoutes');
const oauth2Client = require('./src/services/oauthClient'); // Import the OAuth2 client from services

const app = express();
const port = process.env.PORT || 3000; // Use PORT from .env or default to 3000

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(fileUpload());

// Middleware to attach oauth2Client for API routes
app.use('/api', (req, res, next) => {
  req.oauth2Client = oauth2Client; // Add oauth2Client to request object for use in routes
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/api', driveRoutes); // Use driveRoutes after setting up oauth2Client

app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log server start message
});