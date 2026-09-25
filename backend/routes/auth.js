import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbService from '../services/dbService.js';
import { authenticateToken, JWT_SECRET } from '../middleware/auth.js';

const router = express.Router();

// Helper to sanitize user object
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  const { passwordHash: _passwordHash, ...rest } = userObj;
  return rest;
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'passenger', phone, passportNumber, nationality } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await dbService.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role === 'admin' ? 'admin' : 'passenger',
      phone: phone || '',
      passportNumber: passportNumber || '',
      nationality: nationality || 'International',
      createdAt: new Date().toISOString()
    };

    const savedUser = await dbService.createUser(newUser);

    const token = jwt.sign(
      { id: savedUser.id, email: savedUser.email, role: savedUser.role, name: savedUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: sanitizeUser(savedUser)
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Internal server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await dbService.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // bcrypt password comparison
    let isMatch = false;
    if (user.passwordHash) {
      try {
        isMatch = await bcrypt.compare(password, user.passwordHash);
      } catch (_err) {
        isMatch = false;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login' });
  }
});

// Demo Login Shortcut
router.post('/demo-login', async (req, res) => {
  try {
    const { role = 'passenger' } = req.body;
    const users = await dbService.getAllUsers();
    
    let target = users.find(u => u.role === role);
    if (!target) {
      target = users[0];
    }

    const token = jwt.sign(
      { id: target.id, email: target.email, role: target.role, name: target.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: `Logged in as demo ${role}`,
      token,
      user: sanitizeUser(target)
    });
  } catch (error) {
    console.error('Demo login error:', error);
    res.status(500).json({ message: 'Demo login failed' });
  }
});

// Current User Profile
router.get('/me', authenticateToken, async (req, res) => {
  const user = await dbService.findUserByIdOrEmail(req.user.id, req.user.email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ user: sanitizeUser(user) });
});


// Loyalty Club Membership & Miles Profile
router.get('/loyalty', (req, res) => {
  // Try to find user from token or return default elite guest profile
  const token = req.headers.authorization?.split(' ')[1];
  let userName = 'SkyWings Traveler';
  let userEmail = 'guest@skywings.com';

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      userName = decoded.name || userName;
      userEmail = decoded.email || userEmail;
    } catch (_e) {
      // fallback
    }
  }


  const loyaltyProfile = {
    membershipNumber: 'SKW-884920',
    memberSince: '2024',
    memberName: userName,
    email: userEmail,
    tier: 'Gold Elite',
    tierLevel: 3,
    milesBalance: 28450,
    tierMiles: 21500,
    milesToNextTier: 8500,
    nextTier: 'Diamond Premier',
    expiryDate: 'Dec 31, 2027',
    tierProgressPercentage: 72,
    benefits: [
      { title: 'Global VIP Lounge Access', description: 'Complimentary access for you + 1 guest worldwide', icon: 'coffee' },
      { title: 'Priority Check-In & Boarding', description: 'Fast-track through security and SkyPriority lines', icon: 'zap' },
      { title: 'Complimentary Extra Luggage', description: '+1 additional 23kg checked bag free of charge', icon: 'luggage' },
      { title: '50% Bonus Miles Accrual', description: 'Earn 1.5x SkyMiles on every qualifying flight', icon: 'sparkles' },
      { title: 'Dedicated 24/7 Elite Concierge', description: 'Direct phone line to private flight managers', icon: 'phone' }
    ],
    recentTransactions: [
      { id: 'TX-101', date: '2026-09-12', description: 'Flight JFK ➔ DXB (First Suite)', miles: '+4,850', type: 'earn' },
      { id: 'TX-102', date: '2026-08-20', description: 'Flight LHR ➔ SIN (Business)', miles: '+2,400', type: 'earn' },
      { id: 'TX-103', date: '2026-08-01', description: 'Gold Tier Renewal Bonus', miles: '+5,000', type: 'earn' },
      { id: 'TX-104', date: '2026-07-15', description: 'Redeemed: Airport Lounge Pass', miles: '-2,000', type: 'redeem' }
    ],
    rewardsCatalog: [
      { id: 'REW-1', title: '$50 Off Flight Fare Voucher', milesCost: 5000, value: '$50 USD' },
      { id: 'REW-2', title: 'First Class VIP Lounge Day Pass', milesCost: 3500, value: '$85 USD' },
      { id: 'REW-3', title: 'Extra Checked Luggage (23kg)', milesCost: 4000, value: '$65 USD' },
      { id: 'REW-4', title: 'In-Flight Ultra Wi-Fi Unlimited Pass', milesCost: 1500, value: '$25 USD' },
      { id: 'REW-5', title: 'Premium Cabin Upgrade Certificate', milesCost: 12000, value: '$250 USD' }
    ]
  };

  res.json({ loyalty: loyaltyProfile });
});

export default router;
