import express from 'express';
import { getAvailableOrders, acceptOrder, completeOrder, updateLocation, getDriverStats, getDriverHistory, requestDriverWithdrawal } from './deliveryController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('driver'));

router.get('/available-orders', getAvailableOrders);
router.post('/accept-order/:id', acceptOrder);
router.patch('/complete-order/:id', completeOrder);
router.get('/stats', getDriverStats);
router.post('/withdraw', requestDriverWithdrawal);
router.get('/history', getDriverHistory);
router.patch('/location', updateLocation);

export default router;
