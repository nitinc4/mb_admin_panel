import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student' },
  // Links to the Tier schema
  tier: { type: mongoose.Schema.Types.ObjectId, ref: 'Tier', default: null },
  // Required for push notifications to their mobile device
  fcm_token: { type: String, default: null },
  // Links to the Batch schema
  enrolledBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);