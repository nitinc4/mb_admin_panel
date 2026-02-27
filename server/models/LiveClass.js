import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema({
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  title: { type: String, required: true },
  meetingUrl: { type: String, required: true },
  meetingId: { type: String, required: true },
  scheduledAt: { type: Date },
  duration: { type: Number, default: 60 },
  status: { type: String, enum: ['scheduled', 'live', 'ended'], default: 'scheduled' },
  isActive: { type: Boolean, default: true },
  startedAt: { type: Date },
  endedAt: { type: Date },
  reminderSent: { type: Boolean, default: false }
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

export default mongoose.model('LiveClass', liveClassSchema);