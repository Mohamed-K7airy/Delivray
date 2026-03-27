import express from 'express';
import { getMyShifts, createShift, deleteShift, getAllShifts } from './schedulingController.js';
import { protect, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/shifts', authorizeRoles('driver'), getMyShifts);
router.post('/shifts', authorizeRoles('driver'), createShift);
router.delete('/shifts/:id', authorizeRoles('driver'), deleteShift);

router.get('/admin/all', authorizeRoles('admin'), getAllShifts);

export default router;
