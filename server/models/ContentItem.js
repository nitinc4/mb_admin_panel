import mongoose from 'mongoose';

const contentItemSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  contentType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  duration: { type: Number, default: 0 },
  fileSize: { type: Number, default: 0 },
  orderIndex: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true }
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

export default mongoose.model('ContentItem', contentItemSchema);