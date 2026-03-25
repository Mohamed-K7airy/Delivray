import express from 'express';
import { createReview, getStoreReviews } from './reviewController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('customer'), createReview);
router.get('/store/:id', getStoreReviews);

export default router;
