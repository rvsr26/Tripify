import mongoose from 'mongoose';

const storySlideSchema = new mongoose.Schema({
  imageUrl:  { type: String, default: '' },
  caption:   { type: String, default: '' },
  location:  { type: String, default: '' },
  bgColor:   { type: String, default: '#6366f1' },
});

const StorySchema = new mongoose.Schema({
  userId:    { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  tripId:    { type: mongoose.Types.ObjectId, ref: 'TripPlan' },
  title:     { type: String, default: 'My Trip Story' },
  slides:    [storySlideSchema],
  likes:     [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  views:     { type: Number, default: 0 },
  isPublic:  { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Story', StorySchema);
