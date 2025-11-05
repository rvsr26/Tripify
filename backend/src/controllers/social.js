import TripPlan from '../models/TripPlan.js';

export const getFeed = async (req, res) => {
  try {
    const { search = '', city = '' } = req.query;
    const query = { isPublic: true };

    if (city) query.city = { $regex: city, $options: 'i' };
    if (search) {
      query.$or = [
        { city:  { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { interests: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const publicTrips = await TripPlan.find(query)
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(publicTrips);
  } catch (error) {
    console.error('Get social feed error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const likeTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const trip = await TripPlan.findOne({ _id: id, isPublic: true });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const alreadyLiked = trip.likes.some(l => l.toString() === userId);
    if (alreadyLiked) {
      trip.likes = trip.likes.filter(l => l.toString() !== userId);
    } else {
      trip.likes.push(userId);
    }
    await trip.save();

    res.json({ likes: trip.likes.length, liked: !alreadyLiked });
  } catch (error) {
    console.error('Like trip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
