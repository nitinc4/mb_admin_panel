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

import { startNotificationCron } from './jobs/notification-cron.js';
import { startPaymentCheckCron } from './jobs/payment-check-cron.js';
import Message from './models/Message.js';

dotenv.config();

// Connect to MongoDB
connectDB(); 

const app = express();
const PORT = process.env.PORT || 3001;

// ==========================================
// MISSING SOCKET.IO INITIALIZATION ADDED HERE
// ==========================================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your Vite frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admin Dashboard API is running', database: 'MongoDB Connected' });
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

// Start Background CRON Jobs (Fixed)
startPaymentCheckCron();
startNotificationCron();

// --- SOCKET.IO LOGIC ---
io.on('connection', (socket) => {
  console.log(`User connected to Socket.io: ${socket.id}`);

  // User joins a specific batch group
  socket.on('join_batch', (batchId) => {
    socket.join(batchId);
    console.log(`Socket ${socket.id} joined batch ${batchId}`);
  });

  // Handle incoming message
  socket.on('send_message', async (data) => {
    try {
      // 1. Save message to MongoDB
      const newMessage = await Message.create({
        batchId: data.batchId,
        senderName: data.senderName,
        senderRole: data.senderRole || 'admin',
        text: data.text
      });

      // 2. Broadcast the formatted message back to everyone in the room
      io.to(data.batchId).emit('receive_message', newMessage.toJSON());
    } catch (error) {
      console.error('Error saving socket message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;