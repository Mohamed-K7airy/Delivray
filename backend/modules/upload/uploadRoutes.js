import express from 'express';
import { uploadFile } from './uploadController.js';
import { upload } from '../../config/multer.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('merchant', 'admin'), upload.single('image'), uploadFile);

export default router;
