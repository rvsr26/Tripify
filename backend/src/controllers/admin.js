import User from '../models/User.js';
import TripPlan from '../models/TripPlan.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrips = await TripPlan.countDocuments();
    
    // Most popular destinations
    const popularDestinations = await TripPlan.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Revenue tracking placeholder (can be tied to Stripe webhooks or Bookings in future)
    const revenue = 12500; 

    res.json({
      totalUsers,
      totalTrips,
      popularDestinations,
      revenue
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
