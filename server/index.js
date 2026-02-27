import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/users.js';
import tierRoutes from './routes/tiers.js';
import batchRoutes from './routes/batches.js';
import contentRoutes from './routes/content.js';
import liveClassesRoutes from './routes/live-classes.js';
import servicesRoutes from './routes/services.js';
import appointmentsRoutes from './routes/appointments.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import pricingRoutes from './routes/pricing.js';
import { startPaymentCheckCron } from './jobs/payment-check-cron.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Admin Dashboard API is running' });
});

app.use('/api/users', userRoutes);
app.use('/api/tiers', tierRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/live-classes', liveClassesRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/pricing', pricingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startPaymentCheckCron();
});
