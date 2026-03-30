import express from 'express';
import { getUsers, updateUserStatus, getAdminStores, toggleStoreAdminDisable, getPendingUsers, approveUser, getAllOrders, getAdminStats, getAdminFinancials, getAdminPromos, createPromoCode, deletePromoCode, getAdvancedStats, getPendingPayouts, approvePayout, settleDriverPayouts } from './adminController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/stores', getAdminStores);
router.patch('/stores/:id/toggle-disable', toggleStoreAdminDisable);
router.get('/pending-users', getPendingUsers);
router.patch('/approve-user/:id', approveUser);
router.get('/orders', getAllOrders);
router.get('/stats', getAdminStats);
router.get('/analytics', getAdvancedStats);
router.get('/financials', getAdminFinancials);
router.get('/pending-payouts', getPendingPayouts);
router.patch('/payouts/:id/approve', approvePayout);
router.post('/settle-driver-payouts', settleDriverPayouts);
router.get('/promos', getAdminPromos);
router.post('/promos', createPromoCode);
router.delete('/promos/:id', deletePromoCode);

export default router;
