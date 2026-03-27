import express from 'express';
import { validatePromo, createPromo } from './promoController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/validate', protect, validatePromo);
router.post('/', protect, authorizeRoles('admin'), createPromo);

export default router;
