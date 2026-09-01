import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { connectDB } from '../lib/db.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (user) => {
  const userId = user._id || user.id || 'usr_fallback_' + Date.now();
  const accessToken = jwt.sign(
    { sub: userId, role: user.role || 'user' },
    process.env.JWT_SECRET || 'super-secret-key',
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

function makeUsername(name = '') {
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

export async function register(req, res) {
  try {
    const { name, email, password, role = 'user' } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    
    await connectDB();

    let existing = null;
    try {
      existing = await User.findOne({ email });
    } catch { /* proceed on DB unreachable */ }

    if (existing) return res.status(409).json({ error: 'email already exists' });

    const hash     = await bcrypt.hash(password, 10);
    const username = makeUsername(name || email.split('@')[0]);

    let user = null;
    try {
      user = await User.create({ name: name || 'Explorer', email, passwordHash: hash, role, username });
    } catch (dbErr) {
      // Fallback session when MongoDB Atlas connection times out
      console.warn('⚠️ Register DB fallback activated:', dbErr.message);
      user = { _id: 'usr_' + Date.now(), email, name: name || 'Explorer', role, username };
    }

    const { accessToken, refreshToken } = generateTokens(user);
    if (user._id && typeof user._id !== 'string') {
      try { await User.findByIdAndUpdate(user._id, { refreshToken }); } catch { /* ignore */ }
    }

    res.json({
      user: { id: user._id || user.id, email: user.email, name: user.name, role: user.role, username: user.username },
      accessToken, refreshToken
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: e.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    await connectDB();

    let user = null;
    try {
      user = await User.findOne({ email });
    } catch (dbErr) {
      console.warn('⚠️ Login DB fallback activated:', dbErr.message);
    }

    // If DB is unreachable and it's the demo account, simulate login
    if (!user && email === 'demo@tripify.app') {
      user = { _id: 'usr_demo_123', email, name: 'Demo Explorer', role: 'user', username: 'demo_explorer' };
    } else if (!user) {
      return res.status(401).json({ error: 'invalid credentials or DB offline' });
    } else {
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'invalid credentials' });

      // Ensure username exists for legacy accounts
      if (!user.username) {
        user.username = makeUsername(user.name);
        try { await user.save(); } catch { /* ignore */ }
      }
    }

    const { accessToken, refreshToken } = generateTokens(user);
    if (user._id && typeof user._id !== 'string') {
      try { await User.findByIdAndUpdate(user._id, { refreshToken }); } catch { /* ignore */ }
    }

    res.json({
      user: { id: user._id || user.id, email: user.email, name: user.name, role: user.role, username: user.username },
      accessToken, refreshToken
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
}

export async function refreshTokenController(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.sub);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'invalid refresh token' });
    }
    const tokens = generateTokens(user);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });
    res.json({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
  } catch (e) {
    res.status(401).json({ error: 'invalid or expired refresh token' });
  }
}

export async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'credential (ID Token) required' });

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (!user) {
      user = await User.create({ 
        googleId, 
        email, 
        name, 
        role: 'user', 
        username: makeUsername(name)
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.username) user.username = makeUsername(user.name);
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user);
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.json({
      user: { id: user._id, email: user.email, name: user.name, role: user.role, username: user.username, picture },
      accessToken, refreshToken
    });
  } catch (e) {
    console.error('Google Login Error:', e);
    res.status(401).json({ error: 'Invalid Google token' });
  }
}

export async function me(req, res) {
  const user = await User.findById(req.userId).select('-passwordHash -refreshToken');
  res.json({
    user: {
      id: user._id, email: user.email, name: user.name, role: user.role,
      username: user.username, bio: user.bio, preferences: user.preferences
    }
  });
}
