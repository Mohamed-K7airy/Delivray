import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { initIo } from './config/socket.js';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import storeRoutes from './modules/stores/storeRoutes.js';
import productRoutes from './modules/products/productRoutes.js';
import cartRoutes from './modules/cart/cartRoutes.js';
import orderRoutes from './modules/orders/orderRoutes.js';
import deliveryRoutes from './modules/delivery/deliveryRoutes.js';
import paymentRoutes from './modules/payments/paymentRoutes.js';
import reviewRoutes from './modules/reviews/reviewRoutes.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

export const io = initIo(httpServer);

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || true,
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

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/stores', storeRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Delivray API is running...' });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  socket.on('join', ({ role, id }) => {
    if (role === 'merchant') socket.join(`merchant_${id}`);
    else if (role === 'driver') {
      socket.join(`driver_${id}`);
      socket.join('drivers');
    }
  });

  socket.on('join_order', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
