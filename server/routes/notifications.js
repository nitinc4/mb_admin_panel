import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const data = await Notification.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

export default router;