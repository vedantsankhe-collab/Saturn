const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('../server/routes/auth');
const usersRoutes = require('../server/routes/users');
const expensesRoutes = require('../server/routes/expenses');
const incomeRoutes = require('../server/routes/income');
const categoriesRoutes = require('../server/routes/categories');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    console.log('Attempting to connect to MongoDB with URI:', mongoURI?.replace(/:[^:]*@/, ':****@'));
    
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
    // process.exit(1);
  }
};

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/categories', categoriesRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({ msg: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: 'Server error', error: err.message });
});

// Connect to MongoDB when the app initializes
connectDB();

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app; 