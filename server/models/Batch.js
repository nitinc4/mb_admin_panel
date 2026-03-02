import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String }, // Used as Overview
  attendance: { type: String, default: '' },
  assignment: { type: String, default: '' },
  announcements: { type: String, default: '' },
  tests: { type: String, default: '' },
  instructor: { type: String, default: 'Head Acharya' },
  allowedTiers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tier' }],
  price: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  start_date: { type: Date },
  end_date: { type: Date }
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      delete ret._id;
    }
  }
});

export default mongoose.model('Batch', batchSchema);