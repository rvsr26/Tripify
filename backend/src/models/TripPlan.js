import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  userId:   { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  role:     { type: String, enum: ['admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const joinRequestSchema = new mongoose.Schema({
  userId:      { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  message:     { type: String, default: '' },
  // 'pending' = stranger requested; 'invited' = admin invited friend
  status:      { type: String, enum: ['pending', 'invited', 'accepted', 'declined'], default: 'pending' },
  requestedAt: { type: Date, default: Date.now }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  description: String,
  amount:      Number,
  category:    { type: String, default: 'Other' },
  paidBy:      { type: mongoose.Types.ObjectId, ref: 'User' },
  splitAmong:  [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  date:        { type: Date, default: Date.now }
}, { _id: false });

const chatMessageSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user', 'ai'] },
  content:   String,
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const TripPlanSchema = new mongoose.Schema({
  userId:                { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  // Trip data
  title:                 { type: String, default: 'My Trip' },
  city:                  String,
  budget:                Number,
  days:                  Number,
  interests:             [String],
  prompt:                String,
  itinerary:             mongoose.Schema.Types.Mixed,
  estimatedCost:         Number,
  isPublic:              { type: Boolean, default: false },
  isTemplate:            { type: Boolean, default: false },
  // AI flow
  naturalLanguagePrompt: String,
  selectedOption:        { type: String, enum: ['A', 'B', 'C'] },
  optionName:            String,
  currency:              { type: String, default: '$' },
  month:                 String,
  travelWith:            String,
  // Packing & budget
  packingList:           mongoose.Schema.Types.Mixed,
  budgetSpent:           { type: Number, default: 0 },
  expenses:              [expenseSchema],
  // AI chat
  chatHistory:           [chatMessageSchema],
  // Social
  likes:                 [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  commentsCount:         { type: Number, default: 0 },
  // ── Collaborative trip fields ──────────────────────────────────────────
  admin:                 { type: mongoose.Types.ObjectId, ref: 'User' },      // trip admin (creator)
  members:               [memberSchema],                                       // all participants
  isOpenToJoin:          { type: Boolean, default: false },                   // strangers can request
  maxMembers:            { type: Number, default: 20 },
  joinRequests:          [joinRequestSchema],                                  // pending / invited
  inviteToken:           { type: String, unique: true, sparse: true },        // UUID for invite link
  // ── Map Location ────────────────────────────────────────────────────────
  location: {
    lat:     Number,
    lng:     Number,
    address: String
  },
  // ── Elite & Atlas Features ──────────────────────────────────────────────
  canvasState: {
    markers: [{ id: String, lat: Number, lng: Number, label: String, senderId: String }],
    notes:   [{ id: String, x: Number, y: Number, text: String, senderId: String }],
    lastModifiedBy: { type: mongoose.Types.ObjectId, ref: 'User' }
  },
  impactTags: { type: [String], default: [] }, // "Eco-friendly", "Historical Heritage", etc.
  scores: {
    culturalDepth:   { type: Number, default: 0 },
    sustainability:  { type: Number, default: 0 }
  },
  createdAt:             { type: Date, default: Date.now }
});

export default mongoose.model('TripPlan', TripPlanSchema);
