import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['admin', 'student', 'instructor'], default: 'student' },
  text: { type: String, required: true }
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

export default mongoose.model('Message', messageSchema);