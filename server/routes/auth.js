import express from 'express';
import Admin from '../models/Admin.js';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ email });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }

    res.json({ success: true, user: admin });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get All Admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({ success: true, data: admins });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Admin Profile
router.put('/update/:id', async (req, res) => {
  try {
    const { name, password, currentPassword } = req.body;
    const updateFields = { name };
    
    if (password && password.trim() !== '') {
      const admin = await Admin.findById(req.params.id);
      
      if (!admin) {
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      if (admin.password !== currentPassword) {
        return res.status(401).json({ success: false, error: 'Incorrect current password' });
      }

      updateFields.password = password;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    res.json({ success: true, user: updatedAdmin });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create New Admin
router.post('/create', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, error: 'Username already exists' });
    }

    const newAdmin = await Admin.create({
      name,
      email, 
      password,
      isActive: true
    });

    res.status(201).json({ success: true, user: newAdmin });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Admin
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }
    res.json({ success: true, message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;