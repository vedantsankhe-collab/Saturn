const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcrypt');

// Load environment variables
dotenv.config();

console.log('API Server starting in environment:', process.env.NODE_ENV);
console.log('MongoDB URI available:', !!process.env.MONGO_URI);

// Import routes
const authRoutes = require('../server/routes/auth');
const usersRoutes = require('../server/routes/users');
const expensesRoutes = require('../server/routes/expenses');
const incomeRoutes = require('../server/routes/income');
const categoriesRoutes = require('../server/routes/categories');
const notificationRoutes = require('../server/routes/notifications');
const investmentRoutes = require('../server/routes/investments');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    env: process.env.NODE_ENV
  });
});

// Debug endpoint for testing authentication
app.post('/api/debug/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Debug login endpoint called');
  
  try {
    // Create mock user for testing
    const mockUser = {
      _id: '123456789',
      name: 'Test User',
      email: email || 'test@example.com'
    };
    
    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { user: { id: mockUser._id } },
      process.env.JWT_SECRET || 'debug_secret_key',
      { expiresIn: '7d' }
    );
    
    return res.json({ token, user: mockUser });
  } catch (error) {
    console.error('Debug login error:', error);
    return res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});

// Debug endpoint for testing MongoDB connection
app.get('/api/debug/db', async (req, res) => {
  console.log('Debug DB endpoint called');
  
  try {
    // Check MongoDB connection
    const status = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (status === 1) {
      // Try to run a test query
      const testResult = await mongoose.connection.db.admin().ping();
      
      return res.json({
        status: 'ok',
        connection: dbStatus[status],
        ping: testResult,
        mongoUri: process.env.MONGO_URI ? 'Set (hidden)' : 'Not set',
        useMockDb: global.useMockDb
      });
    } else {
      return res.json({
        status: 'error',
        connection: dbStatus[status],
        message: 'MongoDB not connected',
        mongoUri: process.env.MONGO_URI ? 'Set (hidden)' : 'Not set',
        useMockDb: global.useMockDb
      });
    }
  } catch (error) {
    console.error('Debug DB error:', error);
    return res.status(500).json({ 
      msg: 'MongoDB Error', 
      error: error.message,
      mongoUri: process.env.MONGO_URI ? 'Set (hidden)' : 'Not set',
      useMockDb: global.useMockDb
    });
  }
});

// Test endpoint for direct user creation
app.post('/api/debug/create-user', async (req, res) => {
  console.log('Debug create user endpoint called');
  const { name, email, password } = req.body;
  
  try {
    // Connect to MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    if (global.useMockDb) {
      const mockUser = {
        _id: Date.now().toString(),
        name: name || 'Test User',
        email: email || 'test@example.com'
      };
      
      return res.json({ 
        status: 'success', 
        mode: 'mock', 
        user: mockUser 
      });
    }
    
    // Create user directly using Mongoose
    const User = require('../server/models/User');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password123', salt);
    
    // Create user document
    const user = new User({
      name: name || 'Test User',
      email: email || 'test@example.com',
      password: hashedPassword
    });
    
    // Save to database
    const savedUser = await user.save();
    
    return res.json({ 
      status: 'success', 
      mode: 'mongodb', 
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email
      }
    });
  } catch (error) {
    console.error('Debug create user error:', error);
    return res.status(500).json({ 
      status: 'error',
      msg: 'User creation error', 
      error: error.message,
      code: error.code,
      mongoState: mongoose.connection.readyState
    });
  }
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }
    
    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    
    // Initialize default categories if they don't exist
    const Category = require('../server/models/Category');
    const defaultCategories = [
      { name: 'Food', type: 'expense', icon: 'restaurant' },
      { name: 'Transportation', type: 'expense', icon: 'directions_car' },
      { name: 'Housing', type: 'expense', icon: 'home' },
      { name: 'Entertainment', type: 'expense', icon: 'movie' },
      { name: 'Shopping', type: 'expense', icon: 'shopping_cart' },
      { name: 'Utilities', type: 'expense', icon: 'power' },
      { name: 'Healthcare', type: 'expense', icon: 'local_hospital' },
      { name: 'Personal', type: 'expense', icon: 'person' },
      { name: 'Education', type: 'expense', icon: 'school' },
      { name: 'Salary', type: 'income', icon: 'work' },
      { name: 'Freelance', type: 'income', icon: 'laptop' },
      { name: 'Investments', type: 'income', icon: 'trending_up' },
      { name: 'Gifts', type: 'income', icon: 'card_giftcard' },
      { name: 'Other', type: 'income', icon: 'more_horiz' }
    ];
    
    const existingCategories = await Category.find({});
    if (existingCategories.length === 0) {
      await Category.insertMany(defaultCategories);
      console.log('Default categories created');
    } else {
      console.log('Default categories already exist');
    }
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Don't exit process on error in serverless environment
  }
};

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/investments', investmentRoutes);

// Not found handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ msg: 'API route not found', path: req.originalUrl });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({ msg: 'Server error', error: err.message });
});

// Connect to MongoDB when the app initializes
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err.message);
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app; 