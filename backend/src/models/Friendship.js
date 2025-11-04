import mongoose from 'mongoose';

const FriendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  status:    { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

FriendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.model('Friendship', FriendshipSchema);
