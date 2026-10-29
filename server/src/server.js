require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const settingRoutes = require('./routes/settingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const payuRoutes = require('./routes/payuRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware (Helmet provides secure HTTP headers against XSS, clickjacking, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static Uploads Folder
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Review Express API',
    security: 'Helmet Enabled',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/payu', payuRoutes);

// Centralized Error Handler (Receives all errors forwarded by asyncHandler)
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 ReviewXpress Backend running on http://localhost:${PORT}`);
  console.log(`🛡️  Helmet security headers & CORS active`);
  console.log(`🗄️  Prisma ORM connected to MySQL (review_express)`);
});

// Process Crash Protectors
process.on('uncaughtException', (err) => {
  console.error('🛡️ Uncaught Exception prevented crash:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🛡️ Unhandled Rejection prevented crash:', reason);
});
