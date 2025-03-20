import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import api from '../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StockTracker = ({ onStockSelect }) => {
  const [stocks, setStocks] = useState([]);
  const [newStock, setNewStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [market, setMarket] = useState('NSE'); // NSE for Indian market

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    if (selectedStock) {
      fetchStockData(selectedStock.symbol);
    }
  }, [selectedStock, timeframe]);

  const fetchStocks = async () => {
    try {
      const response = await api.get(`/indian-stocks`, {
        params: { market }
      });
      setStocks(response.data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
    }
  };

  const fetchStockData = async (symbol) => {
    setLoading(true);
    try {
      const response = await api.get(`/indian-stocks/${symbol}/data`, {
        params: { timeframe }
      });
      setChartData(response.data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async () => {
    if (!newStock.trim()) return;

    try {
      // Since there's no endpoint to add stocks, we'll mock it client-side
      const mockNewStock = {
        symbol: newStock.toUpperCase(),
        price: Math.random() * 1000 + 500, // Random price between 500 and 1500
        change: (Math.random() * 5 - 2.5).toFixed(2), // Random change between -2.5% and 2.5%
        market
      };
      
      setStocks(prev => [...prev, mockNewStock]);
      setNewStock('');
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  const handleRefresh = () => {
    fetchStocks();
    if (selectedStock) {
      fetchStockData(selectedStock.symbol);
    }
  };

  const handleRowClick = (stock) => {
    // Make sure all required fields are present and properly formatted
    const formattedStock = {
      ...stock,
      symbol: stock.symbol,
      companyName: stock.companyName || stock.symbol,
      price: typeof stock.price === 'number' ? stock.price : parseFloat(stock.price)
    };
    
    setSelectedStock(formattedStock);
    onStockSelect(formattedStock);
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: selectedStock ? `${selectedStock.symbol} Stock Price` : 'Select a stock'
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Tracked Stocks</Typography>
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value)}
              placeholder="Add stock symbol"
              variant="outlined"
            />
            <IconButton onClick={handleAddStock} color="primary">
              <AddIcon />
            </IconButton>
          </Box>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Market</InputLabel>
            <Select
              value={market}
              label="Market"
              onChange={(e) => setMarket(e.target.value)}
            >
              <MenuItem value="NSE">NSE (India)</MenuItem>
              <MenuItem value="BSE">BSE (India)</MenuItem>
            </Select>
          </FormControl>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Change</TableCell>
                  <TableCell align="right">Volume</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stocks.map((stock) => (
                  <TableRow 
                    key={stock.symbol}
                    hover
                    onClick={() => handleRowClick(stock)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{stock.symbol}</TableCell>
                    <TableCell>{stock.companyName}</TableCell>
                    <TableCell align="right">₹{stock.price.toFixed(2)}</TableCell>
                    <TableCell 
                      align="right"
                      sx={{ 
                        color: stock.change >= 0 ? 'success.main' : 'error.main'
                      }}
                    >
                      {stock.change}%
                    </TableCell>
                    <TableCell align="right">{stock.volume}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Stock Chart</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
              >
                <MenuItem value="1D">1 Day</MenuItem>
                <MenuItem value="1W">1 Week</MenuItem>
                <MenuItem value="1M">1 Month</MenuItem>
                <MenuItem value="3M">3 Months</MenuItem>
                <MenuItem value="1Y">1 Year</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : chartData ? (
            <Line options={chartOptions} data={chartData} />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography color="text.secondary">
                Select a stock to view its chart
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default StockTracker; 