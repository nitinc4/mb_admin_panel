import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import paymentRoutes from './routes/payments.js';
// All Route Imports
import userRoutes from './routes/users.js';
import tierRoutes from './routes/tiers.js';
import batchRoutes from './routes/batches.js';
import contentRoutes from './routes/content.js';
import liveClassesRoutes from './routes/live-classes.js';
import servicesRoutes from './routes/services.js';
import serviceCategoriesRoutes from './routes/service-categories.js';
import appointmentsRoutes from './routes/appointments.js';

// Optional routes (keep these if you have the files)
import { startPaymentCheckCron } from './jobs/payment-check-cron.js';
import pricingRoutes from './routes/pricing.js';

dotenv.config();

// Connect to MongoDB
connectDB(); 

const app = express();
const PORT = process.env.PORT || 3001;

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

// <-- THESE 3 LINES FIX YOUR 404 ERRORS -->
app.use('/api/services', servicesRoutes);
app.use('/api/service-categories', serviceCategoriesRoutes);
app.use('/api/appointments', appointmentsRoutes);

// Optional endpoints
app.use('/api/jobs', startPaymentCheckCron);
app.use('/api/pricing', pricingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});