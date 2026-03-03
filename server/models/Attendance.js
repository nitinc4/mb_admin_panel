import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  liveClass: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass', required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
  joinedAt: { type: Date, default: Date.now }
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

// Ensure a user can only have one attendance record per live class
attendanceSchema.index({ liveClass: 1, user: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);