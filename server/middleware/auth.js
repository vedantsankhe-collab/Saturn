const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockDb = require('../utils/mockDb');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    
    // Add user from payload
    let user;
    if (global.useMockDb) {
      user = await mockDb.findUserById(decoded.user.id);
    } else {
      user = await User.findById(decoded.user.id).select('-password');
    }
    
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ msg: 'User not found' });
    }
    
    req.user = user;
    console.log('User authenticated:', user.email);
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid', error: err.message });
  }
}; 