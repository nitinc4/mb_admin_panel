import express from 'express';
import Attendance from '../models/Attendance.js';
import LiveClass from '../models/LiveClass.js';
import User from '../models/User.js';
import Batch from '../models/Batch.js';

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

// Admin: Get GLOBAL stats for all batches with Time Filter
router.get('/stats', async (req, res) => {
  try {
    const { filter } = req.query; // 'weekly', 'monthly', or 'all'
    
    let dateFilterClass = {};
    let dateFilterAttendance = {};

    if (filter === 'weekly') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      // Fallback to createdAt if scheduledAt is missing
      dateFilterClass = { $or: [{ scheduledAt: { $gte: oneWeekAgo } }, { createdAt: { $gte: oneWeekAgo } }] };
      dateFilterAttendance = { joinedAt: { $gte: oneWeekAgo } };
    } else if (filter === 'monthly') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      dateFilterClass = { $or: [{ scheduledAt: { $gte: oneMonthAgo } }, { createdAt: { $gte: oneMonthAgo } }] };
      dateFilterAttendance = { joinedAt: { $gte: oneMonthAgo } };
    }

    const totalClasses = await LiveClass.countDocuments(dateFilterClass);
    const totalPresent = await Attendance.countDocuments({ status: 'present', ...dateFilterAttendance });
    
    // Calculate max possible attendances across all active batches within this timeframe
    const batches = await Batch.find();
    let maxPossible = 0;
    
    for (const b of batches) {
      // Only count classes for this batch that fall into the date range
      const classCount = await LiveClass.countDocuments({ batch: b._id, ...dateFilterClass });
      if (classCount > 0) {
        const usersCount = await User.countDocuments({
           $or: [ { enrolledBatches: b._id }, { tier: { $in: b.allowedTiers } } ]
        });
        maxPossible += (classCount * usersCount);
      }
    }
    
    const averageAttendance = maxPossible === 0 ? 0 : (totalPresent / maxPossible) * 100;
    
    res.json({ 
      success: true, 
      data: { totalClasses, totalPresent, averageAttendance: averageAttendance.toFixed(2) } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Get overall stats for a specific batch
router.get('/batch/:batchId/stats', async (req, res) => {
  try {
    const { batchId } = req.params;
    const totalClasses = await LiveClass.countDocuments({ batch: batchId });
    const totalPresent = await Attendance.countDocuments({ batch: batchId, status: 'present' });
    
    const batch = await Batch.findById(batchId);
    let usersInBatch = 0;
    if (batch) {
       usersInBatch = await User.countDocuments({
         $or: [ { enrolledBatches: batchId }, { tier: { $in: batch.allowedTiers } } ]
       });
    }
    
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
    
    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    const users = await User.find({
      $or: [ { enrolledBatches: batchId }, { tier: { $in: batch.allowedTiers } } ]
    }).select('name email _id');
    
    const attendances = await Attendance.find({ liveClass: classId });

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
    const { batchId } = req.query;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let userBatches = [...user.enrolledBatches];
    if (user.tier) {
        const tierBatches = await Batch.find({ allowedTiers: user.tier }).select('_id');
        userBatches = [...userBatches, ...tierBatches.map(b => b._id)];
    }

    let classesQuery = { batch: { $in: userBatches } };
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