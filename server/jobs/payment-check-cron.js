import cron from 'node-cron';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { sendPaymentReminder } from '../utils/mailer.js'; 

export const startPaymentCheckCron = () => {
  // Runs every day at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running daily payment check...');
      const now = new Date();

      // 1. Move 'upcoming' payments to 'due' if past their due date
      const newlyDuePayments = await Payment.find({
        status: 'upcoming', 
        dueDate: { $lt: now }
      }).populate('user', 'name email');

      if (newlyDuePayments.length > 0) {
        const dueIds = newlyDuePayments.map(p => p._id);
        
        await Payment.updateMany(
          { _id: { $in: dueIds } },
          { $set: { status: 'due' } }
        );
        
        // Send initial reminder email
        for (const payment of newlyDuePayments) {
           await sendPaymentReminder(payment.user, payment, false);
        }
        console.log(`Marked ${dueIds.length} payments as due and sent reminders.`);
      }

      // 2. Block users who have payments 10 days past due
      const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));
      
      const severelyOverduePayments = await Payment.find({ 
        status: 'due', 
        dueDate: { $lt: tenDaysAgo } 
      }).populate('user', 'name email');

      const userIdsToBlock = [...new Set(severelyOverduePayments.map(p => p.user._id.toString()))];

      if (userIdsToBlock.length > 0) {
        await User.updateMany(
          { _id: { $in: userIdsToBlock }, isBlocked: false },
          { $set: { isBlocked: true } }
        );
        
        // Send urgent overdue notice
        for (const payment of severelyOverduePayments) {
           await sendPaymentReminder(payment.user, payment, true);
        }
        console.log(`Auto-blocked ${userIdsToBlock.length} users due to 10-day overdue payments and sent urgent reminders.`);
      }

    } catch (error) {
      console.error('Error in payment cron job:', error);
    }
  });
  
  console.log('Payment CRON job initialized.');
};