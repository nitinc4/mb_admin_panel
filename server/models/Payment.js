import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  guestUser: { type: mongoose.Schema.Types.ObjectId, ref: 'GuestUser' },
  amount: { type: Number, required: true },
  paymentType: { type: String, default: 'cash' }, // cash, upi, card, bank_transfer
  reason: { type: String, required: true }, // e.g., 'Monthly Tier', 'Appointment'
  referenceId: { type: String, default: '' },
  paymentDate: { type: Date, default: null }, // When it was actually paid
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'due', 'paid'], default: 'upcoming' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null }
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

export default mongoose.model('Payment', paymentSchema);