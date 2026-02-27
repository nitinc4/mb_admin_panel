import mongoose from 'mongoose';

const tierSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  monthlyPrice: { type: Number, default: 0 },
  yearlyPrice: { type: Number, default: 0 },
  lifetimePrice: { type: Number, default: 0 }
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

export default mongoose.model('Tier', tierSchema);