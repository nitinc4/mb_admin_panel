import express from 'express';
import Service from '../models/Service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await Service.find().populate('category').sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    let data = await Service.create(req.body);
    data = await data.populate('category');
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('category');
    if (!data) return res.status(404).json({ success: false, error: 'Service not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await Service.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: 'Service not found' });
    res.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;