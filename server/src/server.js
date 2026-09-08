const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const seedAllData = require('./utils/seedData');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const contractRoutes = require('./routes/contractRoutes');
const cropRoutes = require('./routes/cropRoutes');
const inspectionRoutes = require('./routes/inspectionRoutes');
const qualityRoutes = require('./routes/qualityRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Contract Farming Management System API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Manual Re-seed Endpoint
app.post('/api/seed', async (req, res) => {
  try {
    await seedAllData();
    res.status(200).json({ success: true, message: 'Database re-seeded successfully with demo accounts' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed if users collection is empty
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding starter records & demo roles...');
      await seedAllData();
    }
  } catch (seedErr) {
    console.warn(`[Server] Auto-seed check warning: ${seedErr.message}`);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌾 AgriFlow Contract Farming API Running on Port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
    console.log(`📡 Health:   http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;
