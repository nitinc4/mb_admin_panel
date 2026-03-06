import express from 'express';
import Appointment from '../models/Appointment.js';
import AppointmentConfig from '../models/AppointmentConfig.js';
import Payment from '../models/Payment.js';

const router = express.Router();

const generateSlots = (dayIndex) => {
  if (dayIndex >= 1 && dayIndex <= 3) return ["Standard Booking"];
  if (dayIndex === 5 || dayIndex === 6) return [
    "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM", 
    "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM", 
    "12:00 PM - 12:30 PM", "12:30 PM - 01:00 PM", 
    "01:00 PM - 01:30 PM", "01:30 PM - 02:00 PM", 
    "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM"
  ];
  return [];
};

// Admin & App: Get config
router.get('/config', async (req, res) => {
  try {
    let config = await AppointmentConfig.findOne({ key: 'appointment_pricing' });
    if (!config) config = await AppointmentConfig.create({ key: 'appointment_pricing', standardPrice: 500, vipPrice: 1000 });
    res.json({ success: true, data: config });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Admin: Update config
router.post('/config', async (req, res) => {
  try {
    const { standardPrice, vipPrice } = req.body;
    const config = await AppointmentConfig.findOneAndUpdate(
      { key: 'appointment_pricing' }, 
      { standardPrice: Number(standardPrice), vipPrice: Number(vipPrice) }, 
      { upsert: true, new: true }
    );
    res.json({ success: true, data: config });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// App & Admin: Get available slots
router.get('/available-slots', async (req, res) => {
  try {
    const { date } = req.query; 
    if (!date) return res.status(400).json({ success: false, message: 'Date is required' });

    const [year, month, day] = date.split('-').map(Number);
    const queryDate = new Date(year, month - 1, day);
    const dayIndex = queryDate.getDay();

    const standardSlots = generateSlots(dayIndex);
    if (standardSlots.length === 0) return res.json({ success: true, data: [] });

    if (dayIndex >= 1 && dayIndex <= 3) {
       return res.json({ success: true, data: standardSlots });
    }

    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const bookedAppointments = await Appointment.find({
      $or: [
         { date: { $gte: startOfDay, $lte: endOfDay } },
         { scheduledAt: { $gte: startOfDay, $lte: endOfDay } }
      ],
      status: { $in: ['confirmed', 'pending', 'in_progress'] }
    });

    const bookedSlots = bookedAppointments.map(app => app.timeSlot).filter(Boolean);
    const availableSlots = standardSlots.filter(slot => !bookedSlots.includes(slot));

    res.json({ success: true, data: availableSlots });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// App: Book appointment
router.post('/book', async (req, res) => {
  try {
    const { userId, date, timeSlot, amount, txnId } = req.body;
    if (!userId || !date || !timeSlot) return res.status(400).json({ success: false, message: 'Missing fields' });

    const [year, month, day] = date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dayIndex = appointmentDate.getDay();
    const appType = (dayIndex === 5 || dayIndex === 6) ? 'vip' : 'normal';
    
    if (appType === 'vip') {
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

        const existing = await Appointment.findOne({
          $or: [{ date: { $gte: startOfDay, $lte: endOfDay } }, { scheduledAt: { $gte: startOfDay, $lte: endOfDay } }],
          timeSlot, 
          status: { $in: ['confirmed', 'pending', 'in_progress'] }
        });

        if (existing) return res.status(400).json({ success: false, message: 'Slot was just booked by someone else.' });
    }

    const newAppointment = await Appointment.create({
      user: userId,
      title: appType === 'vip' ? 'VIP Consultation' : 'Standard Consultation',
      appointmentType: appType,
      date: appointmentDate,
      timeSlot,
      cost: amount,
      amount,
      isPaid: true,
      paymentAmount: amount,
      txnId: txnId || `TXN_${Date.now()}`,
      paymentStatus: 'paid',
      status: 'pending'
    });

    await Payment.create({
      user: userId, 
      amount: amount,
      paymentType: 'online',
      reason: `Appointment - From app - ${timeSlot}`,
      dueDate: appointmentDate,
      paymentDate: new Date(),
      status: 'paid',
      referenceId: txnId || `TXN_${Date.now()}`,
      appointment: newAppointment._id
    });

    res.json({ success: true, data: newAppointment });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Admin: GET ALL
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('user', 'name email phone').sort({ date: -1, scheduledAt: -1 });
    res.json({ success: true, data: appointments });
  } catch (error) { res.status(500).json({ success: false, error: error.message }); }
});

// Admin: POST Manual Appointment
router.post('/', async (req, res) => {
  try {
    const { user_id, title, date, timeSlot, notes } = req.body;
    if (!user_id || !title || !date || !timeSlot) return res.status(400).json({ success: false, message: 'Missing fields' });
    
    let config = await AppointmentConfig.findOne({ key: 'appointment_pricing' });
    
    const [year, month, day] = date.split('-').map(Number);
    const appointmentDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    const dayIndex = appointmentDate.getDay();
    const appType = (dayIndex === 5 || dayIndex === 6) ? 'vip' : 'normal';

    let cost = 500;
    if (config) {
       cost = appType === 'vip' ? (config.vipPrice || 1000) : (config.standardPrice || 500);
    }

    if (appType === 'vip') {
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

        const existing = await Appointment.findOne({
          $or: [{ date: { $gte: startOfDay, $lte: endOfDay } }, { scheduledAt: { $gte: startOfDay, $lte: endOfDay } }],
          timeSlot, 
          status: { $in: ['confirmed', 'pending', 'in_progress'] }
        });

        if (existing) return res.status(400).json({ success: false, message: 'This time slot is already booked.' });
    }

    const appointment = await Appointment.create({
      user: user_id,
      title,
      appointmentType: appType,
      date: appointmentDate,
      timeSlot,
      cost,
      amount: cost,
      isPaid: false,
      paymentAmount: cost,
      notes,
      status: 'pending'
    });

    await Payment.create({
      user: user_id,
      amount: cost,
      paymentType: 'cash',
      reason: `Appointment - Admin Booking - ${timeSlot}`,
      dueDate: appointmentDate,
      status: 'upcoming',
      appointment: appointment._id
    });

    const populated = await Appointment.findById(appointment._id).populate('user', 'name email phone');
    res.json({ success: true, data: populated });
  } catch (error) { 
    console.error("Manual Booking Error: ", error);
    res.status(500).json({ success: false, error: error.message }); 
  }
});

// Admin: PUT Update Status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('user', 'name email phone');
    
    // NEW: Automatically delete the associated payment if the appointment is cancelled
    if (status === 'cancelled') {
       await Payment.findOneAndDelete({ appointment: req.params.id });
    }
    
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