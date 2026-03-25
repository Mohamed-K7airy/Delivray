import express from 'express';
import { createStore, getStores, getStoreById, updateStore, deleteStore, getMyStores, getMerchantStats, getMerchantBalance, getMerchantPayouts, getMerchantMapStats } from './storeController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getStores)
  .post(protect, authorizeRoles('merchant'), createStore);

router.get('/me', protect, authorizeRoles('merchant'), getMyStores);
router.get('/stats', protect, authorizeRoles('merchant'), getMerchantStats);
router.get('/balance', protect, authorizeRoles('merchant'), getMerchantBalance);
router.get('/payouts', protect, authorizeRoles('merchant'), getMerchantPayouts);
router.get('/map-stats', protect, authorizeRoles('merchant'), getMerchantMapStats);

router.route('/:id')
  .get(getStoreById)
  .patch(protect, authorizeRoles('merchant'), updateStore)
  .delete(protect, authorizeRoles('merchant'), deleteStore);

export default router;
