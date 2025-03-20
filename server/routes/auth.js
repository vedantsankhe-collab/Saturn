const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const mockDb = require('../utils/mockDb');

// Helper function to get user by email (from MongoDB or mock DB)
const getUserByEmail = async (email) => {
  if (global.useMockDb) {
    return await mockDb.findUserByEmail(email);
  } else {
    return await User.findOne({ email });
  }
};

// Helper function to get user by ID (from MongoDB or mock DB)
const getUserById = async (id) => {
  if (global.useMockDb) {
    return await mockDb.findUserById(id);
  } else {
    return await User.findById(id).select('-password');
  }
};

// Helper function to create a new user (in MongoDB or mock DB)
const createUser = async (userData) => {
  if (global.useMockDb) {
    // For mock DB, we need to hash the password manually
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
    return await mockDb.createUser(userData);
  } else {
    const user = new User(userData);
    return await user.save();
  }
};

// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Please enter a name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    console.log('Registration attempt for:', email);

    try {
      // Check if user exists
      let user = await getUserByEmail(email);

      if (user) {
        console.log('Registration failed: User already exists');
        return res.status(400).json({ msg: 'User already exists' });
      }

      // Create new user
      user = await createUser({
        name,
        email,
        password
      });
      
      console.log('User registered successfully:', email);

      // Create JWT payload
      const payload = {
        user: {
          id: user._id
        }
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) {
            console.error('JWT Sign Error:', err);
            return res.status(500).json({ msg: 'Error generating token', error: err.message });
          }
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Registration Error:', err.message);
      res.status(500).json({ msg: 'Server Error', error: err.message });
    }
  }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    try {
      // Check if user exists
      let user = await getUserByEmail(email);

      if (!user) {
        console.log('Login failed: User not found');
        return res.status(400).json({ msg: 'Invalid Credentials - User not found' });
      }

      // Check password
      let isMatch;
      if (global.useMockDb) {
        // For mock DB, we need to compare the password manually
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = await user.comparePassword(password);
      }

      if (!isMatch) {
        console.log('Login failed: Invalid password');
        return res.status(400).json({ msg: 'Invalid Credentials - Password incorrect' });
      }

      console.log('User logged in successfully:', email);

      // Create JWT payload
      const payload = {
        user: {
          id: user._id
        }
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
          if (err) {
            console.error('JWT Sign Error:', err);
            return res.status(500).json({ msg: 'Error generating token', error: err.message });
          }
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('Login Error:', err.message);
      res.status(500).json({ msg: 'Server Error', error: err.message });
    }
  }
);

// @route   PUT api/auth/theme
// @desc    Update user theme
// @access  Private
router.put('/theme', auth, async (req, res) => {
  const { theme } = req.body;

  try {
    const user = await getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (global.useMockDb) {
      // For mock DB, update the user directly
      user.theme = theme;
    } else {
      // For MongoDB, use the save method
      user.theme = theme;
      await user.save();
    }

    res.json(user);
  } catch (err) {
    console.error('Update theme error:', err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

module.exports = router; 