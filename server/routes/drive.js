import express from 'express';
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// GET: List all files
router.get('/', async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
    });
    
    const response = await s3Client.send(command);
    
    const files = (response.Contents || []).map(item => ({
      key: item.Key,
      size: item.Size,
      lastModified: item.LastModified,
      url: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${item.Key}`
    }));

    // Sort files by newest first
    files.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    res.json({ success: true, files });
  } catch (error) {
    console.error('Error fetching S3 objects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch drive files' });
  }
});

// DELETE: Remove a file by its key
router.delete('/', async (req, res) => {
  try {
    const { key } = req.query; // Expecting the key as a query parameter
    
    if (!key) {
      return res.status(400).json({ success: false, message: 'File key is required' });
    }

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    
    res.json({ success: true, message: 'File permanently deleted from S3' });
  } catch (error) {
    console.error('Error deleting S3 object:', error);
    res.status(500).json({ success: false, message: 'Failed to delete file' });
  }
});

export default router;