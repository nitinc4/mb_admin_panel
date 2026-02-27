import mongoose from 'mongoose';

const tierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "Premium", "Basic"
  description: { type: String },
  price: { type: Number, required: true },
  billingCycle: { type: String, enum: ['monthly', 'yearly', 'one-time'], default: 'monthly' }
}, { timestamps: true });

export default mongoose.model('Tier', tierSchema);