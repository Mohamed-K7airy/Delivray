import express from 'express';
import { getPendingUsers, approveUser, getAllOrders, getStats } from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/pending-users', getPendingUsers);
router.patch('/approve-user/:id', approveUser);
router.get('/orders', getAllOrders);
router.get('/stats', getStats);

export default router;
