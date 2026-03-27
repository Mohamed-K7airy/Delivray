import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initIo } from './config/socket.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './modules/admin/adminRoutes.js';
import storeRoutes from './modules/stores/storeRoutes.js';
import productRoutes from './modules/products/productRoutes.js';
import categoryRoutes from './modules/products/categoryRoutes.js';
import cartRoutes from './modules/cart/cartRoutes.js';
import orderRoutes from './modules/orders/orderRoutes.js';
import deliveryRoutes from './modules/delivery/deliveryRoutes.js';
import paymentRoutes from './modules/payments/paymentRoutes.js';
import reviewRoutes from './modules/reviews/reviewRoutes.js';
import promoRoutes from './modules/promo/promoRoutes.js';

dotenv.config();

// 1. Environment Validation
const requiredEnv = ['JWT_SECRET', 'SUPABASE_URL', 'SUPABASE_KEY'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);
if (missingEnv.length > 0) {
  console.error(`FATAL: Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);

// 3. Secure Socket.io with Auth and Restricted Joining
import { socketAuth } from './middlewares/authMiddleware.js';
export const io = initIo(httpServer);
io.use(socketAuth);

const PORT = process.env.PORT || 5000;

// 2. Restricted CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000, // Limit each IP to 1000 requests per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});
app.use(limiter);

app.use(express.json());
app.use(cookieParser());

// Global Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/stores', storeRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/promos', promoRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Delivray API is running...', timestamp: new Date() });
});

// 404 Handler (JSON)
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

io.on('connection', (socket) => {
  const { id: userId, role } = socket.data.user;
  console.log(`User connected: ${socket.id} (User: ${userId}, Role: ${role})`);
  
  socket.on('join', ({ role: requestedRole, id: requestedId }) => {
    // SECURITY: Validate that the user is joining their OWN room or an authorized room
    if (requestedRole === 'merchant') {
      if (role !== 'admin' && (role !== 'merchant' || userId !== requestedId)) {
        return socket.emit('error', { message: 'Unauthorized room join' });
      }
      socket.join(`merchant_${requestedId}`);
      console.log(`User ${userId} joined merchant room: ${requestedId}`);
    } 
    else if (requestedRole === 'driver') {
      if (role !== 'admin' && (role !== 'driver' || userId !== requestedId)) {
        return socket.emit('error', { message: 'Unauthorized room join' });
      }
      socket.join(`driver_${requestedId}`);
      socket.join('drivers'); // Drivers room for broadcasts
      console.log(`User ${userId} joined driver rooms`);
    }
    else if (requestedRole === 'admin') {
      if (role !== 'admin') {
        return socket.emit('error', { message: 'Unauthorized room join' });
      }
      socket.join('admin_global');
      console.log(`Admin ${userId} joined global pulse room`);
    }
  });

  socket.on('join_order', (orderId) => {
    // In a full implementation, we'd verify the user is part of this order
    // For now, we join, but with the secure connection established
    socket.join(`order_${orderId}`);
  });

  socket.on('update_location', ({ lat, lng, orderId }) => {
    // SECURITY: Only drivers can update location
    if (role !== 'driver') return;
    
    // Broadcast to the order room so the customer can see
    io.to(`order_${orderId}`).emit('driver_location', { 
      driverId: userId,
      lat, 
      lng,
      timestamp: new Date().toISOString()
    });
    
    // Also broadcast to admin room for Global Pulse
    io.to('admin_global').emit('driver_location_pulse', {
      driverId: userId,
      lat,
      lng,
      orderId
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// 4. Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
