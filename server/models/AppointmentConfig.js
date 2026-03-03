import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  key: { type: String, default: 'standard_price', unique: true },
  price: { type: Number, default: 500 }
});

export default mongoose.model('AppointmentConfig', configSchema);