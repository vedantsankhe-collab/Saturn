const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

// Get market data for Indian stocks
router.get('/market-data', auth, async (req, res) => {
  try {
    const { index, timeframe } = req.query;
    
    // In a real application, you would fetch this data from a stock market API
    // For now, we'll return mock data
    const mockData = {
      indices: [
        {
          name: 'NIFTY 50',
          value: 19500.25,
          change: 0.85
        },
        {
          name: 'SENSEX',
          value: 64800.50,
          change: 0.92
        },
        {
          name: 'NIFTY BANK',
          value: 43500.75,
          change: -0.45
        },
        {
          name: 'NIFTY IT',
          value: 28500.30,
          change: 1.25
        }
      ],
      topGainers: [
        {
          symbol: 'RELIANCE',
          companyName: 'Reliance Industries',
          price: 2450.75,
          change: 2.5,
          volume: 1500000
        },
        {
          symbol: 'TCS',
          companyName: 'Tata Consultancy Services',
          price: 3500.25,
          change: 1.8,
          volume: 800000
        }
      ],
      topLosers: [
        {
          symbol: 'INFY',
          companyName: 'Infosys',
          price: 1450.50,
          change: -1.2,
          volume: 1200000
        },
        {
          symbol: 'HDFCBANK',
          companyName: 'HDFC Bank',
          price: 1550.75,
          change: -0.8,
          volume: 900000
        }
      ],
      mostActive: [
        {
          symbol: 'RELIANCE',
          companyName: 'Reliance Industries',
          price: 2450.75,
          change: 2.5,
          volume: 1500000
        },
        {
          symbol: 'TCS',
          companyName: 'Tata Consultancy Services',
          price: 3500.25,
          change: 1.8,
          volume: 800000
        }
      ]
    };

    res.json(mockData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ message: 'Error fetching market data' });
  }
});

// Search stocks
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    // In a real application, you would search through a stock database
    // For now, we'll return mock data
    const mockResults = [
      {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries',
        price: 2450.75,
        change: 2.5,
        volume: 1500000
      },
      {
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services',
        price: 3500.25,
        change: 1.8,
        volume: 800000
      }
    ];

    res.json(mockResults);
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ message: 'Error searching stocks' });
  }
});

// Get stock data for a specific symbol
router.get('/:symbol/data', auth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe } = req.query;

    // In a real application, you would fetch this data from a stock market API
    // For now, we'll return mock data
    const mockData = {
      labels: ['9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'],
      datasets: [
        {
          label: 'Stock Price',
          data: [2450, 2460, 2455, 2465, 2470, 2468, 2475, 2480, 2478, 2485, 2490, 2488, 2495],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };

    res.json(mockData);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ message: 'Error fetching stock data' });
  }
});

// Get AI investment advice
router.post('/ai/investment-advice', auth, async (req, res) => {
  try {
    const { message } = req.body;

    // Since we don't have a valid OpenAI API key, we'll return mock data
    const mockAdvice = "Based on your query, here are some investment recommendations:\n\n" +
      "- Consider diversifying your portfolio across different sectors\n" +
      "- Look for companies with strong fundamentals and consistent growth\n" +
      "- Maintain a long-term investment horizon for better returns\n" +
      "- Keep a portion of your portfolio in blue-chip stocks for stability\n" +
      "- Monitor market trends and adjust your strategy accordingly";
    
    const strategy = [
      "Diversify across sectors",
      "Focus on strong fundamentals",
      "Maintain long-term perspective",
      "Include blue-chip stocks",
      "Monitor market trends"
    ];

    res.json({
      advice: mockAdvice,
      strategy: strategy
    });
  } catch (error) {
    console.error('Error getting AI advice:', error);
    res.status(500).json({ message: 'Error getting investment advice' });
  }
});

// Get stocks for a specific market
router.get('/', auth, async (req, res) => {
  try {
    const { market } = req.query;
    
    // In a real application, you would fetch this data from a stock market API
    // For now, we'll return mock data
    const mockStocks = [
      {
        symbol: 'RELIANCE',
        companyName: 'Reliance Industries',
        price: 2450.75,
        change: 2.5,
        volume: 1500000,
        market: 'NSE'
      },
      {
        symbol: 'TCS',
        companyName: 'Tata Consultancy Services',
        price: 3500.25,
        change: 1.8,
        volume: 800000,
        market: 'NSE'
      },
      {
        symbol: 'INFY',
        companyName: 'Infosys',
        price: 1450.50,
        change: -1.2,
        volume: 1200000,
        market: 'NSE'
      },
      {
        symbol: 'HDFCBANK',
        companyName: 'HDFC Bank',
        price: 1550.75,
        change: -0.8,
        volume: 900000,
        market: 'NSE'
      }
    ];

    // Filter by market if provided
    const filteredStocks = market 
      ? mockStocks.filter(stock => stock.market === market)
      : mockStocks;

    res.json(filteredStocks);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ message: 'Error fetching stocks' });
  }
});

module.exports = router; 