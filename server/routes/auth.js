const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const auth = require('../middleware/auth');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeyforbidashboard';

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const isDemo = db.isDemoMode();
    let existingUser = null;

    if (!isDemo) {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (result.rows.length > 0) existingUser = result.rows[0];
    } else {
      existingUser = db.getStore().users.find(u => u.email === email.toLowerCase());
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Encrypt password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUser = null;

    if (!isDemo) {
      const result = await db.query(
        'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, created_at',
        [email.toLowerCase(), passwordHash, fullName, 'user']
      );
      newUser = result.rows[0];
    } else {
      const store = db.getStore();
      const newId = store.users.length + 1;
      newUser = {
        id: newId,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        role: 'user',
        created_at: new Date()
      };
      store.users.push(newUser);
    }

    // Generate JWT Token
    const payload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: newUser.id,
          fullName: newUser.full_name,
          email: newUser.email,
          role: newUser.role
        }
      });
    });

  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const isDemo = db.isDemoMode();
    let user = null;

    if (!isDemo) {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      if (result.rows.length > 0) user = result.rows[0];
    } else {
      user = db.getStore().users.find(u => u.email === email.toLowerCase());
    }

    // Since it's demo mode, we let ANY password work for demo account if it has min length 6, OR verify it correctly.
    // Let's implement full security: if user exists, we compare bcrypt hashes! If not in DB, and email is valid, we can auto-register in demo mode or standard authentication.
    // Let's standardly check if user exists. If not, and it's demo mode, we can auto-register a user to make the demo extremely friendly as requested!
    // "Demo Credentials: Email: Any valid email, Password: Any password (min 6 characters) - Works with sample data when database isn't connected"
    if (!user) {
      if (isDemo && email.includes('@') && password.length >= 6) {
        // Auto register in demo mode
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const store = db.getStore();
        const newId = store.users.length + 1;
        user = {
          id: newId,
          email: email.toLowerCase(),
          password_hash: passwordHash,
          full_name: email.split('@')[0].toUpperCase(),
          role: 'admin',
          created_at: new Date()
        };
        store.users.push(user);
      } else {
        return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
      }
    } else {
      // Validate password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        // If password is not matched, let's verify if the user specified any password can work for demo credentials:
        // "Demo Credentials: Email: Any valid email, Password: Any password (min 6 characters)"
        // If it's the demo account and in demo mode, let's allow it!
        if (isDemo && user.email === 'demo@bidashboard.com' && password.length >= 6) {
          // Allow it!
        } else {
          return res.status(400).json({ message: 'Invalid password. Try again.' });
        }
      }
    }

    // Generate JWT Token
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          fullName: user.full_name || user.full_name_demo || 'Demo User',
          email: user.email,
          role: user.role
        }
      });
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET api/auth/me
// @desc    Get currently logged in user details
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const isDemo = db.isDemoMode();
    let user = null;

    if (!isDemo) {
      const result = await db.query('SELECT id, email, full_name, role, created_at FROM users WHERE id = $1', [req.user.id]);
      if (result.rows.length > 0) user = result.rows[0];
    } else {
      const u = db.getStore().users.find(u => u.id === req.user.id);
      if (u) {
        user = {
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          role: u.role,
          created_at: u.created_at
        };
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Fetch user error:', err.message);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
});

module.exports = router;
