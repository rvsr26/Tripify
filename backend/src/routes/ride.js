import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middlewares/auth.js';
import { requestRide, getRide } from '../controllers/ride.js';

router.post('/request', authMiddleware, requestRide);
router.get('/:id', authMiddleware, getRide);

export default router;
