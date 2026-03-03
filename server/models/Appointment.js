import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Consultation' },
  
  // App Specific Date/Time tracking
  date: { type: Date }, 
  timeSlot: { type: String }, 
  
  // Admin Panel tracking (Combines Date & Time)
  scheduledAt: { type: Date }, 
  
  // Pricing & Payment sync
  cost: { type: Number, default: 0 }, 
  amount: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  paymentAmount: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  txnId: { type: String },
  
  status: { type: String, enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.model('Appointment', appointmentSchema);