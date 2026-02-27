import express from 'express';
import Appointment from '../models/Appointment.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await Appointment.find()
      .populate('user', 'name email phone')
      .sort({ scheduledAt: -1 });
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, title, cost, scheduled_at, notes } = req.body;
    
    let data = await Appointment.create({
      user: user_id,
      title: title || 'General Appointment',
      cost: cost || 0,
      paymentAmount: cost || 0,
      scheduledAt: scheduled_at,
      notes: notes || '',
      status: 'pending'
    });

    data = await data.populate('user', 'name email phone');
    res.status(201).json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await Appointment.findByIdAndUpdate(
      req.params.id, req.body, { returnDocument: 'after' }
    ).populate('user', 'name email phone');

    if (!data) return res.status(404).json({ success: false, error: 'Appointment not found' });
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

export default router;