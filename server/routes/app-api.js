import express from 'express';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Tier from '../models/Tier.js';

const router = express.Router();

/**
 * MIDDLEWARE: The Force-Logout Checkpoint
 * Any route using this will automatically reject blocked users.
 */
const requireAppAuth = async (req, res, next) => {
  // In production, you would decode a JWT here. 
  // For now, we expect the Flutter app to send the User ID in the headers.
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Missing User ID' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });

    // THE FORCE LOGOUT TRIGGER
    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        error: 'USER_BLOCKED', 
        message: 'Your account has been restricted due to overdue payments. Please pay your pending dues to restore access.' 
      });
    }

    req.user = user; // Attach user to the request so the next function can use it
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
};


/**
 * 1. Fetch User Data (Protected Route - Will fail if blocked)
 */
router.get('/my-profile', requireAppAuth, async (req, res) => {
  res.json({ success: true, data: req.user });
});


/**
 * 2. Fetch Pending Dues (UNPROTECTED - Blocked users MUST be able to access this to pay!)
 */
router.get('/my-dues/:userId', async (req, res) => {
  try {
     const dues = await Payment.find({ user: req.params.userId, status: 'due' });
     res.json({ success: true, data: dues });
  } catch (error) {
     res.status(500).json({ success: false, error: error.message });
  }
});


/**
 * 3. Process Payment from the Mobile App (e.g., Razorpay/Stripe success callback)
 * UNPROTECTED - Paying unblocks the user automatically.
 */
router.post('/process-payment', async (req, res) => {
  try {
    const { user_id, payment_id, reference_id, payment_type } = req.body;

    const payment = await Payment.findById(payment_id).populate('user');
    if (!payment) return res.status(404).json({ success: false, error: 'Invoice not found' });

    // Mark as paid
    payment.status = 'paid';
    payment.paymentDate = new Date();
    payment.referenceId = reference_id || 'APP_PAYMENT';
    payment.paymentType = payment_type || 'online';
    await payment.save();

    // AUTO-UNBLOCK THE USER
    if (payment.user.isBlocked) {
      await User.findByIdAndUpdate(user_id, { isBlocked: false });
    }

    // RECURRING SUBSCRIPTION LOOP (Auto-generate next month's bill)
    if (payment.reason.startsWith('Subscription -') && payment.user.tier) {
      const userCycle = payment.user.billingCycle;
      
      if (userCycle !== 'lifetime') {
        const tierInfo = await Tier.findById(payment.user.tier);
        if (tierInfo) {
          const nextDue = new Date(payment.dueDate);
          if (userCycle === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);
          if (userCycle === 'yearly') nextDue.setFullYear(nextDue.getFullYear() + 1);

          const nextAmount = userCycle === 'monthly' ? tierInfo.monthlyPrice : tierInfo.yearlyPrice;
          
          const existingNext = await Payment.findOne({ user: user_id, reason: payment.reason, dueDate: nextDue });
          
          if (!existingNext && nextAmount > 0) {
            await Payment.create({
              user: user_id, amount: nextAmount, paymentType: 'online', 
              reason: payment.reason, dueDate: nextDue, status: 'upcoming'
            });
          }
        }
      }
    }

    res.json({ success: true, message: 'Payment successful! Your account is active.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;