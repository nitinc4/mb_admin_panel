import express from 'express';
import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Populate replaces the supabase '*, users(*), services(*)' syntax
    const data = await Appointment.find()
      .populate('user', 'id name email')
      .populate('service', 'id name price')
      .sort({ scheduledAt: -1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, service_id, scheduled_at, notes } = req.body;

    // Fetch the service to get the price for the payment_amount
    const service = await Service.findById(service_id);
    if (!service) return res.status(404).json({ success: false, error: 'Service not found' });

    let data = await Appointment.create({
      user: user_id,
      service: service_id,
      scheduledAt: scheduled_at,
      notes,
      status: 'pending',
      isPaid: false,
      paymentAmount: service.price // Auto-set from the service price
    });

    // Populate the response so the frontend kanban board can display names immediately
    data = await data.populate(['user', 'service']);

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate(['user', 'service']);

    if (!data) return res.status(404).json({ success: false, error: 'Appointment not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await Appointment.findByIdAndDelete(req.params.id);
    if (!data) return res.status(404).json({ success: false, error: 'Appointment not found' });
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;