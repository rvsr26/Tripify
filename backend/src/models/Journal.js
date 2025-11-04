import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  date:      { type: Date, default: Date.now },
  title:     { type: String, default: '' },
  content:   { type: String, required: true },
  mood:      { type: String, enum: ['amazing', 'happy', 'neutral', 'tired', 'sad'], default: 'happy' },
  location:  { type: String, default: '' },
  photos:    [String],
  weather:   { type: String, default: '' },
  dayNumber: Number,
  createdAt: { type: Date, default: Date.now }
});

const JournalSchema = new mongoose.Schema({
  userId:    { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  tripId:    { type: mongoose.Types.ObjectId, ref: 'TripPlan', required: true },
  entries:   [journalEntrySchema],
  isPublic:  { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

JournalSchema.index({ userId: 1, tripId: 1 }, { unique: true });

export default mongoose.model('Journal', JournalSchema);
