const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mockDb = require('../utils/mockDb');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    if (global.useMockDb) {
      req.user = await mockDb.findUserById(decoded.user.id);
    } else {
      req.user = await User.findById(decoded.user.id).select('-password');
    }
    
    if (!req.user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ msg: 'Token is not valid', error: err.message });
  }
}; 