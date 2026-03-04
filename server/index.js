import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http'; 
import { Server } from 'socket.io';
import connectDB from './config/db.js';

import paymentRoutes from './routes/payments.js';
import appApiRoutes from './routes/app-api.js';
import notificationsRoutes from './routes/notifications.js';
import messagesRoutes from './routes/messages.js'; 
import userRoutes from './routes/users.js';
import tierRoutes from './routes/tiers.js';
import batchRoutes from './routes/batches.js';
import contentRoutes from './routes/content.js';
import liveClassesRoutes from './routes/live-classes.js';
import servicesRoutes from './routes/services.js';
import serviceCategoriesRoutes from './routes/service-categories.js';
import appointmentsRoutes from './routes/appointments.js';
import pricingRoutes from './routes/pricing.js';
import attendanceRoutes from './routes/attendance.js'; 
import authRoutes from './routes/auth.js'; 

import { startNotificationCron } from './jobs/notification-cron.js';
import { startPaymentCheckCron } from './jobs/payment-check-cron.js';
import Message from './models/Message.js';
import Admin from './models/Admin.js'; // <-- NEW IMPORT

dotenv.config();

// Connect to MongoDB
connectDB(); 

// Create default admin in the NEW Admin table
const createDefaultAdmin = async () => {
  try {
    const adminExists = await Admin.findOne({ email: 'admin' });
    if (!adminExists) {
      await Admin.create({
        name: 'Super Admin',
        email: 'admin',
        password: 'Admin@1234',
        isActive: true
      });
      console.log('Default admin created in Admin table: admin / Admin@1234');
    }
  } catch (e) {
    console.error('Error creating default admin', e);
  }
};
createDefaultAdmin(); 

const app = express();
const PORT = process.env.PORT || 3001;

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST","PUT", "DELETE"] }
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admin Dashboard API is running' });
});

// Register All Endpoints
app.use('/api/users', userRoutes);
app.use('/api/tiers', tierRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/live-classes', liveClassesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/app', appApiRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/service-categories', serviceCategoriesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/messages', messagesRoutes); 
app.use('/api/attendance', attendanceRoutes); 
app.use('/api/auth', authRoutes); // Auth routes now handle admins

startPaymentCheckCron();
startNotificationCron();

io.on('connection', (socket) => {
  console.log(`User connected to Socket.io: ${socket.id}`);
  socket.on('join_batch', (batchId) => {
    socket.join(batchId);
  });
  socket.on('send_message', async (data) => {
    try {
      const newMessage = await Message.create({
        batchId: data.batchId,
        senderName: data.senderName,
        senderRole: data.senderRole || 'admin',
        text: data.text
      });
      io.to(data.batchId).emit('receive_message', newMessage.toJSON());
    } catch (error) {
      console.error('Error saving socket message:', error);
    }
  });
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;