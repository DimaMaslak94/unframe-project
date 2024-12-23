const express = require('express');
const router = express.Router();
const { listFiles, uploadFile, updateFile, deleteFile } = require('../services/driveService');

// Route to list files
router.get('/files', async (req, res) => {
  const oauth2Client = req.oauth2Client;
  const { limit, offset, modifiedAfter } = req.query;

  // Ensure OAuth2 client has credentials
  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    return res.status(401).json({ error: 'Unauthorized: No access token provided' });
  }

  try {
    // Determine which page token to use
    let currentPageToken;
    if (offset) {
      currentPageToken = offset; // Use provided offset as current page token
    } else {
      currentPageToken = null; // Reset page token if offset is not provided
    }

    // Fetch files using the current page token
    const { files, nextPageToken } = await listFiles(
      oauth2Client,
      limit ? parseInt(limit) : undefined,
      currentPageToken,
      modifiedAfter || undefined
    );

    res.json({
      files: files,
      nextPageToken: nextPageToken,
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Error listing files' });
  }
});

// Route to upload a new file
router.post('/files/upload', async (req, res) => {
  const oauth2Client = req.oauth2Client;

  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    return res.status(401).json({ error: 'Unauthorized: No access token provided' });
  }

  // Check if a file was uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No file was uploaded.' });
  }

  const uploadedFile = req.files.file; // 'file' is the name of the input field in the form (in postman)

  const filename = uploadedFile.name;
  const content = uploadedFile.data; 
  const mimeType = uploadedFile.mimetype;

  try {
    const fileId = await uploadFile(oauth2Client, filename, content, mimeType);
    res.json({ id: fileId, filename });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

// Route to update a file's name
router.put('/files/update/:id', async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;
  const oauth2Client = req.oauth2Client;

  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    return res.status(401).json({ error: 'Unauthorized: No access token provided' });
  }

  try {
    const updatedFile = await updateFile(oauth2Client, id, newName);
    res.json(updatedFile);
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Error updating file' });
  }
});

// Route to delete a file
router.delete('/files/delete/:id', async (req, res) => {
  const { id } = req.params;
  const oauth2Client = req.oauth2Client;

  if (!oauth2Client.credentials || !oauth2Client.credentials.access_token) {
    return res.status(401).json({ error: 'Unauthorized: No access token provided' });
  }

  try {
    await deleteFile(oauth2Client, id);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

module.exports = router;
