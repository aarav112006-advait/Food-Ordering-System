require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { initSocket } = require('./sockets/trackingSocket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize real-time tracking WebSocket
const io = initSocket(server);
app.set('io', io);

// Security & Utility Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Special raw body handling for Stripe Webhooks MUST precede express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Standard body parsers for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root Documentation
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Online Food Ordering System API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      restaurants: '/api/restaurants',
      orders: '/api/orders',
      payments: '/api/payments',
      recommendations: '/api/recommendations',
      reviews: '/api/reviews'
    },
    websocketRooms: 'join_order, leave_order, driver_location_updated, order_status_updated',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reviews', reviewRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[Server] Food Ordering System Backend listening on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.name}: ${err.message}`);
});

module.exports = { app, server };
