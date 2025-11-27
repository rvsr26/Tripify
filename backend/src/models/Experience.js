import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  hostId:      { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true },
  city:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  currency:    { type: String, default: '$' },
  duration:    { type: String, default: '2 hours' }, // e.g., '2 hours', 'Half day'
  category:    { type: String, default: 'Tour' }, // e.g., Tour, Food, Class
  imageUrl:    { type: String, default: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  status:      { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt:   { type: Date, default: Date.now }
});

export default mongoose.model('Experience', ExperienceSchema);

// Build verification patch on 11/27/2025, 12:27:00 PM
