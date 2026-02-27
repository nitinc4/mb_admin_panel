import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await User.find()
      .populate('tier', 'id name price')
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await User.findById(req.params.id)
      .populate('tier', 'id name price');

    if (!data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, full_name, phone, fcm_token, tier_id, is_active } = req.body;

    const data = await User.create({
      email,
      name: full_name, // Mapping full_name to name as per your User model
      phone: phone || '',
      fcm_token: fcm_token || null,
      tier: tier_id || null, // Using 'tier' reference
      isActive: is_active !== undefined ? is_active : true, // Map to camelCase
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { email, full_name, phone, fcm_token, tier_id, is_active } = req.body;

    const data = await User.findByIdAndUpdate(
      req.params.id,
      {
        email,
        name: full_name,
        phone,
        fcm_token,
        tier: tier_id,
        isActive: is_active,
      },
      { new: true, runValidators: true }
    ).populate('tier', 'id name price');

    if (!data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await User.findByIdAndDelete(req.params.id);
    
    if (!data) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;