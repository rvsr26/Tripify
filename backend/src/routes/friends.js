import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  sendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  getFriends,
  acceptRequest,
  declineRequest,
  cancelRequest,
  removeFriend,
  getPendingCount
} from '../controllers/friends.js';

const router = express.Router();

router.post('/request',       authMiddleware, sendRequest);
router.get('/requests',       authMiddleware, getIncomingRequests);
router.get('/requests/sent',  authMiddleware, getOutgoingRequests);
router.get('/',               authMiddleware, getFriends);
router.get('/count',          authMiddleware, getPendingCount);
router.patch('/:id/accept',   authMiddleware, acceptRequest);
router.patch('/:id/decline',  authMiddleware, declineRequest);
router.delete('/:id/cancel',  authMiddleware, cancelRequest);
router.delete('/:id',         authMiddleware, removeFriend);

export default router;
