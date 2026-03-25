import express from 'express';
import { createProduct, getProducts, updateProduct, deleteProduct } from './productController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorizeRoles('merchant'), createProduct);

router.route('/:id')
  .patch(protect, authorizeRoles('merchant'), updateProduct)
  .delete(protect, authorizeRoles('merchant'), deleteProduct);

export default router;
