import express from 'express';
import { createCategory, getCategories, deleteCategory } from './categoryController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/store/:storeId', getCategories);
router.post('/', protect, authorizeRoles('merchant'), createCategory);
router.delete('/:id', protect, authorizeRoles('merchant'), deleteCategory);

export default router;
