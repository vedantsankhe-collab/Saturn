const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const seedCategories = require('./utils/seedCategories');
const mockDb = require('./utils/mockDb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', process.env.PORT);

// Set up mock database to ensure app works even without MongoDB connection
global.useMockDb = process.env.USE_MOCK_DB === 'true' || false;
console.log('Using mock database:', global.useMockDb);

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const incomeRoutes = require('./routes/income');
const categoryRoutes = require('./routes/categories');
const notificationRoutes = require('./routes/notifications');
const investmentRoutes = require('./routes/investments');
const userRoutes = require('./routes/users');
const stockMarketRoutes = require('./routes/stockMarket');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    dbStatus: global.useMockDb ? 'mock' : 'connected',
    environment: process.env.NODE_ENV 
  });
});

// Debug endpoint for testing
app.post('/api/debug/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  console.log('Debug register endpoint called with:', { name, email, password: '***' });
  
  try {
    // Check if we can connect to the database
    if (!global.useMockDb) {
      const user = await mockDb.createUser({
        name,
        email,
        password: await bcrypt.hash(password, 10)
      });
      
      // Generate token
      const token = jwt.sign(
        { user: { id: user._id } },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('Debug user created and token generated');
      return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } else {
      return res.status(500).json({ msg: 'Database unavailable' });
    }
  } catch (error) {
    console.error('Debug register error:', error);
    return res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});

// Debug endpoint for testing login
app.post('/api/debug/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Debug login endpoint called with:', { email, password: '***' });
  
  try {
    // Always succeed for debugging
    const mockUser = {
      _id: '123456',
      name: 'Debug User',
      email: email
    };
    
    // Generate token
    const token = jwt.sign(
      { user: { id: mockUser._id } },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('Debug token generated');
    return res.json({ token, user: mockUser });
  } catch (error) {
    console.error('Debug login error:', error);
    return res.status(500).json({ msg: 'Server Error', error: error.message });
  }
});

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/indian-stocks', stockMarketRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    
    const mongoOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGO_URI, mongoOptions);
    
    console.log('MongoDB connected successfully');
    global.useMockDb = false;
    
    // Seed default categories
    await seedCategories();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    
    if (error.message.includes('ENOTFOUND') || 
        error.message.includes('ECONNREFUSED') || 
        error.message.includes('timed out') ||
        error.message.includes('whitelist')) {
      console.log('\nMongoDB Connection Error:');
      console.log('1. Check if your IP address is whitelisted in MongoDB Atlas');
      console.log('2. Verify your connection string is correct');
      console.log('3. Ensure your MongoDB Atlas cluster is running');
      console.log('4. Check your network connection');
      console.log('5. Make sure you have the correct username and password\n');
      
      console.log('Using mock database for development...');
      global.useMockDb = true;
      
      // Seed default categories in mock database
      await mockDb.seedDefaultCategories();
      
      console.log('Mock database initialized successfully');
    } else {
      console.error('Unexpected error:', error);
      
      // Fall back to mock database instead of exiting
      console.log('Falling back to mock database...');
      global.useMockDb = true;
      await mockDb.seedDefaultCategories();
    }
  }
};

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add error handlers for the server
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Please use a different port.`);
    process.exit(1);
  }
});

// Connect to database
connectDB().then(() => {
  console.log('Database connection setup completed');
}); 