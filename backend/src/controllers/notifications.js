import User from '../models/User.js';

export const registerToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.userId;

    if (!token) {
      return res.status(400).json({ error: 'FCM token is required' });
    }

    await User.findByIdAndUpdate(userId, { fcmToken: token });
    res.json({ message: 'Push token registered successfully' });
  } catch (error) {
    console.error('Register token error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
