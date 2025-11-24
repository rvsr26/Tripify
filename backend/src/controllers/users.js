import User from '../models/User.js';
import TripPlan from '../models/TripPlan.js';
import Friendship from '../models/Friendship.js';
import mongoose from 'mongoose';

// ─── Search users by username or name ────────────────────────────────────────
export async function searchUsers(req, res) {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return res.json({ users: [] });

    const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      _id:  { $ne: req.userId },
      $or:  [{ username: regex }, { name: regex }]
    })
      .select('name username bio')
      .limit(20);

    // Annotate friendship status for each result
    const myId = new mongoose.Types.ObjectId(req.userId);
    const ids   = users.map(u => u._id);
    const friendships = await Friendship.find({
      $or: [
        { requester: myId, recipient: { $in: ids } },
        { recipient: myId, requester: { $in: ids } }
      ]
    });

    const fMap = {};
    friendships.forEach(f => {
      const otherId = f.requester.toString() === req.userId
        ? f.recipient.toString()
        : f.requester.toString();
      fMap[otherId] = { status: f.status, id: f._id, iSent: f.requester.toString() === req.userId };
    });

    const enriched = users.map(u => ({
      ...u.toObject(),
      friendship: fMap[u._id.toString()] || null
    }));

    res.json({ users: enriched });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

// ─── Get public profile ───────────────────────────────────────────────────────
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.params.id).select('name username bio createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const tripCount   = await TripPlan.countDocuments({ userId: req.params.id, isPublic: true });
    const friendCount = await Friendship.countDocuments({
      $or: [{ requester: req.params.id }, { recipient: req.params.id }],
      status: 'accepted'
    });

    res.json({ user: { ...user.toObject(), tripCount, friendCount } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Build verification patch on 11/24/2025, 11:34:00 AM
