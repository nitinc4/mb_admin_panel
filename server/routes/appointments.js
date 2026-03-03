import express from 'express';
import Appointment from '../models/Appointment.js';
import AppointmentConfig from '../models/AppointmentConfig.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

const router = express.Router();

const generateSlots = (dayIndex) => {
  // 0: Sunday, 4: Thursday -> Closed
  if (dayIndex === 0 || dayIndex === 4) return [];
  return ["11:00 AM - 12:00 PM", "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM"];
};

// Admin & App: Get config
router.get('/config', async (req, res) => {
  try {
    let config = await AppointmentConfig.findOne({ key: 'standard_price' });
    if (!config) config = await AppointmentConfig.create({ key: 'standard_price', price: 500 });
    res.json({ success: true, data: config });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Admin: Update config
router.post('/config', async (req, res) => {
  try {
    const { price } = req.body;
    const config = await AppointmentConfig.findOneAndUpdate(
      { key: 'standard_price' }, { price: Number(price) }, { upsert: true, new: true }
    );
    res.json({ success: true, data: config });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// App: Get available slots
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

    const bookedAppointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['confirmed', 'pending', 'in_progress'] }
    });

    const bookedSlots = bookedAppointments.map(app => app.timeSlot);
    const availableSlots = standardSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ success: true, data: availableSlots });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// App: Book appointment
router.post('/book', async (req, res) => {
  try {
    const { userId, date, timeSlot, amount, txnId } = req.body;
    const appointmentDate = new Date(date);
    
    const timePart = timeSlot.split(' - ')[0]; 
    const [time, modifier] = timePart.split(' ');
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const scheduledAt = new Date(appointmentDate);
    scheduledAt.setHours(hours, parseInt(minutes, 10), 0, 0);

    const startOfDay = new Date(appointmentDate); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(appointmentDate); endOfDay.setHours(23,59,59,999);

    const existing = await Appointment.findOne({
      date: { $gte: startOfDay, $lte: endOfDay }, timeSlot, status: { $in: ['confirmed', 'pending', 'in_progress'] }
    });

    if (existing) return res.status(400).json({ success: false, message: 'Slot was just booked by someone else.' });

    const newAppointment = await Appointment.create({
      user: userId,
      title: 'App Consultation Booking',
      date: appointmentDate,
      timeSlot,
      scheduledAt,
      cost: amount,
      amount,
      isPaid: true,
      paymentAmount: amount,
      txnId: txnId || `TXN_${Date.now()}`,
      paymentStatus: 'paid',
      status: 'pending' // <-- CHANGED TO PENDING AS REQUESTED
    });

    await Payment.create({
      user: userId,
      amount: amount,
      paymentType: 'online',
      reason: `App Booking - ${timeSlot}`,
      dueDate: scheduledAt,
      paymentDate: new Date(),
      status: 'paid',
      referenceId: txnId || `TXN_${Date.now()}`
    });

    res.json({ success: true, data: newAppointment });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Admin: GET ALL
router.get('/', async (req, res) => {
  try {
    // Populate phone number for the new UI format
    const appointments = await Appointment.find().populate('user', 'name email phone').sort({ scheduledAt: -1, date: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Admin: POST Manual Appointment
router.post('/', async (req, res) => {
  try {
    const { user_id, title, cost, scheduled_at, notes } = req.body;
    const appointment = await Appointment.create({
      user: user_id,
      title,
      cost,
      scheduledAt: new Date(scheduled_at),
      notes,
      status: 'pending'
    });
    const populated = await Appointment.findById(appointment._id).populate('user', 'name email phone');
    res.json({ success: true, data: populated });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Admin: PUT Update Status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user', 'name email phone');
    res.json({ success: true, data: appointment });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Admin: DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

export default router;