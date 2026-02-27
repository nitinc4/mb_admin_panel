import express from 'express';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

const router = express.Router();

// Get all payments (can filter by status using ?status=upcoming)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const data = await Payment.find(query)
      .populate('user', 'id name email phone isBlocked')
      .sort({ dueDate: 1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new manual payment
router.post('/', async (req, res) => {
  try {
    const { user_id, amount, paymentType, reason, referenceId, paymentDate, dueDate, status, appointment_id } = req.body;

    let data = await Payment.create({
      user: user_id,
      amount,
      paymentType: paymentType || 'cash',
      reason,
      referenceId: referenceId || '',
      paymentDate: paymentDate || null,
      dueDate,
      status: status || 'upcoming',
      appointment: appointment_id || null
    });

    data = await data.populate('user', 'id name phone');
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a payment (Mark as paid)
router.put('/:id', async (req, res) => {
  try {
    const data = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('user', 'id name phone');

    if (!data) return res.status(404).json({ success: false, error: 'Payment not found' });
    
    // If they just paid an overdue bill, we should auto-unblock them!
    if (req.body.status === 'paid') {
      await User.findByIdAndUpdate(data.user._id, { isBlocked: false });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;