import mongoose from 'mongoose';

const bucketItemSchema = new mongoose.Schema({
  destination: { type: String, required: true },
  country:     { type: String, default: '' },
  emoji:       { type: String, default: '📍' },
  visited:     { type: Boolean, default: false },
  visitedDate: Date,
  tripId:      { type: mongoose.Types.ObjectId, ref: 'TripPlan' },
  notes:       { type: String, default: '' },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'dream'], default: 'medium' },
  location:    { lat: Number, lng: Number },
  addedAt:     { type: Date, default: Date.now }
});

const BucketListSchema = new mongoose.Schema({
  userId:      { type: mongoose.Types.ObjectId, ref: 'User', required: true, unique: true },
  items:       [bucketItemSchema],
  isPublic:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now }
});

export default mongoose.model('BucketList', BucketListSchema);
