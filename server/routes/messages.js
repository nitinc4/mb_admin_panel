import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Fetch message history for a specific batch (Optimized to last 100 messages)
router.get('/batch/:batchId', async (req, res) => {
  try {
    const messages = await Message.find({ batchId: req.params.batchId })
      .sort({ createdAt: 1 }) // Oldest first so it formats correctly in UI
      .limit(100); 
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;