import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  instructor: { type: String, default: 'Head Acharya' },
  // If a user has a Tier listed here, they automatically get access to this batch
  allowedTiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tier' }],
  price: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Batch', batchSchema);