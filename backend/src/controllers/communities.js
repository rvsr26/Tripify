import Community from '../models/Community.js';

// ── Create Community ─────────────────────────────────────────────────────────
export async function createCommunity(req, res) {
  try {
    const { name, description, category, icon, tags } = req.body;
    const userId = req.userId;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Community name is required (min 2 chars)' });
    }

    // Pick a random cover color
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
    const coverColor = colors[Math.floor(Math.random() * colors.length)];

    const community = await Community.create({
      name: name.trim(),
      description: description || '',
      category: category || 'General',
      icon: icon || '🌍',
      coverColor,
      tags: tags || [],
      creator: userId,
      members: [{ userId, role: 'creator' }],
      memberCount: 1,
    });

    res.json({ community });
  } catch (e) {
    console.error('createCommunity error:', e);
    res.status(500).json({ error: e.message });
  }
}

// ── List / Discover Communities ───────────────────────────────────────────────
export async function listCommunities(req, res) {
  try {
    const { search, category } = req.query;
    let query = { isPublic: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    const communities = await Community.find(query)
      .populate('creator', 'name username')
      .sort({ memberCount: -1, createdAt: -1 })
      .lean();

    res.json({ communities });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ── My Communities ───────────────────────────────────────────────────────────
export async function myCommunities(req, res) {
  try {
    const communities = await Community.find({ 'members.userId': req.userId })
      .populate('creator', 'name username')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ communities });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ── Get Single Community ─────────────────────────────────────────────────────
export async function getCommunity(req, res) {
  try {
    const community = await Community.findById(req.params.id)
      .populate('creator', 'name username')
      .populate('members.userId', 'name username')
      .populate('posts.userId', 'name username');

    if (!community) return res.status(404).json({ error: 'Community not found' });
    res.json({ community });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ── Join Community ───────────────────────────────────────────────────────────
export async function joinCommunity(req, res) {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const isMember = community.members.some(m => m.userId.toString() === req.userId);
    if (isMember) return res.status(400).json({ error: 'Already a member' });

    community.members.push({ userId: req.userId, role: 'member' });
    community.memberCount = community.members.length;
    await community.save();

    res.json({ success: true, memberCount: community.memberCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ── Leave Community ──────────────────────────────────────────────────────────
export async function leaveCommunity(req, res) {
  try {
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    if (community.creator.toString() === req.userId) {
      return res.status(400).json({ error: 'Creator cannot leave. Delete the community instead.' });
    }

    community.members = community.members.filter(m => m.userId.toString() !== req.userId);
    community.memberCount = community.members.length;
    await community.save();

    res.json({ success: true, memberCount: community.memberCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ── Delete Community ─────────────────────────────────────────────────────────
export async function deleteCommunity(req, res) {
  try {
    const community = await Community.findOneAndDelete({ _id: req.params.id, creator: req.userId });
    if (!community) return res.status(404).json({ error: 'Not found or not creator' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ── Create Post in Community ─────────────────────────────────────────────────
export async function createPost(req, res) {
  try {
    const { content } = req.body;
    if (!content || content.trim().length < 1) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const isMember = community.members.some(m => m.userId.toString() === req.userId);
    if (!isMember) return res.status(403).json({ error: 'You must be a member to post' });

    community.posts.push({ userId: req.userId, content: content.trim() });
    await community.save();

    // Return populated post
    const updated = await Community.findById(req.params.id)
      .populate('posts.userId', 'name username');

    res.json({ posts: updated.posts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// ── Like Post ────────────────────────────────────────────────────────────────
export async function likePost(req, res) {
  try {
    const { postId } = req.params;
    const community = await Community.findById(req.params.id);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const post = community.posts.id(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const idx = post.likes.indexOf(req.userId);
    if (idx > -1) {
      post.likes.splice(idx, 1); // unlike
    } else {
      post.likes.push(req.userId); // like
    }

    await community.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
