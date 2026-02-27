import cron from 'node-cron';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

export const startPaymentCheckCron = () => {
  // Runs every day at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running daily payment check...');
      const now = new Date();

      // 1. Move 'upcoming' payments to 'due' if past their due date
      await Payment.updateMany(
        { status: 'upcoming', dueDate: { $lt: now } },
        { $set: { status: 'due' } }
      );

      // 2. Block users who have payments 10 days past due
      const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));
      
      const severelyOverduePayments = await Payment.find({ 
        status: 'due', 
        dueDate: { $lt: tenDaysAgo } 
      });

      const userIdsToBlock = [...new Set(severelyOverduePayments.map(p => p.user.toString()))];

      if (userIdsToBlock.length > 0) {
        await User.updateMany(
          { _id: { $in: userIdsToBlock }, isBlocked: false },
          { $set: { isBlocked: true } }
        );
        console.log(`Auto-blocked ${userIdsToBlock.length} users due to 10-day overdue payments.`);
      }

    } catch (error) {
      console.error('Error in payment cron job:', error);
    }
  });
  
  console.log('Payment CRON job initialized.');
};