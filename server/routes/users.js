const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/password
// @desc    Update user password
// @access  Private
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get current month's data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Get expenses for current month
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).populate('category', 'name icon color');
    
    // Get income for current month
    const incomes = await Income.find({
      user: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    // Calculate totals
    const totalExpenses = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    const totalIncome = incomes.reduce((acc, income) => acc + income.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    // Group expenses by category
    const expensesByCategory = {};
    expenses.forEach(expense => {
      const categoryId = expense.category._id.toString();
      if (!expensesByCategory[categoryId]) {
        expensesByCategory[categoryId] = {
          category: expense.category,
          total: 0,
          count: 0
        };
      }
      expensesByCategory[categoryId].total += expense.amount;
      expensesByCategory[categoryId].count += 1;
    });
    
    // Group income by category
    const incomeByCategory = {};
    incomes.forEach(income => {
      const category = income.category;
      if (!incomeByCategory[category]) {
        incomeByCategory[category] = {
          category,
          total: 0,
          count: 0
        };
      }
      incomeByCategory[category].total += income.amount;
      incomeByCategory[category].count += 1;
    });
    
    // Get recent transactions
    const recentExpenses = await Expense.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5)
      .populate('category', 'name icon color');
      
    const recentIncomes = await Income.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5);
    
    // Combine and sort by date
    const recentTransactions = [
      ...recentExpenses.map(e => ({ 
        ...e.toObject(), 
        transactionType: 'expense' 
      })),
      ...recentIncomes.map(i => ({ 
        ...i.toObject(), 
        transactionType: 'income' 
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    
    res.json({
      currentMonth: {
        month: currentMonth + 1,
        year: currentYear,
        totalExpenses,
        totalIncome,
        balance,
        expensesByCategory: Object.values(expensesByCategory),
        incomeByCategory: Object.values(incomeByCategory)
      },
      recentTransactions
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 