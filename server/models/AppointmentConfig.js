import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  key: { type: String, default: 'appointment_pricing', unique: true },
  standardPrice: { type: Number, default: 500 },
  vipPrice: { type: Number, default: 1000 }
});

export default mongoose.model('AppointmentConfig', configSchema);