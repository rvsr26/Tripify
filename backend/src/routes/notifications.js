import express from 'express';
import { registerToken } from '../controllers/notifications.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/token', authMiddleware, registerToken);

export default router;
