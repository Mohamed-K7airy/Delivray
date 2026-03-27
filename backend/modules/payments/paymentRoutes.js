import express from 'express';
import { createPaymentIntent, paymentWebhook } from './paymentController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Raw body needed for Stripe webhook signature verification
router.post('/create-intent', protect, authorizeRoles('customer'), createPaymentIntent);

// Note: Stripe Webhook route should use express.raw({type: 'application/json'}) in server.js
router.post('/webhook', express.raw({ type: 'application/json' }), paymentWebhook);

export default router;
