const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Income = require('../models/Income');

// @route   GET api/income
// @desc    Get all user income
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const income = await Income.find({ user: req.user.id })
      .populate('category', 'name icon color')
      .sort({ date: -1 });
    res.json(income);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/income
// @desc    Add new income
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('amount', 'Amount is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('source', 'Source is required').not().isEmpty(),
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
      source,
      date,
      isRecurring,
      recurringFrequency,
      category,
      notes,
      attachments
    } = req.body;

    try {
      // Create new income
      const newIncome = new Income({
        user: req.user.id,
        amount,
        description,
        source,
        date: date || Date.now(),
        isRecurring,
        recurringFrequency,
        category,
        notes,
        attachments
      });

      const income = await newIncome.save();
      await income.populate('category', 'name icon color');
      res.json(income);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/income/:id
// @desc    Get income by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findById(req.params.id).populate('category', 'name icon color');

    if (!income) {
      return res.status(404).json({ msg: 'Income not found' });
    }

    // Make sure user owns income
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(income);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Income not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/income/:id
// @desc    Update income
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const {
    amount,
    description,
    source,
    date,
    isRecurring,
    recurringFrequency,
    category,
    notes,
    attachments
  } = req.body;

  // Build income object
  const incomeFields = {};
  if (amount !== undefined) incomeFields.amount = amount;
  if (description) incomeFields.description = description;
  if (source) incomeFields.source = source;
  if (date) incomeFields.date = date;
  if (isRecurring !== undefined) incomeFields.isRecurring = isRecurring;
  if (recurringFrequency) incomeFields.recurringFrequency = recurringFrequency;
  if (category) incomeFields.category = category;
  if (notes) incomeFields.notes = notes;
  if (attachments) incomeFields.attachments = attachments;

  try {
    let income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ msg: 'Income not found' });
    }

    // Make sure user owns income
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update
    income = await Income.findByIdAndUpdate(
      req.params.id,
      { $set: incomeFields },
      { new: true }
    ).populate('category', 'name icon color');

    res.json(income);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/income/:id
// @desc    Delete income
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ msg: 'Income not found' });
    }

    // Make sure user owns income
    if (income.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await income.deleteOne();

    res.json({ msg: 'Income removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Income not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/income/summary/monthly
// @desc    Get monthly income summary
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
    
    const incomes = await Income.find({
      user: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Calculate total
    const total = incomes.reduce((acc, income) => acc + income.amount, 0);
    
    // Group by category
    const byCategory = {};
    incomes.forEach(income => {
      const category = income.category;
      if (!byCategory[category]) {
        byCategory[category] = {
          category,
          total: 0,
          count: 0
        };
      }
      byCategory[category].total += income.amount;
      byCategory[category].count += 1;
    });
    
    res.json({
      total,
      byCategory: Object.values(byCategory),
      incomes
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 