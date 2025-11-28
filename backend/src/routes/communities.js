import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middlewares/auth.js';
import {
  createCommunity,
  listCommunities,
  myCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  deleteCommunity,
  createPost,
  likePost
} from '../controllers/communities.js';

router.post('/',            authMiddleware, createCommunity);
router.get('/',             authMiddleware, listCommunities);
router.get('/mine',         authMiddleware, myCommunities);
router.get('/:id',          authMiddleware, getCommunity);
router.post('/:id/join',    authMiddleware, joinCommunity);
router.post('/:id/leave',   authMiddleware, leaveCommunity);
router.delete('/:id',       authMiddleware, deleteCommunity);
router.post('/:id/posts',   authMiddleware, createPost);
router.post('/:id/posts/:postId/like', authMiddleware, likePost);

export default router;
