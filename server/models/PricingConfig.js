import mongoose from 'mongoose';

const pricingConfigSchema = new mongoose.Schema({
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.Mixed, required: true },
  price: { type: Number, required: true },
  billingCycle: { type: String, default: 'one_time' },
  isActive: { type: Boolean, default: true }
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

export default mongoose.model('PricingConfig', pricingConfigSchema);