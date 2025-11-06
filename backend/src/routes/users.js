import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import { searchUsers, getProfile } from '../controllers/users.js';

const router = express.Router();

router.get('/search', authMiddleware, searchUsers);
router.get('/:id',    authMiddleware, getProfile);

export default router;
