import express from 'express';
import Batch from '../models/Batch.js';
import ContentItem from '../models/ContentItem.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('allowedTiers', 'id name')
      .sort({ createdAt: -1 });

    const batchesWithTiers = await Promise.all(
      batches.map(async (batch) => {
        const contentCount = await ContentItem.countDocuments({ batch: batch._id });
        
        return {
          ...batch.toJSON(), // <--- THIS FIXES THE BLANK DATA
          allowed_tiers: batch.allowedTiers,
          content_count: contentCount,
        };
      })
    );

    res.json({ success: true, data: batchesWithTiers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('allowedTiers', 'id name');

    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    const contentItems = await ContentItem.find({ batch: batch._id })
      .sort({ orderIndex: 1 });

    res.json({
      success: true,
      data: {
        ...batch.toJSON(), // <--- THIS FIXES THE BLANK DATA
        allowed_tiers: batch.allowedTiers,
        content_items: contentItems,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description, start_date, end_date, is_active, tier_ids } = req.body;

    const data = await Batch.create({
      name,
      description: description || '',
      start_date: start_date || null,
      end_date: end_date || null,
      isActive: is_active !== undefined ? is_active : true,
      allowedTiers: tier_ids || []
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, description, start_date, end_date, is_active, tier_ids } = req.body;

    const data = await Batch.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        start_date,
        end_date,
        isActive: is_active,
        allowedTiers: tier_ids || []
      },
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await Batch.findByIdAndDelete(req.params.id);
    
    if (!data) {
       return res.status(404).json({ success: false, error: 'Batch not found' });
    }

    await ContentItem.deleteMany({ batch: req.params.id });

    res.json({ success: true, message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;