import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, default: '' }, // For promotional images
  targetType: { type: String, enum: ['all', 'tier', 'batch', 'user'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, default: null }, // Null if target is 'all'
  scheduledAt: { type: Date, required: true },
  isRepeating: { type: Boolean, default: false },
  repeatInterval: { type: String, enum: ['daily', 'weekly', 'monthly', 'none'], default: 'none' },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  type: { type: String, enum: ['promotional', 'payment_reminder', 'live_class'], default: 'promotional' },
  sentAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);