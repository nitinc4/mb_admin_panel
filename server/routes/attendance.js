import express from 'express';
import Attendance from '../models/Attendance.js';
import LiveClass from '../models/LiveClass.js';
import User from '../models/User.js';

const router = express.Router();

// App: Mark attendance when user joins a live class
router.post('/mark', async (req, res) => {
  try {
    const { userId, liveClassId, batchId } = req.body;
    const attendance = await Attendance.findOneAndUpdate(
      { liveClass: liveClassId, user: userId },
      { batch: batchId, status: 'present', joinedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Get overall stats for a batch
router.get('/batch/:batchId/stats', async (req, res) => {
  try {
    const { batchId } = req.params;
    const totalClasses = await LiveClass.countDocuments({ batch: batchId });
    const totalPresent = await Attendance.countDocuments({ batch: batchId, status: 'present' });
    
    // Find how many users are enrolled
    const usersInBatch = await User.countDocuments({ enrolledBatches: batchId });
    
    const maxPossibleAttendances = totalClasses * usersInBatch;
    const averageAttendance = maxPossibleAttendances === 0 ? 0 : (totalPresent / maxPossibleAttendances) * 100;

    res.json({ 
      success: true, 
      data: { totalClasses, averageAttendance: averageAttendance.toFixed(2), totalPresent } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Get attendance records for a specific live class
router.get('/batch/:batchId/class/:classId/records', async (req, res) => {
  try {
    const { batchId, classId } = req.params;
    
    // 1. Get all enrolled users
    const users = await User.find({ enrolledBatches: batchId }).select('name email _id');
    // 2. Get all attendance records for this class
    const attendances = await Attendance.find({ liveClass: classId });

    // 3. Map users to their status
    const records = users.map(user => {
      const record = attendances.find(a => a.user.toString() === user._id.toString());
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        status: record ? record.status : 'absent',
        attendanceId: record ? record._id : null
      };
    });

    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Manually edit/update an attendance record
router.put('/update', async (req, res) => {
  try {
    const { userId, liveClassId, batchId, status } = req.body;
    const attendance = await Attendance.findOneAndUpdate(
      { liveClass: liveClassId, user: userId },
      { batch: batchId, status: status },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// App & Profile: Get specific user's overall/batch attendance stats
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { batchId } = req.query; // Optional filter by batch

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let classesQuery = { batch: { $in: user.enrolledBatches } };
    let attendanceQuery = { user: userId, status: 'present' };

    if (batchId) {
      classesQuery.batch = batchId;
      attendanceQuery.batch = batchId;
    }

    const totalClasses = await LiveClass.countDocuments(classesQuery);
    const classesAttended = await Attendance.countDocuments(attendanceQuery);
    const percentage = totalClasses === 0 ? 0 : (classesAttended / totalClasses) * 100;

    res.json({ 
      success: true, 
      data: { totalClasses, classesAttended, percentage: percentage.toFixed(2) } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;