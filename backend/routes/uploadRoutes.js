import express from 'express';
import { uploadFile } from '../modules/upload/uploadController.js';
import { upload } from '../config/multer.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only merchants and admins can upload media
router.post('/', protect, authorizeRoles('merchant', 'admin'), upload.single('file'), uploadFile);

export default router;
