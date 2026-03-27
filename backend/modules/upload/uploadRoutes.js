import express from 'express';
import multer from 'multer';
import { uploadFile } from './uploadController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', protect, authorizeRoles('merchant', 'admin'), upload.single('image'), uploadFile);

export default router;
