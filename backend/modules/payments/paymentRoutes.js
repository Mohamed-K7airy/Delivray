import express from 'express';
import { initiatePayment, paymentWebhook } from './paymentController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/initiate', protect, authorizeRoles('customer'), initiatePayment);
router.post('/webhook', paymentWebhook);

export default router;
