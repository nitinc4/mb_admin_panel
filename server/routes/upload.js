import express from 'express';
import upload from '../utils/s3Upload.js';
import multer from 'multer';

const router = express.Router();

router.post('/', (req, res) => {
  // Use the upload middleware inside the route so we can catch its errors
  upload.single('file')(req, res, function (err) {
    // 1. Catch Multer-specific errors (like file too large)
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
         return res.status(400).json({ 
           success: false, 
           message: 'File is too large. Maximum allowed size is 2GB.' 
         });
      }
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } 
    // 2. Catch unknown server errors
    else if (err) {
      console.error('Unknown upload error:', err);
      return res.status(500).json({ success: false, message: 'Server error during file upload' });
    }

    // 3. Check if a file was actually provided
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // 4. Success! Return the S3 URL
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: req.file.location, 
    });
  });
});

export default router;