const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Investment = require('../models/Investment');
const axios = require('axios');
// Commenting out OpenAI for now as it's causing issues
// const { Configuration, OpenAIApi } = require('openai');

// Configure OpenAI
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

// @route   GET api/investments
// @desc    Get all user investments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id })
      .sort({ purchaseDate: -1 });
    res.json(investments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/investments
// @desc    Add new investment
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('symbol', 'Symbol is required').not().isEmpty(),
      check('companyName', 'Company name is required').not().isEmpty(),
      check('quantity', 'Quantity is required').isNumeric(),
      check('purchasePrice', 'Purchase price is required').isNumeric(),
      check('currentPrice', 'Current price is required').isNumeric(),
      check('purchaseDate', 'Purchase date is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      symbol,
      companyName,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate,
      notes
    } = req.body;

    try {
      console.log('Creating investment with data:', req.body);
      
      // Create new investment
      const newInvestment = new Investment({
        user: req.user.id,
        symbol,
        companyName,
        quantity,
        purchasePrice,
        currentPrice,
        purchaseDate,
        notes
      });

      const investment = await newInvestment.save();
      console.log('Investment saved successfully:', investment);
      res.json(investment);
    } catch (err) {
      console.error('Error saving investment:', err.message);
      if (err.name === 'ValidationError') {
        return res.status(400).json({ 
          msg: 'Validation Error', 
          details: err.message 
        });
      }
      res.status(500).json({ msg: 'Server Error', details: err.message });
    }
  }
);

// @route   GET api/investments/:id
// @desc    Get investment by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }

    // Make sure user owns investment
    if (investment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(investment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/investments/:id
// @desc    Update investment
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const {
    symbol,
    companyName,
    quantity,
    purchasePrice,
    currentPrice,
    purchaseDate,
    notes
  } = req.body;

  // Build investment object
  const investmentFields = {};
  if (symbol) investmentFields.symbol = symbol;
  if (companyName) investmentFields.companyName = companyName;
  if (quantity !== undefined) investmentFields.quantity = quantity;
  if (purchasePrice !== undefined) investmentFields.purchasePrice = purchasePrice;
  if (currentPrice !== undefined) investmentFields.currentPrice = currentPrice;
  if (purchaseDate) investmentFields.purchaseDate = purchaseDate;
  if (notes) investmentFields.notes = notes;

  try {
    console.log('Updating investment with data:', req.body);
    let investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }

    // Make sure user owns investment
    if (investment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update
    investment = await Investment.findByIdAndUpdate(
      req.params.id,
      { $set: investmentFields },
      { new: true }
    );

    console.log('Investment updated successfully:', investment);
    res.json(investment);
  } catch (err) {
    console.error('Error updating investment:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: 'Validation Error', 
        details: err.message 
      });
    }
    res.status(500).json({ msg: 'Server Error', details: err.message });
  }
});

