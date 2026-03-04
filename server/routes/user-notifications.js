import express from 'express';
import UserNotification from '../models/UserNotification.js';

const router = express.Router();

router.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await UserNotification.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id/read', async (req, res) => {
  try {
    const data = await UserNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;