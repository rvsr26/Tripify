import express from 'express';
import { getFeed, likeTrip } from '../controllers/social.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.get('/feed',         authMiddleware, getFeed);
router.post('/:id/like',    authMiddleware, likeTrip);

export default router;
