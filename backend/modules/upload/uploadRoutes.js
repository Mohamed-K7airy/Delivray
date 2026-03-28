import express from 'express';
import { uploadFile, uploadStoreImage, uploadProductImage, uploadProfileImage } from './uploadController.js';
import { upload } from '../../config/multer.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('merchant', 'admin'), upload.single('image'), uploadFile);
router.post('/store-image', protect, authorizeRoles('merchant'), upload.single('image'), uploadStoreImage);
router.post('/product-image', protect, authorizeRoles('merchant'), upload.single('image'), uploadProductImage);
router.post('/profile-image', protect, upload.single('image'), uploadProfileImage);

export default router;
