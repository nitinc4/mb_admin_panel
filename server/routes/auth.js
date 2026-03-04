import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check credentials (mapping frontend username to schema email)
    const user = await User.findOne({ email, role: 'admin' });

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isActive || user.isBlocked) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Admin Profile
router.put('/update/:id', async (req, res) => {
  try {
    const { name, password, currentPassword } = req.body;
    const updateFields = { name };
    
    // If the user wants to update their password, verify the current password first
    if (password && password.trim() !== '') {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      if (user.password !== currentPassword) {
        return res.status(401).json({ success: false, error: 'Incorrect current password' });
      }

      updateFields.password = password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create New Admin
router.post('/create', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Username already exists' });
    }

    const newUser = await User.create({
      name,
      email, 
      password,
      role: 'admin',
      isActive: true
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;