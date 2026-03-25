import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart } from './cartController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all cart routes
router.use(protect);
// Restrict cart largely to customers, though others can potentially have a cart if needed.
// According to spec: Cart System (Customer)
router.use(authorizeRoles('customer'));

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/update', updateCartItem);
router.delete('/remove', removeFromCart);

export default router;
