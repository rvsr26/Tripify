import express from 'express';
const router = express.Router();
import { register, login, me, refreshTokenController, googleLogin } from '../controllers/auth.js';
import { authMiddleware } from '../middlewares/auth.js';

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshTokenController);
router.post('/google', googleLogin);
router.get('/me', authMiddleware, me);

export default router;
