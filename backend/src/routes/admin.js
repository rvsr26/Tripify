import express from 'express';
import { getAnalytics } from '../controllers/admin.js';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Only admin can access this
router.get('/analytics', authMiddleware, roleMiddleware(['admin']), getAnalytics);

export default router;
