const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Category = require('../models/Category');

// @route   GET api/notifications
// @desc    Get all user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/notifications
// @desc    Add new notification
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty(),
      check('source', 'Source is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      source,
      timestamp,
      category,
      detectedAmount,
      detectedCategory
    } = req.body;

    try {
      // Create new notification
      const newNotification = new Notification({
        user: req.user.id,
        title,
        content,
        source,
        timestamp: timestamp || Date.now(),
        category: category || 'other',
        detectedAmount,
        detectedCategory,
        confidence: detectedAmount && detectedCategory ? 0.8 : 0
      });

      const notification = await newNotification.save();
      res.json(notification);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   PUT api/notifications/:id/process
// @desc    Process a notification and convert to transaction
// @access  Private
router.put('/:id/process', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Make sure user owns notification
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Check if already processed
    if (notification.isProcessed) {
      return res.status(400).json({ msg: 'Notification already processed' });
    }

    const { 
      amount, 
      description, 
      category: categoryId, 
      transactionType,
      source
    } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ msg: 'Category not found' });
    }

    let transaction;
    
    // Create transaction based on type
    if (transactionType === 'expense') {
      const newExpense = new Expense({
        user: req.user.id,
        amount,
        description: description || notification.title,
        category: categoryId,
        date: notification.timestamp,
        notes: `Created from notification: ${notification.content}`
      });
      
      transaction = await newExpense.save();
      await transaction.populate('category', 'name icon color');
    } else if (transactionType === 'income') {
      const newIncome = new Income({
        user: req.user.id,
        amount,
        description: description || notification.title,
        source: source || 'notification',
        date: notification.timestamp,
        category: categoryExists.name,
        notes: `Created from notification: ${notification.content}`
      });
      
      transaction = await newIncome.save();
    } else {
      return res.status(400).json({ msg: 'Invalid transaction type' });
    }

    // Update notification
    notification.isProcessed = true;
    notification.isAddedToFinance = true;
    notification.relatedTransactionId = transaction._id;
    notification.category = transactionType;
    
    await notification.save();

    res.json({
      notification,
      transaction
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/:id/ignore
// @desc    Mark notification as processed without creating transaction
// @access  Private
router.put('/:id/ignore', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Make sure user owns notification
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update notification
    notification.isProcessed = true;
    notification.isAddedToFinance = false;
    
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/notifications/unprocessed
// @desc    Get all unprocessed notifications
// @access  Private
router.get('/unprocessed', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      user: req.user.id,
      isProcessed: false
    }).sort({ timestamp: -1 });
    
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Make sure user owns notification
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await notification.deleteOne();

    res.json({ msg: 'Notification removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router; 