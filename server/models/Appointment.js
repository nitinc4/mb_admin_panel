import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true }, // Replaced Service
  cost: { type: Number, required: true, default: 0 }, // Replaced Service Price
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String, default: '' },
  isPaid: { type: Boolean, default: false },
  paymentAmount: { type: Number, default: 0 } // Syncs with cost for billing
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

export default mongoose.model('Appointment', appointmentSchema);