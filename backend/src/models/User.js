import mongoose from 'mongoose';

function generateUsername(name = '') {
  const base = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join('_')
    .slice(0, 16) || 'user';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}_${suffix}`;
}

const Schema = new mongoose.Schema({
  name:         String,
  username:     { type: String, unique: true, sparse: true },
  email:        { type: String, unique: true, required: true },
  passwordHash: String,
  bio:          { type: String, default: '' },
  phone:        String,
  role:         { type: String, enum: ['user', 'admin', 'driver'], default: 'user' },
  googleId:     String,
  refreshToken: String,
  fcmToken:     String,
  preferences:  { type: [String], default: [] },
  membership: {
    tier:             { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Elite'], default: 'Bronze' },
    experiencePoints: { type: Number, default: 0 },
    unlockedTokens:   [{ type: String }] // For private community "keys"
  },
  travelROI: {
    culturalDepth:       { type: Number, default: 0 },
    sustainabilityScore: { type: Number, default: 0 },
    totalCarbonOffset:   { type: Number, default: 0 },
    totalReviews:        { type: Number, default: 0 }
  },
  createdAt:    { type: Date, default: Date.now }
});

Schema.statics.generateUsername = generateUsername;

export default mongoose.model('User', Schema);
