import mongoose from 'mongoose';

const guestUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('GuestUser', guestUserSchema);