import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, default: null }, // Made nullable/optional
  password: { type: String, default: null }, 
  phone: { type: String, required: true, unique: true }, // Set as primary and required
  role: { type: String, enum: ['student', 'admin', 'instructor'], default: 'student' },
  tier: { type: mongoose.Schema.Types.ObjectId, ref: 'Tier', default: null },
  billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime'], default: 'monthly' },
  fcm_token: { type: String, default: null },
  enrolledBatches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
  isActive: { type: Boolean, default: true },
  isBlocked: { type: Boolean, default: false },
  joinDate: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.password; // Security: never send password back in JSON
    }
  }
});

export default mongoose.model('User', userSchema);