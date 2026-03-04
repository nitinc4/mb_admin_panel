import express from 'express';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Tier from '../models/Tier.js';
import { sendPaymentReceipt } from '../utils/mailer.js';
import { notifyUsers } from '../utils/firebase-notifications.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status) query.status = status;

    const data = await Payment.find(query)
      .populate('user', 'id name email phone isBlocked billingCycle tier')
      .sort({ dueDate: 1 });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, amount, paymentType, reason, referenceId, paymentDate, dueDate, status, appointment_id } = req.body;

    let data = await Payment.create({
      user: user_id, amount, paymentType: paymentType || 'cash', reason,
      referenceId: referenceId || '', paymentDate: paymentDate || null, dueDate,
      status: status || 'upcoming', appointment: appointment_id || null
    });

    data = await data.populate('user', 'id name email phone');
    
    // Trigger receipt if the payment is created as paid directly
    if (data.status === 'paid' && data.user) {
        await sendPaymentReceipt(data.user, data);
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await Payment.findByIdAndUpdate(
      req.params.id, req.body, { returnDocument: 'after' }
    ).populate('user', 'id name email phone isBlocked tier billingCycle');

    if (!data) return res.status(404).json({ success: false, error: 'Payment not found' });
    
    if (req.body.status === 'paid') {
      // Send payment receipt on status change via email
      await sendPaymentReceipt(data.user, data);

      // NEW LOGIC: Send In-App Push Notification
      await notifyUsers(
        [data.user._id],
        'Payment Successful',
        `Received ₹${data.amount} for ${data.reason}`,
        { route: '/billing', paymentId: String(data._id) },
        'payment',
        data._id
      );
      
      // 1. Unblock User if they paid
      await User.findByIdAndUpdate(data.user._id, { isBlocked: false });

      // 2. STAGE 3: THE RECURRING SUBSCRIPTION LOOP
      if (data.reason.startsWith('Subscription -') && data.user.tier) {
        const userCycle = data.user.billingCycle;
        
        if (userCycle !== 'lifetime') {
          const tierInfo = await Tier.findById(data.user.tier);
          
          if (tierInfo) {
            // Calculate next due date
            const nextDue = new Date(data.dueDate);
            if (userCycle === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
            if (userCycle === 'yearly') nextDue.setFullYear(nextDue.getFullYear() + 1);

            const nextAmount = userCycle === 'monthly' ? tierInfo.monthlyPrice : tierInfo.yearlyPrice;

            // Safety check: Don't create duplicate invoices
            const existingNext = await Payment.findOne({ user: data.user._id, reason: data.reason, dueDate: nextDue });

            if (!existingNext && nextAmount > 0) {
              await Payment.create({
                user: data.user._id,
                amount: nextAmount,
                paymentType: 'upi', 
                reason: data.reason,
                dueDate: nextDue,
                status: 'upcoming'
              });
            }
          }
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
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;