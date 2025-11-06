import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middlewares/auth.js';
import { createBooking, getBooking } from '../controllers/booking.js';
router.post('/', authMiddleware, createBooking);
router.get('/:id', authMiddleware, getBooking);
export default router;
