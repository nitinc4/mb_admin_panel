import cron from 'node-cron';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import LiveClass from '../models/LiveClass.js';
import { sendPushNotification } from '../utils/firebase-notifications.js';

export const startNotificationCron = () => {
  
  // =====================================================================
  // 1. EVERY 5 MINUTES: Check for Scheduled Custom Notifications
  // =====================================================================
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const pendingNotifications = await Notification.find({
        status: 'pending',
        scheduledAt: { $lte: now }
      });

      for (let notif of pendingNotifications) {
        let users = [];

        // Determine Audience
        if (notif.targetType === 'all') {
          users = await User.find({ fcm_token: { $ne: null }, isActive: true });
        } else if (notif.targetType === 'tier') {
          users = await User.find({ tier: notif.targetId, fcm_token: { $ne: null }, isActive: true });
        } else if (notif.targetType === 'batch') {
          users = await User.find({ enrolledBatches: notif.targetId, fcm_token: { $ne: null }, isActive: true });
        }

        const tokens = users.map(u => u.fcm_token).filter(t => t);

        if (tokens.length > 0) {
          await sendPushNotification(tokens, notif.title, notif.body, notif.imageUrl, { type: notif.type });
        }

        // Mark as sent
        notif.status = 'sent';
        notif.sentAt = new Date();
        await notif.save();

        // Handle Repeating logic
        if (notif.isRepeating && notif.repeatInterval !== 'none') {
          const nextDate = new Date(notif.scheduledAt);
          if (notif.repeatInterval === 'daily') nextDate.setDate(nextDate.getDate() + 1);
          if (notif.repeatInterval === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
          if (notif.repeatInterval === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

          await Notification.create({
            title: notif.title, body: notif.body, imageUrl: notif.imageUrl,
            targetType: notif.targetType, targetId: notif.targetId,
            scheduledAt: nextDate, isRepeating: true, repeatInterval: notif.repeatInterval,
            type: notif.type
          });
        }
      }
    } catch (error) { console.error('Scheduled Notification Cron Error:', error); }
  });

  // =====================================================================
  // 2. DAILY AT 10:00 AM: Payment Reminders (Dues & Upcoming)
  // =====================================================================
  cron.schedule('0 10 * * *', async () => {
    try {
      console.log('Running daily payment reminder check...');
      const now = new Date();
      const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);

      // Overdue Payments
      const duePayments = await Payment.find({ status: 'due' }).populate('user');
      for (let payment of duePayments) {
        if (payment.user && payment.user.fcm_token && !payment.user.isBlocked) {
          await sendPushNotification(
            [payment.user.fcm_token],
            "Payment Overdue ⚠️",
            `Your payment of ₹${payment.amount} for ${payment.reason} is overdue. Please pay to avoid account restriction.`,
            null, { type: 'payment_reminder', paymentId: payment._id.toString() }
          );
        }
      }

      // Upcoming Payments (Due Tomorrow)
      const startOfTomorrow = new Date(tomorrow.setHours(0,0,0,0));
      const endOfTomorrow = new Date(tomorrow.setHours(23,59,59,999));
      
      const upcomingPayments = await Payment.find({
        status: 'upcoming',
        dueDate: { $gte: startOfTomorrow, $lte: endOfTomorrow }
      }).populate('user');

      for (let payment of upcomingPayments) {
        if (payment.user && payment.user.fcm_token && !payment.user.isBlocked) {
          await sendPushNotification(
            [payment.user.fcm_token],
            "Upcoming Payment Reminder 📅",
            `A payment of ₹${payment.amount} for ${payment.reason} is due tomorrow.`,
            null, { type: 'payment_reminder', paymentId: payment._id.toString() }
          );
        }
      }
    } catch (error) { console.error('Payment Reminder Cron Error:', error); }
  });

  // =====================================================================
  // 3. EVERY 15 MINUTES: Live Class Starting Soon Reminders
  // =====================================================================
  cron.schedule('*/15 * * * *', async () => {
    try {
      const now = new Date();
      const inThirtyMins = new Date(now.getTime() + 30 * 60000);

      // Find classes scheduled between now and 30 mins from now that haven't sent a reminder
      const upcomingClasses = await LiveClass.find({
        status: 'scheduled',
        scheduledAt: { $gte: now, $lte: inThirtyMins },
        reminderSent: false
      });

      for (let liveClass of upcomingClasses) {
        // Find users in this specific batch
        const usersInBatch = await User.find({ 
          enrolledBatches: liveClass.batch, 
          fcm_token: { $ne: null },
          isActive: true
        });

        const tokens = usersInBatch.map(u => u.fcm_token).filter(t => t);
        
        if (tokens.length > 0) {
          await sendPushNotification(
            tokens,
            "Live Class Starting Soon! 🔴",
            `"${liveClass.title}" is starting in less than 30 minutes. Be ready!`,
            null, { type: 'live_class', classId: liveClass._id.toString() }
          );
        }

        liveClass.reminderSent = true;
        await liveClass.save();
      }
    } catch (error) { console.error('Live Class Reminder Cron Error:', error); }
  });

  console.log('✅ All Notification Automation CRON Jobs initialized.');
};