const express = require('express');
const router = express.Router();
const { listFiles, uploadFile, updateFile, deleteFile } = require('../services/driveService');

let pageTokens = [];

// Route to list files
router.get('/files', async (req, res) => {
  const oauth2Client = req.oauth2Client;
  const { limit, offset, modifiedAfter } = req.query;

  try {
    // Determine which page token to use
    let currentPageToken;
    if (offset) {
      currentPageToken = offset; // Use provided offset as current page token
    } else {
      currentPageToken = pageTokens[pageTokens.length - 1]; // Get last token from array for next page
    }

    // Fetch files using the current page token
    const { files, nextPageToken } = await listFiles(
      oauth2Client,
      limit ? parseInt(limit) : undefined,
      currentPageToken,
      modifiedAfter || undefined
    );

    // Manage page tokens for navigation
    if (nextPageToken) {
      pageTokens.push(nextPageToken); // Store next token for future navigation
    }

    res.json({
      files: files,
      nextPageToken: nextPageToken,
      previousPageToken: pageTokens.length > 1 ? pageTokens[pageTokens.length - 2] : null, // Provide previous token if available
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Error listing files' });
  }
});

// Route to upload a new file
router.post('/files/upload', async (req, res) => {
  const oauth2Client = req.oauth2Client;

  // Check if a file was uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No file was uploaded.' });
  }

  const uploadedFile = req.files.file; // 'file' is the name of the input field in the form

  const filename = uploadedFile.name;
  const content = uploadedFile.data; 
  const mimeType = uploadedFile.mimetype;

  try {
    const fileId = await uploadFile(oauth2Client, filename, content, mimeType);
    res.json({ id: fileId, filename });
  } catch (error) {
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Route to update a file's name
router.put('/files/update/:id', async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;
  const oauth2Client = req.oauth2Client;
  try {
    const updatedFile = await updateFile(oauth2Client, id, newName);
    res.json(updatedFile);
  } catch (error) {
    res.status(500).json({ error: 'Error updating file' });
  }
});

// Route to delete a file
router.delete('/files/delete/:id', async (req, res) => {
  const { id } = req.params;
  const oauth2Client = req.oauth2Client;
  try {
    await deleteFile(oauth2Client, id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting file' });
  }
});

module.exports = router;
