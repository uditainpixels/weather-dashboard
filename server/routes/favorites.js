import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/', protect, (req, res) => {
  res.status(200).json({
    favoriteCities: req.user.favoriteCities,
  });
});

router.post('/', protect, async (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ message: 'City name is required' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favoriteCities: city } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: `'${city}' added to favorites successfully.`,
      favoriteCities: updatedUser.favoriteCities,
    });
  } catch (error) {
    console.error('Error adding favorite city:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/', protect, async (req, res) => {
  const { city } = req.body;

  if (!city) {
    return res.status(400).json({ message: 'City name is required' });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        $pull: { favoriteCities: city }
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: `'${city}' removed from favorites successfully.`,
      favoriteCities: updatedUser.favoriteCities,
    });
  } catch (error) {
    console.error('Error removing favorite city:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

