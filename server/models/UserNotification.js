import mongoose from 'mongoose';

const userNotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, required: true }, // 'batch_announcement', 'live_class', 'payment', 'message'
  relatedId: { type: String, default: null }, // ID to open specific batch or payment
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('UserNotification', userNotificationSchema);