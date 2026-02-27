import express from 'express';
import PricingConfig from '../models/PricingConfig.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { entity_type, entity_id, is_active } = req.query;

    let query = {};
    if (entity_type) query.entityType = entity_type;
    if (entity_id) query.entityId = entity_id;
    if (is_active !== undefined) query.isActive = is_active === 'true';

    const data = await PricingConfig.find(query).sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await PricingConfig.findById(req.params.id);

    if (!data) {
      return res.status(404).json({ success: false, error: 'Pricing config not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { entity_type, entity_id, price, billing_cycle } = req.body;

    const data = await PricingConfig.create({
      entityType: entity_type,
      entityId: entity_id,
      price,
      billingCycle: billing_cycle || 'one_time',
      isActive: true,
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { price, billing_cycle, is_active } = req.body;

    const updateData = {};
    if (price !== undefined) updateData.price = price;
    if (billing_cycle) updateData.billingCycle = billing_cycle;
    if (is_active !== undefined) updateData.isActive = is_active;

    const data = await PricingConfig.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!data) return res.status(404).json({ success: false, error: 'Pricing config not found' });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await PricingConfig.findByIdAndDelete(req.params.id);

    if (!data) return res.status(404).json({ success: false, error: 'Pricing config not found' });

    res.json({ success: true, message: 'Pricing config deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;