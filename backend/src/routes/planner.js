import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middlewares/auth.js';
import {
  createPlan,
  generateOptions,
  selectPlan,
  chatWithTrip,
  generatePackingListController,
  getSafetyInfoController,
  addExpenseController,
  updateTripController,
  getMyTrips,
  getTripById,
  deleteTrip,
  updateTripSettings,
  joinTripByToken,
  requestToJoin,
  handleJoinRequest,
  removeMember,
  getDestinationReviews,
  backfillCoordinates
} from '../controllers/planner.js';

// ── AI flow ──
router.post('/options',        authMiddleware, generateOptions);
router.post('/select',         authMiddleware, selectPlan);
router.post('/:id/chat',       authMiddleware, chatWithTrip);
router.post('/:id/packing',    authMiddleware, generatePackingListController);
router.get('/:id/safety',      authMiddleware, getSafetyInfoController);
router.post('/:id/expenses',   authMiddleware, addExpenseController);
router.get('/:id/reviews',     authMiddleware, getDestinationReviews);
router.patch('/:id',           authMiddleware, updateTripController);

// ── Collaborative Features ──
router.patch('/:id/settings',             authMiddleware, updateTripSettings);
router.post('/join/:token',               authMiddleware, joinTripByToken);
router.post('/:id/join-request',          authMiddleware, requestToJoin);
router.patch('/:id/join-requests/:userId', authMiddleware, handleJoinRequest); // status in body
router.delete('/:id/members/:userId',      authMiddleware, removeMember);

// ── Utilities ──
router.post('/backfill-coords',  authMiddleware, backfillCoordinates);

// ── CRUD ──
router.post('/',               authMiddleware, createPlan);
router.get('/',                authMiddleware, getMyTrips);
router.get('/:id',             authMiddleware, getTripById);
router.delete('/:id',          authMiddleware, deleteTrip);

export default router;
