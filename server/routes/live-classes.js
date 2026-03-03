import express from 'express';
import LiveClass from '../models/LiveClass.js';
import Batch from '../models/Batch.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) query.status = status;

    const data = await LiveClass.find(query)
      .populate('batch', 'id name description')
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await LiveClass.findById(req.params.id)
      .populate('batch', 'id name description');

    if (!data) {
      return res.status(404).json({ success: false, error: 'Live class not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { batch_id, title, scheduled_at, duration } = req.body;

    const batch = await Batch.findById(batch_id);
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    const meetingId = `MantrikaBrahma_${batch.name.replace(/\s+/g, '_')}_${Date.now()}`;
    const meetingUrl = `https://meet.ffmuc.net/${meetingId}`;

    const data = await LiveClass.create({
      batch: batch_id,
      title: title || `Live Class - ${batch.name}`,
      meetingUrl,
      meetingId,
      scheduledAt: scheduled_at || null,
      duration: duration || 60,
      status: 'scheduled',
      isActive: true,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/start', async (req, res) => {
  try {
    const data = await LiveClass.findByIdAndUpdate(
      req.params.id,
      {
        status: 'live',
        startedAt: new Date(),
      },
      { new: true }
    );

    if (!data) return res.status(404).json({ success: false, error: 'Live class not found' });

    res.json({ success: true, data, message: 'Live class started' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/end', async (req, res) => {
  try {
    const data = await LiveClass.findByIdAndUpdate(
      req.params.id,
      {
        status: 'ended',
        endedAt: new Date(),
      },
      { new: true }
    );

    if (!data) return res.status(404).json({ success: false, error: 'Live class not found' });

    res.json({ success: true, data, message: 'Live class ended' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, scheduled_at, duration, is_active } = req.body;

    const data = await LiveClass.findByIdAndUpdate(
      req.params.id,
      {
        title,
        scheduledAt: scheduled_at,
        duration,
        isActive: is_active,
      },
      { new: true }
    );

    if (!data) return res.status(404).json({ success: false, error: 'Live class not found' });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await LiveClass.findByIdAndDelete(req.params.id);

    if (!data) return res.status(404).json({ success: false, error: 'Live class not found' });

    res.json({ success: true, message: 'Live class deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;