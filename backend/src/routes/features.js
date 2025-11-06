import express from 'express';
const router = express.Router();
import { authMiddleware } from '../middlewares/auth.js';
import {
  getQuizResult,
  getTravelStats,
  addExpense,
  getSettlements,
  getBucketList,
  addBucketItem,
  updateBucketItem,
  removeBucketItem,
  createStory,
  getStories,
  getStory,
  likeStory,
  generateCaptions,
  getJournal,
  addJournalEntry,
  chatbotMessage,
  publishTemplate,
  getTemplates,
  cloneTemplate,
  getMatchCandidates,
  getWeather,
  getDealAlerts,
} from '../controllers/features.js';

// ── Quiz ──
router.post('/quiz',                        authMiddleware, getQuizResult);

// ── Stats ──
router.get('/stats',                        authMiddleware, getTravelStats);

// ── Expenses ──
router.post('/trips/:id/expenses',          authMiddleware, addExpense);
router.get('/trips/:id/settlements',        authMiddleware, getSettlements);

// ── Bucket List ──
router.get('/bucket-list',                  authMiddleware, getBucketList);
router.post('/bucket-list',                 authMiddleware, addBucketItem);
router.patch('/bucket-list/:itemId',        authMiddleware, updateBucketItem);
router.delete('/bucket-list/:itemId',       authMiddleware, removeBucketItem);

// ── Stories ──
router.post('/stories',                     authMiddleware, createStory);
router.get('/stories',                      authMiddleware, getStories);
router.get('/stories/:id',                  authMiddleware, getStory);
router.post('/stories/:id/like',            authMiddleware, likeStory);
router.post('/stories/captions',            authMiddleware, generateCaptions);

// ── Journal ──
router.get('/journal/:tripId',              authMiddleware, getJournal);
router.post('/journal/:tripId',             authMiddleware, addJournalEntry);

// ── Chatbot ──
router.post('/chatbot',                     authMiddleware, chatbotMessage);

// ── Templates ──
router.get('/templates',                    authMiddleware, getTemplates);
router.post('/templates/:id/publish',       authMiddleware, publishTemplate);
router.post('/templates/:id/clone',         authMiddleware, cloneTemplate);

// ── Matchmaker ──
router.get('/matchmaker',                   authMiddleware, getMatchCandidates);

// ── Weather ──
router.get('/weather',                      authMiddleware, getWeather);

// ── Deals ──
router.get('/deals',                        authMiddleware, getDealAlerts);

export default router;
