import express from 'express';
import multer from 'multer'; // Import multer for handling file uploads
import User from '../models/User.js';
import GuestUser from '../models/GuestUser.js'; 
import Payment from '../models/Payment.js';
import Tier from '../models/Tier.js';
import s3Upload from '../utils/s3Upload.js';

const router = express.Router();

// Multer configuration for temporary storage before S3 upload
const upload = multer({ storage: multer.memoryStorage() });

/**
 * MIDDLEWARE: The Force-Logout Checkpoint
 */
const requireAppAuth = async (req, res, next) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Missing User ID' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found' });

    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        error: 'USER_BLOCKED', 
        message: 'Your account has been restricted due to overdue payments. Please pay your pending dues to restore access.' 
      });
    }

    req.user = user; 
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: 'SERVER_ERROR', message: error.message });
  }
};

/**
 * App Check Email Route
 */
router.post('/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;
    
    const user = await User.findOne({ phone });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Phone number not registered' });
    }

    const hasPassword = user.password && user.password.trim() !== '';

    res.json({ success: true, userId: user._id, hasPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * First-time Password Setup Route
 */
router.post('/setup-password', async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.password = password;
    await user.save();
    const updatedUser = await User.findById(userId).populate('tier', 'id name monthlyPrice yearlyPrice lifetimePrice');
    
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * App Login Route (UNPROTECTED)
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    const user = await User.findOne({ phone }).populate('tier', 'id name monthlyPrice yearlyPrice lifetimePrice');
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    if (user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * UPDATED: Guest User Registration (Uses new GuestUser model)
 */
router.post('/guest-user', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ success: false, message: 'Name and phone required' });

    let guest = await GuestUser.findOne({ phone });
    if (!guest) {
      guest = await GuestUser.create({ name, phone });
    }
    res.json({ success: true, userId: guest._id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * NEW: Update Profile Image Route (PROTECTED)
 */
router.post('/update-profile-image', requireAppAuth, multer({ storage: multer.memoryStorage() }).single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file uploaded' });
    }

    // Call the utility function directly
    const imageUrl = await s3Upload(req.file);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profileImageUrl: imageUrl } },
      { new: true }
    );

    res.json({ success: true, imageUrl: user.profileImageUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Fetch User Data (Protected Route)
 * Returns full profile including profileImageUrl
 */
router.get('/my-profile', requireAppAuth, async (req, res) => {
  try {
    const userWithTier = await User.findById(req.user._id).populate('tier', 'id name monthlyPrice yearlyPrice lifetimePrice');
    res.json({ success: true, data: userWithTier });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Fetch Pending Dues
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
 * Process Payment from the Mobile App
 */
router.post('/process-payment', async (req, res) => {
  try {
    const { user_id, payment_id, reference_id, payment_type } = req.body;

    const payment = await Payment.findById(payment_id).populate('user');
    if (!payment) return res.status(404).json({ success: false, error: 'Invoice not found' });

    payment.status = 'paid';
    payment.paymentDate = new Date();
    payment.referenceId = reference_id || 'APP_PAYMENT';
    payment.paymentType = payment_type || 'online';
    await payment.save();

    if (payment.user && payment.user.isBlocked) {
      await User.findByIdAndUpdate(user_id, { isBlocked: false });
    }

    if (payment.reason.startsWith('Subscription -') && payment.user && payment.user.tier) {
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