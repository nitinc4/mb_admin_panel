import express from 'express';
import Tier from '../models/Tier.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await Tier.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await Tier.findById(req.params.id);
    
    if (!data) {
      return res.status(404).json({ success: false, error: 'Tier not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const data = await Tier.create({
      name,
      description: description || '',
      price: price || 0,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const data = await Tier.findByIdAndUpdate(
      req.params.id,
      { name, description, price },
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).json({ success: false, error: 'Tier not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await Tier.findByIdAndDelete(req.params.id);
    
    if (!data) {
      return res.status(404).json({ success: false, error: 'Tier not found' });
    }

    res.json({ success: true, message: 'Tier deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;