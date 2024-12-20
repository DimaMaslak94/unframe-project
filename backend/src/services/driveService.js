const { google } = require('googleapis');
const stream = require('stream');

// Function to list files with pagination and modified date support
async function listFiles(auth, pageSize = 10, pageToken = null, modifiedAfter = null) {
  const drive = google.drive({ version: 'v3', auth });

  // Build the query for modified date if provided
  let query = '';
  if (modifiedAfter) {
    const date = new Date(modifiedAfter);
    query += `modifiedTime > '${date.toISOString()}'`;
  }

  const response = await drive.files.list({
    q: query,
    pageSize: pageSize,
    pageToken: pageToken,
    fields: 'nextPageToken, files(id, name, owners, modifiedTime)',
  });

  return response.data; // Return files and nextPageToken
}

// Function to upload a file
async function uploadFile(auth, fileName, fileContent, mimeType) {
  const drive = google.drive({ version: 'v3', auth });
  
  // Create a stream from the buffer content (to support the upload of binary files)
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileContent); // End the stream with the buffer content

  const fileMetadata = {
    name: fileName,
  };

  const media = {
    mimeType: mimeType,
    body: bufferStream, // Use the stream created from the buffer
  };

  try {
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    console.log('File Id:', file.data.id);
    return file.data.id;
  } catch (err) {
    console.error('Error uploading file:', err);
    throw err;
  }
}

// Function to update a file's name
async function updateFile(auth, fileId, newFileName) {
  const drive = google.drive({ version: 'v3', auth });
  
  try {
    const updatedFile = await drive.files.update({
      fileId: fileId,
      resource: { name: newFileName },
    });
    console.log('File updated:', updatedFile.data.name);
    return updatedFile.data;
  } catch (err) {
    console.error('Error updating file:', err);
    throw err;
  }
}

// Function to delete a file
async function deleteFile(auth, fileId) {
  const drive = google.drive({ version: 'v3', auth });
  
  try {
    await drive.files.delete({ fileId: fileId });
    console.log('File deleted successfully');
    return true;
  } catch (err) {
    console.error('Error deleting file:', err);
    throw err;
  }
}

module.exports = { listFiles, uploadFile, updateFile, deleteFile };