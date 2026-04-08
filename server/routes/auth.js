import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is not ready. Please check server logs.' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ email, password });

    if (user) {
      res.status(201).json({
        id: user._id,
        email: user.email,
        favoriteCities: user.favoriteCities,
        unitPreference: user.unitPreference,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if DB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database connection is not ready. Please check server logs.' });
    }

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user._id,
        email: user.email,
        favoriteCities: user.favoriteCities,
        unitPreference: user.unitPreference,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;

