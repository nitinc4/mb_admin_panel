import express from 'express';
import User from '../models/User.js';
import Tier from '../models/Tier.js';
import Payment from '../models/Payment.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await User.find()
      .populate('tier', 'id name monthlyPrice yearlyPrice lifetimePrice')
      .sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await User.findById(req.params.id)
      .populate('tier', 'id name monthlyPrice yearlyPrice lifetimePrice');
    if (!data) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, full_name, phone, fcm_token, tier_id, billingCycle, is_active } = req.body;

    const data = await User.create({
      email,
      name: full_name,
      phone: phone || '',
      fcm_token: fcm_token || null,
      tier: tier_id || null,
      billingCycle: billingCycle || 'monthly',
      isActive: is_active !== undefined ? is_active : true,
    });

    // AUTO INVOICE ON CREATION
    if (tier_id) {
      const tierDetails = await Tier.findById(tier_id);
      if (tierDetails) {
        let amount = 0;
        if (data.billingCycle === 'monthly') amount = tierDetails.monthlyPrice;
        else if (data.billingCycle === 'yearly') amount = tierDetails.yearlyPrice;
        else if (data.billingCycle === 'lifetime') amount = tierDetails.lifetimePrice;

        if (amount > 0) {
          await Payment.create({
            user: data._id,
            amount,
            paymentType: 'cash',
            reason: `Subscription - ${tierDetails.name} (${data.billingCycle})`,
            dueDate: new Date(), 
            status: 'upcoming'
          });
        }
      }
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { email, full_name, phone, fcm_token, tier_id, billingCycle, is_active, isBlocked, password } = req.body;
    const oldUser = await User.findById(req.params.id);
    if (!oldUser) return res.status(404).json({ success: false, error: 'User not found' });

    // ONLY update the fields that are actually sent from the app
    const updateFields = {};
    if (email !== undefined) updateFields.email = email;
    if (full_name !== undefined) updateFields.name = full_name;
    if (phone !== undefined) updateFields.phone = phone;
    if (fcm_token !== undefined) updateFields.fcm_token = fcm_token;
    if (tier_id !== undefined) updateFields.tier = tier_id;
    if (billingCycle !== undefined) updateFields.billingCycle = billingCycle;
    if (is_active !== undefined) updateFields.isActive = is_active;
    if (isBlocked !== undefined) updateFields.isBlocked = isBlocked;
    
    // CRITICAL FIX: Allow password to be saved
    if (password !== undefined && password.trim() !== '') {
      updateFields.password = password;
    }

    const data = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('tier', 'id name monthlyPrice yearlyPrice lifetimePrice');

    // AUTO INVOICE ON TIER UPGRADE/CHANGE
    if (tier_id && (!oldUser.tier || oldUser.tier.toString() !== tier_id.toString() || oldUser.billingCycle !== billingCycle)) {
      const tierDetails = await Tier.findById(tier_id);
      if (tierDetails) {
        let amount = 0;
        if (data.billingCycle === 'monthly') amount = tierDetails.monthlyPrice;
        else if (data.billingCycle === 'yearly') amount = tierDetails.yearlyPrice;
        else if (data.billingCycle === 'lifetime') amount = tierDetails.lifetimePrice;

        if (amount > 0) {
          await Payment.create({
            user: data._id,
            amount,
            reason: `Subscription - ${tierDetails.name} (${data.billingCycle})`,
            dueDate: new Date(),
            status: 'upcoming'
          });
        }
      }
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await User.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;