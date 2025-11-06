import express from 'express';
import Experience from '../models/Experience.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// Get all experiences (can filter by city)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { city } = req.query;
    const query = city ? { city: { $regex: new RegExp(city, 'i') }, status: 'active' } : { status: 'active' };
    const experiences = await Experience.find(query)
      .populate('hostId', 'name username')
      .sort({ createdAt: -1 });
    res.json({ experiences });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Create a new experience
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, city, description, price, currency, duration, category, imageUrl } = req.body;
    
    // Basic validation
    if (!title || !city || !description || price === undefined) {
      return res.status(400).json({ error: 'title, city, description, and price are required' });
    }

    const doc = await Experience.create({
      hostId: req.userId,
      title,
      city,
      description,
      price: Number(price),
      currency: currency || '$',
      duration: duration || '2 hours',
      category: category || 'Tour',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542314831-c6a4d14eea29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      status: 'active'
    });

    res.status(201).json({ experience: doc });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
