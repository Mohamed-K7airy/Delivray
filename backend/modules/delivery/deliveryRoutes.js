import express from 'express';
import { getAvailableOrders, acceptOrder, completeOrder, updateLocation, getDriverStats } from './deliveryController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('driver'));

router.get('/available-orders', getAvailableOrders);
router.post('/accept-order/:id', acceptOrder);
router.patch('/complete-order/:id', completeOrder);
router.get('/stats', getDriverStats);
router.patch('/location', updateLocation);

export default router;
