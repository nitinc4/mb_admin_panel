import express from 'express';
import upload from '../utils/s3Upload.js';

const router = express.Router();

// The string 'file' must match the name attribute of your form data from the frontend
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // req.file.location contains the public S3 URL of the uploaded file
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: req.file.location, 
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, message: 'Server error during file upload' });
  }
});

export default router;