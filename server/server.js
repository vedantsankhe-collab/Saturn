const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const seedCategories = require('./utils/seedCategories');
const mockDb = require('./utils/mockDb');

// Load environment variables
dotenv.config();

// Global flag to indicate if we're using mock database
global.useMockDb = false;

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
  allowedHeaders: ['Content-Type', 'x-auth-token']
}));
app.use(express.json());

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
      process.exit(1);
    }
  }
};

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to database
connectDB(); 