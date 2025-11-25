import Friendship from '../models/Friendship.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// ─── Send friend request (by username) ───────────────────────────────────────
export async function sendRequest(req, res) {
  try {
    const requesterId = req.userId;
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'username required' });

    const recipient = await User.findOne({ username: username.toLowerCase().trim() });
    if (!recipient) return res.status(404).json({ error: 'User not found' });
    if (recipient._id.toString() === requesterId) return res.status(400).json({ error: 'You cannot add yourself' });

    // Check if friendship already exists in either direction
    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipient._id },
        { requester: recipient._id, recipient: requesterId }
      ]
    });
    if (existing) {
      const msgs = { pending: 'Request already sent', accepted: 'Already friends', declined: 'Request was declined — try again' };
      if (existing.status !== 'declined') return res.status(409).json({ error: msgs[existing.status] });
      // Allow re-request if previously declined
      await Friendship.deleteOne({ _id: existing._id });
    }

    const friendship = await Friendship.create({ requester: requesterId, recipient: recipient._id });
    res.json({ friendship, recipient: { id: recipient._id, name: recipient.name, username: recipient.username } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}

// ─── Get incoming pending requests ───────────────────────────────────────────
export async function getIncomingRequests(req, res) {
  try {
    const requests = await Friendship.find({ recipient: req.userId, status: 'pending' })
      .populate('requester', 'name username bio')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ─── Get outgoing requests ────────────────────────────────────────────────────
export async function getOutgoingRequests(req, res) {
  try {
    const requests = await Friendship.find({ requester: req.userId, status: 'pending' })
      .populate('recipient', 'name username bio')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ─── Get accepted friends list ────────────────────────────────────────────────
export async function getFriends(req, res) {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    })
      .populate('requester', 'name username bio')
      .populate('recipient', 'name username bio')
      .sort({ createdAt: -1 });

    const friends = friendships.map(f => {
      const isRequester = f.requester._id.toString() === req.userId;
      const friend = isRequester ? f.recipient : f.requester;
      return { friendshipId: f._id, ...friend.toObject() };
    });

    res.json({ friends });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ─── Accept request ───────────────────────────────────────────────────────────
export async function acceptRequest(req, res) {
  try {
    const f = await Friendship.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    ).populate('requester', 'name username');
    if (!f) return res.status(404).json({ error: 'Request not found' });
    res.json({ friendship: f });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ─── Decline request ──────────────────────────────────────────────────────────
export async function declineRequest(req, res) {
  try {
    const f = await Friendship.findOneAndUpdate(
      { _id: req.params.id, recipient: req.userId, status: 'pending' },
      { status: 'declined' },
      { new: true }
    );
    if (!f) return res.status(404).json({ error: 'Request not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ─── Cancel sent request ──────────────────────────────────────────────────────
export async function cancelRequest(req, res) {
  try {
    await Friendship.findOneAndDelete({ _id: req.params.id, requester: req.userId, status: 'pending' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ─── Remove friend ────────────────────────────────────────────────────────────
export async function removeFriend(req, res) {
  try {
    const userId = req.userId;
    await Friendship.findOneAndDelete({
      _id: req.params.id,
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ─── Pending count (for notification dot) ────────────────────────────────────
export async function getPendingCount(req, res) {
  try {
    const count = await Friendship.countDocuments({ recipient: req.userId, status: 'pending' });
    res.json({ count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Build verification patch on 11/25/2025, 10:32:00 AM
