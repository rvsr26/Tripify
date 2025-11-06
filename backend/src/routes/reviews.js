import express from 'express';
import { addReview, getReviews } from '../controllers/reviews.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authMiddleware, addReview);
router.get('/:placeId', getReviews);

export default router;