// @route   DELETE api/investments/:id
// @desc    Delete investment
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }

    // Make sure user owns investment
    if (investment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await investment.deleteOne();

    res.json({ msg: 'Investment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Investment not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   POST api/investments/:id/transactions
// @desc    Add transaction to investment
// @access  Private
router.post(
  '/:id/transactions',
  [
    auth,
    [
      check('type', 'Type is required').isIn(['buy', 'sell', 'dividend']),
      check('amount', 'Amount is required').isNumeric(),
      check('price', 'Price is required').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount, price, date, notes } = req.body;

    try {
      const investment = await Investment.findById(req.params.id);

      if (!investment) {
        return res.status(404).json({ msg: 'Investment not found' });
      }

      // Make sure user owns investment
      if (investment.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      // Create new transaction
      const newTransaction = {
        type,
        amount,
        price,
        date: date || Date.now(),
        notes
      };

      // Add to transactions array
      investment.transactions.unshift(newTransaction);

      // Update current value based on transaction
      if (type === 'buy') {
        investment.currentValue += amount * price;
      } else if (type === 'sell') {
        investment.currentValue -= amount * price;
      }

      await investment.save();
      res.json(investment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   POST api/investments/:id/ai-recommendation
// @desc    Get AI recommendation for investment
// @access  Private
router.post('/:id/ai-recommendation', auth, async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ msg: 'Investment not found' });
    }

    // Make sure user owns investment
    if (investment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ msg: 'AI service not configured' });
    }

    // Calculate performance metrics
    const initialInvestment = investment.amount;
    const currentValue = investment.currentValue;
    const returnRate = ((currentValue - initialInvestment) / initialInvestment) * 100;
    const holdingPeriod = Math.floor((new Date() - new Date(investment.purchaseDate)) / (1000 * 60 * 60 * 24 * 365)); // in years

    // Create prompt for OpenAI
    const prompt = `
      I have an investment with the following details:
      - Type: ${investment.type}
      - Initial investment: $${initialInvestment}
      - Current value: $${currentValue}
      - Return rate: ${returnRate.toFixed(2)}%
      - Holding period: ${holdingPeriod} years
      - Risk tolerance: ${investment.riskLevel}

      Based on this information, provide a brief investment recommendation. Should I hold, sell, or invest more? Why?
      Provide your recommendation in a concise paragraph.
    `;

    // Call OpenAI API
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 200,
      temperature: 0.7,
    });

    const recommendation = response.data.choices[0].text.trim();

    // Save recommendation to investment
    const newRecommendation = {
      recommendation,
      date: Date.now(),
      reasoning: `Based on ${returnRate.toFixed(2)}% return over ${holdingPeriod} years with ${investment.riskLevel} risk tolerance.`,
      isApplied: false
    };

    investment.aiRecommendations.unshift(newRecommendation);
    await investment.save();

    res.json({
      investment,
      recommendation: newRecommendation
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/investments/summary/portfolio
// @desc    Get portfolio summary
// @access  Private
router.get('/summary/portfolio', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ 
      user: req.user.id,
      isActive: true
    });
    
    // Calculate total portfolio value
    const totalValue = investments.reduce((acc, inv) => acc + inv.currentValue, 0);
    const totalInvested = investments.reduce((acc, inv) => acc + inv.amount, 0);
    const totalReturn = totalValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    
    // Group by type
    const byType = {};
    investments.forEach(inv => {
      if (!byType[inv.type]) {
        byType[inv.type] = {
          type: inv.type,
          totalValue: 0,
          totalInvested: 0,
          count: 0
        };
      }
      byType[inv.type].totalValue += inv.currentValue;
      byType[inv.type].totalInvested += inv.amount;
      byType[inv.type].count += 1;
    });
    
    // Calculate percentages for each type
    Object.values(byType).forEach(type => {
      type.percentage = totalValue > 0 ? (type.totalValue / totalValue) * 100 : 0;
      type.returnPercentage = type.totalInvested > 0 ? 
        ((type.totalValue - type.totalInvested) / type.totalInvested) * 100 : 0;
    });
    
    res.json({
      totalValue,
      totalInvested,
      totalReturn,
      returnPercentage,
      byType: Object.values(byType),
      investments
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user's investment portfolio
router.get('/portfolio', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id });
    
    // Calculate portfolio summary
    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentPrice * inv.quantity), 0);
    const totalCost = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0);
    const totalReturn = totalValue - totalCost;
    const returnPercentage = ((totalReturn / totalCost) * 100).toFixed(2);

    res.json({
      totalValue,
      totalReturn,
      returnPercentage,
      holdings: investments
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Error fetching portfolio data' });
  }
});

// Add new investment
router.post('/', auth, async (req, res) => {
  try {
    const { symbol, companyName, quantity, purchasePrice, purchaseDate } = req.body;

    // Fetch current price from stock market API
    const stockResponse = await axios.get(`/api/indian-stocks/${symbol}/data`);
    const currentPrice = stockResponse.data.datasets[0].data[stockResponse.data.datasets[0].data.length - 1];

    const investment = new Investment({
      user: req.user.id,
      symbol,
      companyName,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate
    });

    await investment.save();
    res.status(201).json(investment);
  } catch (error) {
    console.error('Error adding investment:', error);
    res.status(500).json({ message: 'Error adding investment' });
  }
});

// Update investment
router.put('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const { quantity, purchasePrice, purchaseDate } = req.body;
    
    // Fetch current price from stock market API
    const stockResponse = await axios.get(`/api/indian-stocks/${investment.symbol}/data`);
    const currentPrice = stockResponse.data.datasets[0].data[stockResponse.data.datasets[0].data.length - 1];

    investment.quantity = quantity;
    investment.purchasePrice = purchasePrice;
    investment.currentPrice = currentPrice;
    investment.purchaseDate = purchaseDate;

    await investment.save();
    res.json(investment);
  } catch (error) {
    console.error('Error updating investment:', error);
    res.status(500).json({ message: 'Error updating investment' });
  }
});

// Delete investment
router.delete('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Error deleting investment:', error);
    res.status(500).json({ message: 'Error deleting investment' });
  }
});

module.exports = router; 