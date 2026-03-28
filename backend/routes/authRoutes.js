import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getMe, 
  verifyEmail, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Email Verification & Password Reset
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
