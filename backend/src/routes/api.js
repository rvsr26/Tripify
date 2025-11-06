import express from 'express';
import authRoutes from './auth.js';
import plannerRoutes from './planner.js';
import bookingRoutes from './booking.js';
import rideRoutes from './ride.js';
import webhookRoutes from './webhook.js';
import reviewsRoutes from './reviews.js';
import socialRoutes from './social.js';
import notificationsRoutes from './notifications.js';
import adminRoutes from './admin.js';
import friendsRoutes from './friends.js';
import usersRoutes from './users.js';
import communitiesRoutes from './communities.js';
import featuresRoutes from './features.js';
import experiencesRoutes from './experiences.js';
import uploadRoutes      from './upload.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/planner', plannerRoutes);
router.use('/bookings', bookingRoutes);
router.use('/ride', rideRoutes);
router.use('/webhook', webhookRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/social', socialRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin', adminRoutes);
router.use('/friends', friendsRoutes);
router.use('/users', usersRoutes);
router.use('/communities', communitiesRoutes);
router.use('/features', featuresRoutes);
router.use('/experiences', experiencesRoutes);
router.use('/upload',      uploadRoutes);

export default router;
