import express from 'express';
import { createOrder, getMerchantOrders, updateOrderStatus, getCustomerOrders, getDriverOrders, getOrderById, getMerchantStats, cancelOrder } from './orderController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Apply protect middleware
router.use(protect);

// Customer routes
router.post('/', authorizeRoles('customer'), createOrder);
router.get('/me', authorizeRoles('customer'), getCustomerOrders);
router.post('/:id/cancel', authorizeRoles('customer'), cancelOrder);

// Merchant routes
router.get('/merchant', authorizeRoles('merchant'), getMerchantOrders);
router.get('/merchant/stats', authorizeRoles('merchant'), getMerchantStats);
router.patch('/:id/status', authorizeRoles('merchant'), updateOrderStatus);

// Driver routes
router.get('/driver', authorizeRoles('driver'), getDriverOrders);

// Parameterized fetch (Must be last to avoid shadowing)
router.get('/:id', getOrderById);

export default router;
