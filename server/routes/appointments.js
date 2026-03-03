import express from 'express';
import Appointment from '../models/Appointment.js';
import AppointmentConfig from '../models/AppointmentConfig.js';
import User from '../models/User.js';

const router = express.Router();

// 1 Hour Slots: 11 AM to 4 PM (Starts at 11, 12, 1, 2, 3)
const generateSlots = (dayIndex) => {
  // 0: Sunday, 4: Thursday -> Closed
  if (dayIndex === 0 || dayIndex === 4) return [];
  return ["11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM"];
};

// Admin & App: Get standard price
router.get('/config', async (req, res) => {
  try {
    let config = await AppointmentConfig.findOne({ key: 'standard_price' });
    if (!config) config = await AppointmentConfig.create({ key: 'standard_price', price: 500 }); // Default 500
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Update standard price
router.post('/config', async (req, res) => {
  try {
    const { price } = req.body;
    const config = await AppointmentConfig.findOneAndUpdate(
      { key: 'standard_price' },
      { price: Number(price) },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// App: Get available slots for a date (syncs confirmed slots)
router.get('/available-slots', async (req, res) => {
  try {
    const { date } = req.query; 
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const queryDate = new Date(date);
    const dayIndex = queryDate.getDay();
    const standardSlots = generateSlots(dayIndex);

    if (standardSlots.length === 0) return res.json({ success: true, data: [] });

    const startOfDay = new Date(queryDate.setHours(0,0,0,0));
    const endOfDay = new Date(queryDate.setHours(23,59,59,999));

    // Find slots already booked on this date
    const bookedAppointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'pending'] }
    });

    const bookedSlots = bookedAppointments.map(app => app.timeSlot);
    const availableSlots = standardSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ success: true, data: availableSlots });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// App: Book and process appointment securely
router.post('/book', async (req, res) => {
  try {
    const { userId, date, timeSlot, amount, txnId } = req.body;
    const appointmentDate = new Date(date);
    
    const startOfDay = new Date(appointmentDate); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(appointmentDate); endOfDay.setHours(23,59,59,999);

    // Double check if slot got booked while user was on payment screen
    const existing = await Appointment.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existing) return res.status(400).json({ success: false, message: 'Slot was just booked by someone else. Please try another slot.' });

    const newAppointment = await Appointment.create({
      user: userId,
      date: appointmentDate,
      timeSlot,
      amount,
      txnId: txnId || `TXN_${Date.now()}`,
      paymentStatus: 'paid',
      status: 'confirmed'
    });

    res.json({ success: true, data: newAppointment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('user', 'name email').sort({ date: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;