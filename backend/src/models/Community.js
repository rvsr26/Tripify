import mongoose from 'mongoose';

const communityMemberSchema = new mongoose.Schema({
  userId:   { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  role:     { type: String, enum: ['creator', 'admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const communityPostSchema = new mongoose.Schema({
  userId:    { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  content:   { type: String, required: true },
  likes:     [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const CommunitySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category:    { type: String, default: 'General' },
  icon:        { type: String, default: '🌍' },
  coverColor:  { type: String, default: '#6366f1' },
  tags:        [String],
  creator:     { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  members:     [communityMemberSchema],
  posts:       [communityPostSchema],
  memberCount: { type: Number, default: 1 },
  isPublic:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
});

// Index for search
CommunitySchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model('Community', CommunitySchema);

// Build verification patch on 11/25/2025, 2:31:00 PM
