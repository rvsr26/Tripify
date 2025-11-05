import Review from '../models/Review.js';
import axios from 'axios';

export const addReview = async (req, res) => {
  try {
    const { placeId, rating, review } = req.body;
    const userId = req.userId; // authMiddleware sets req.userId

    if (!placeId || !rating || !review) {
      return res.status(400).json({ error: 'placeId, rating, and review are required' });
    }

    const newReview = new Review({
      userId,
      placeId,
      rating,
      review
    });

    await newReview.save();
    res.status(201).json({ message: 'Review added successfully', review: newReview });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { placeId } = req.params;
    const { dataId } = req.query;
    const mongoReviews = await Review.find({ placeId }).populate('userId', 'name').sort({ createdAt: -1 });
    
    // Map internal reviews into a standard schema
    const results = mongoReviews.map(r => ({
      userId: { name: r.userId?.name || 'Unknown' },
      rating: r.rating,
      review: r.review,
      createdAt: r.createdAt
    }));

    // Merge actual real-world Google Reviews using SerpAPI
    if (dataId && process.env.SERPAPI_KEY) {
      try {
        const url = `https://serpapi.com/search.json?engine=google_maps_reviews&data_id=${encodeURIComponent(dataId)}&api_key=${process.env.SERPAPI_KEY}`;
        const response = await axios.get(url);
        const externalReviews = response.data.reviews || [];
        
        const formattedExternal = externalReviews.slice(0, 10).map(g => ({
          userId: { name: `${g.user?.name || 'Google User'} (Google)` },
          rating: g.rating || 5,
          review: g.snippet || g.summary || 'Google Review',
          createdAt: g.date || new Date().toISOString(),
          isExternal: true,
          link: g.link || g.share_link || null,
          // Extract the best quality image URLs
          images: (g.images || []).map(img => img.original || img.thumbnail).filter(Boolean),
        })).filter(r => r.review && r.review !== 'Google Review');

        return res.json([...results, ...formattedExternal]);
      } catch (err) {
        console.error('Failed to fetch SerpAPI reviews:', err.message);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
