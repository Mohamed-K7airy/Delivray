import express from 'express';
import { createReview, getTargetReviews } from './reviewController.js';
import { protect } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/:type/:id', getTargetReviews);

export default router;
