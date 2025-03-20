const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['expense', 'income', 'investment', 'other'],
    default: 'other'
  },
  detectedAmount: {
    type: Number
  },
  detectedCategory: {
    type: String
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  isAddedToFinance: {
    type: Boolean,
    default: false
  },
  relatedTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'category'
  }
});

// Index for faster queries
NotificationSchema.index({ user: 1, timestamp: -1 });
NotificationSchema.index({ isProcessed: 1 });

module.exports = mongoose.model('Notification', NotificationSchema); 