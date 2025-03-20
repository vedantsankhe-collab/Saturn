const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Category = require('../models/Category');

// @route   GET api/expenses
// @desc    Get all user expenses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id })
      .sort({ date: -1 })
      .populate('category', 'name icon color');
    res.json(expenses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/expenses
// @desc    Add new expense
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('amount', 'Amount is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('category', 'Category is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      amount,
      description,
      category,
      date,
      paymentMethod,
      location,
      receipt,
      isRecurring,
      recurringFrequency,
      tags,
      notes
    } = req.body;

    try {
      // Verify category exists
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(404).json({ msg: 'Category not found' });
      }

      // Create new expense
      const newExpense = new Expense({
        user: req.user.id,
        amount,
        description,
        category,
        date: date || Date.now(),
        paymentMethod,
        location,
        receipt,
        isRecurring,
        recurringFrequency,
        tags,
        notes
      });

      const expense = await newExpense.save();
      
      // Populate category details
      await expense.populate('category', 'name icon color');
      
      res.json(expense);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/expenses/:id
// @desc    Get expense by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('category', 'name icon color');

    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const {
    amount,
    description,
    category,
    date,
    paymentMethod,
    location,
    receipt,
    isRecurring,
    recurringFrequency,
    tags,
    notes
  } = req.body;

  // Build expense object
  const expenseFields = {};
  if (amount !== undefined) expenseFields.amount = amount;
  if (description) expenseFields.description = description;
  if (category) expenseFields.category = category;
  if (date) expenseFields.date = date;
  if (paymentMethod) expenseFields.paymentMethod = paymentMethod;
  if (location) expenseFields.location = location;
  if (receipt) expenseFields.receipt = receipt;
  if (isRecurring !== undefined) expenseFields.isRecurring = isRecurring;
  if (recurringFrequency) expenseFields.recurringFrequency = recurringFrequency;
  if (tags) expenseFields.tags = tags;
  if (notes) expenseFields.notes = notes;

  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update
    expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { $set: expenseFields },
      { new: true }
    ).populate('category', 'name icon color');

    res.json(expense);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ msg: 'Expense not found' });
    }

    // Make sure user owns expense
    if (expense.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await expense.deleteOne();

    res.json({ msg: 'Expense removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Expense not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/expenses/summary/monthly
// @desc    Get monthly expense summary
// @access  Private
router.get('/summary/monthly', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Default to current year and month if not provided
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0);
    
    const expenses = await Expense.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }).populate('category', 'name icon color');
    
    // Calculate total
    const total = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    
    // Group by category
    const byCategory = {};
    expenses.forEach(expense => {
      const categoryId = expense.category._id.toString();
      if (!byCategory[categoryId]) {
        byCategory[categoryId] = {
          category: expense.category,
          total: 0,
          count: 0
        };
      }
      byCategory[categoryId].total += expense.amount;
      byCategory[categoryId].count += 1;
    });
    
    res.json({
      total,
      byCategory: Object.values(byCategory),
      expenses
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 