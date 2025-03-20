import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
  Snackbar
} from '@mui/material';
import { 
  Add, 
  Delete, 
  Edit, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  AttachMoney,
  ShowChart,
  AccountBalance
} from '@mui/icons-material';
import api from '../utils/api';
import StockTracker from '../components/StockTracker';
import InvestmentChatbot from '../components/InvestmentChatbot';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ padding: '20px 0' }}>
    {value === index && children}
  </div>
);

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock',
    amount: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [investmentToDelete, setInvestmentToDelete] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [portfolioStats, setPortfolioStats] = useState({
    totalInvested: 0,
    currentValue: 0,
    totalGain: 0,
    totalGainPercentage: 0,
    bestPerforming: { name: '', gain: 0 },
    worstPerforming: { name: '', gain: 0 }
  });
  const [assetAllocation, setAssetAllocation] = useState({
    stock: 0,
    bond: 0,
    realEstate: 0,
    crypto: 0,
    other: 0
  });
  const [portfolio, setPortfolio] = useState({
    totalValue: 0,
    totalReturn: 0,
    returnPercentage: 0,
    holdings: []
  });
  const [addInvestmentDialogOpen, setAddInvestmentDialogOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockData, setStockData] = useState(null);
  const [portfolioMetrics, setPortfolioMetrics] = useState({
    totalValue: 0,
    totalCost: 0,
    totalReturn: 0,
    returnPercentage: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchInvestments();
    fetchPortfolioData();
  }, []);

  useEffect(() => {
    if (investments.length > 0) {
      calculatePortfolioStats();
      calculateAssetAllocation();
      updatePortfolioMetrics();
    }
  }, [investments]);

  useEffect(() => {
    if (selectedStock) {
      fetchStockData(selectedStock.symbol);
    }
  }, [selectedStock]);

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      console.log('Fetching investments...');
      const res = await api.get('/api/investments');
      console.log('Investments fetched:', res.data);
      setInvestments(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching investments:', err);
      setError('Failed to fetch investments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/investments/portfolio');
      console.log('Portfolio data fetched:', response.data);
      setPortfolio(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setError('Failed to fetch portfolio data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async (symbol) => {
    try {
      const response = await api.get(`/api/indian-stocks/${symbol}/data`);
      console.log('Stock data fetched:', response.data);
      setStockData(response.data);
      
      // Update form data with current stock price
      if (response.data.datasets && response.data.datasets[0].data.length > 0) {
        const currentPrice = response.data.datasets[0].data[response.data.datasets[0].data.length - 1];
        setFormData(prev => ({ 
          ...prev, 
          currentPrice: currentPrice.toString() 
        }));
        console.log('Current price set from API:', currentPrice);
      } else {
        console.log('No stock price data available from API');
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Don't update currentPrice on error, keep existing value
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        await api.put(`/investments/${currentId}`, formData);
      } else {
        await api.post('/investments', formData);
      }
      
      resetForm();
      fetchInvestments();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save investment');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'stock',
      amount: '',
      purchasePrice: '',
      currentPrice: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    // Clear selected stock
    setSelectedStock(null);
    setEditMode(false);
    setCurrentId(null);
    setError(null);
    console.log('Form reset to initial state');
  };

  const handleEdit = (investment) => {
    setFormData({
      name: investment.name,
      type: investment.type,
      amount: investment.amount,
      purchasePrice: investment.purchasePrice,
      currentPrice: investment.currentPrice,
      purchaseDate: new Date(investment.purchaseDate).toISOString().split('T')[0],
      notes: investment.notes || ''
    });
    setEditMode(true);
    setCurrentId(investment._id);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/investments/${investmentToDelete}`);
      
      // Refresh investment data after deletion
      await fetchInvestments();
      await fetchPortfolioData();
      
      // Update portfolio metrics
      updatePortfolioMetrics();
      calculatePortfolioStats();
      calculateAssetAllocation();
      
      setDeleteDialogOpen(false);
      setInvestmentToDelete(null);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Investment deleted successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting investment:', err);
      setError('Failed to delete investment');
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Error deleting investment: ${err.response?.data?.msg || err.message}`,
        severity: 'error'
      });
    }
  };

  const openDeleteDialog = (id) => {
    setInvestmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const calculatePortfolioStats = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.amount), 0);
    const currentValue = investments.reduce((sum, inv) => sum + (inv.currentPrice * inv.amount), 0);
    const totalGain = currentValue - totalInvested;
    const totalGainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
    
    // Find best and worst performing investments
    let bestPerforming = { name: 'None', gain: -Infinity };
    let worstPerforming = { name: 'None', gain: Infinity };
    
    investments.forEach(inv => {
      const investmentGain = ((inv.currentPrice - inv.purchasePrice) / inv.purchasePrice) * 100;
      
      if (investmentGain > bestPerforming.gain) {
        bestPerforming = { name: inv.name, gain: investmentGain };
      }
      
      if (investmentGain < worstPerforming.gain) {
        worstPerforming = { name: inv.name, gain: investmentGain };
      }
    });
    
    // If no investments found, reset to default values
    if (bestPerforming.gain === -Infinity) {
      bestPerforming = { name: 'None', gain: 0 };
    }
    
    if (worstPerforming.gain === Infinity) {
      worstPerforming = { name: 'None', gain: 0 };
    }
    
    setPortfolioStats({
      totalInvested: totalInvested.toFixed(2),
      currentValue: currentValue.toFixed(2),
      totalGain: totalGain.toFixed(2),
      totalGainPercentage: totalGainPercentage.toFixed(2),
      bestPerforming,
      worstPerforming
    });
  };

  const calculateAssetAllocation = () => {
    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentPrice * inv.amount), 0);
    
    if (totalValue === 0) {
      setAssetAllocation({
        stock: 0,
        bond: 0,
        realEstate: 0,
        crypto: 0,
        other: 0
      });
      return;
    }
    
    const allocation = {
      stock: 0,
      bond: 0,
      realEstate: 0,
      crypto: 0,
      other: 0
    };
    
    investments.forEach(inv => {
      const value = inv.currentPrice * inv.amount;
      const percentage = (value / totalValue) * 100;
      
      if (inv.type in allocation) {
        allocation[inv.type] += percentage;
      } else {
        allocation.other += percentage;
      }
    });
    
    // Round to 2 decimal places
    Object.keys(allocation).forEach(key => {
      allocation[key] = parseFloat(allocation[key].toFixed(2));
    });
    
    setAssetAllocation(allocation);
  };

  const getPerformanceColor = (value) => {
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'text.primary';
  };

  const getPerformanceIcon = (value) => {
    if (value > 0) return <TrendingUp fontSize="small" />;
    if (value < 0) return <TrendingDown fontSize="small" />;
    return null;
  };

  const handleAddInvestmentClick = () => {
    resetForm(); // Reset form data to clear any previous values
    setAddInvestmentDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setAddInvestmentDialogOpen(false);
  };

  const handleSubmitInvestment = async (e) => {
    if (e) e.preventDefault();
    
    try {
      console.log("Selected stock:", selectedStock);
      console.log("Form data before submission:", formData);
      
      // Ensure numeric values are properly converted
      const quantity = parseFloat(formData.amount);
      const purchasePrice = parseFloat(formData.purchasePrice);
      
      // Handle current price with fallbacks
      let currentPrice;
      if (selectedStock && selectedStock.price) {
        currentPrice = parseFloat(selectedStock.price);
        console.log("Using price from selected stock:", currentPrice);
      } else if (formData.currentPrice && !isNaN(parseFloat(formData.currentPrice))) {
        currentPrice = parseFloat(formData.currentPrice);
        console.log("Using price from form data:", currentPrice);
      } else {
        // If no price is available, default to purchase price
        currentPrice = purchasePrice;
        console.log("No current price available, defaulting to purchase price:", currentPrice);
      }

      // Validate required fields
      if (isNaN(quantity) || quantity <= 0) {
        throw new Error('Please enter a valid quantity');
      }
      
      if (isNaN(purchasePrice) || purchasePrice <= 0) {
        throw new Error('Please enter a valid purchase price');
      }
      
      if (isNaN(currentPrice) || currentPrice <= 0) {
        throw new Error('Please enter a valid current price');
      }
      
      if (!formData.name) {
        throw new Error('Please enter a valid stock name/symbol');
      }

      const investmentData = {
        symbol: selectedStock ? selectedStock.symbol : formData.name,
        companyName: selectedStock ? selectedStock.companyName : formData.name,
        quantity: quantity,
        purchasePrice: purchasePrice,
        currentPrice: currentPrice,
        purchaseDate: formData.purchaseDate,
        notes: formData.notes || ''
      };

      console.log('Investment data being submitted:', investmentData);

      let response;
      if (editMode) {
        response = await api.put(`/api/investments/${currentId}`, investmentData);
        console.log('Investment updated, server response:', response.data);
      } else {
        response = await api.post('/api/investments', investmentData);
        console.log('Investment created, server response:', response.data);
      }

      // Refresh investments data
      await fetchInvestments();
      
      // Update portfolio metrics explicitly
      updatePortfolioMetrics();
      calculatePortfolioStats();
      calculateAssetAllocation();
      
      // Also fetch portfolio data again
      await fetchPortfolioData();
      
      handleCloseDialog();
      
      // Show success message
      setSnackbar({
        open: true,
        message: editMode ? 'Investment updated successfully' : 'Investment added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting investment:', error);
      console.error('Error details:', error.response?.data);
      
      setSnackbar({
        open: true,
        message: `Error saving investment: ${error.response?.data?.msg || error.message}`,
        severity: 'error'
      });
    }
  };

  const handleStockSelect = (stock) => {
    console.log('Stock selected:', stock);
    
    // Make sure stock has all required fields
    if (!stock || !stock.symbol) {
      console.error('Invalid stock selected:', stock);
      return;
    }
    
    setSelectedStock(stock);
    
    // Update form data with stock information
    setFormData(prev => {
      // Keep current price if already present and stock.price is missing
      const priceToUse = (stock.price) ? stock.price.toString() 
                                      : (prev.currentPrice) ? prev.currentPrice 
                                      : '0';
                                      
      console.log('Using price for form:', priceToUse);
                                      
      return {
        ...prev,
        name: stock.symbol,
        companyName: stock.companyName || stock.symbol,
        currentPrice: priceToUse
      };
    });
    
    console.log('Form data updated with stock:', stock.symbol);
  };

  const updatePortfolioMetrics = () => {
    console.log('Updating portfolio metrics with investments:', investments);
    if (!investments || investments.length === 0) {
      console.log('No investments found, setting default metrics');
      setPortfolioMetrics({
        totalValue: 0,
        totalCost: 0,
        totalReturn: 0,
        returnPercentage: 0
      });
      return;
    }
    
    const totalValue = investments.reduce((sum, inv) => {
      const value = parseFloat(inv.currentPrice) * parseFloat(inv.quantity);
      console.log(`Investment ${inv.symbol}: ${inv.quantity} units at ${inv.currentPrice} = ${value}`);
      return sum + value;
    }, 0);
    
    const totalCost = investments.reduce((sum, inv) => {
      const cost = parseFloat(inv.purchasePrice) * parseFloat(inv.quantity);
      return sum + cost;
    }, 0);
    
    const totalReturn = totalValue - totalCost;
    const returnPercentage = totalCost > 0 ? ((totalReturn / totalCost) * 100) : 0;

    console.log('Calculated metrics:', {
      totalValue,
      totalCost,
      totalReturn,
      returnPercentage
    });

    setPortfolioMetrics({
      totalValue,
      totalCost,
      totalReturn,
      returnPercentage
    });
  };

  const renderTabContent = () => {
    switch (tabValue) {
      case 0: // Portfolio Overview
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Invested
                      </Typography>
                      <Typography variant="h5" component="div">
                        ${portfolioStats.totalInvested}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Current Value
                      </Typography>
                      <Typography variant="h5" component="div">
                        ${portfolioStats.currentValue}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Gain/Loss
                      </Typography>
                      <Typography 
                        variant="h5" 
                        component="div" 
                        sx={{ 
                          color: getPerformanceColor(parseFloat(portfolioStats.totalGain)),
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {getPerformanceIcon(parseFloat(portfolioStats.totalGain))}
                        <Box component="span" sx={{ ml: 0.5 }}>
                          ${portfolioStats.totalGain}
                        </Box>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Return
                      </Typography>
                      <Typography 
                        variant="h5" 
                        component="div" 
                        sx={{ 
                          color: getPerformanceColor(parseFloat(portfolioStats.totalGainPercentage)),
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {getPerformanceIcon(parseFloat(portfolioStats.totalGainPercentage))}
                        <Box component="span" sx={{ ml: 0.5 }}>
                          {portfolioStats.totalGainPercentage}%
                        </Box>
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Asset Allocation
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(assetAllocation).map(([type, percentage]) => (
                    <Grid item xs={12} sm={6} md={4} key={type}>
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {percentage}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={percentage} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 5,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 5,
                              bgcolor: type === 'stock' ? 'primary.main' : 
                                      type === 'bond' ? 'success.main' : 
                                      type === 'realEstate' ? 'warning.main' : 
                                      type === 'crypto' ? 'error.main' : 'secondary.main'
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Best Performing
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingUp color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h5">
                      {portfolioStats.bestPerforming.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="success.main" 
                      fontWeight="bold"
                    >
                      +{portfolioStats.bestPerforming.gain.toFixed(2)}%
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Worst Performing
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <TrendingDown color="error" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h5">
                      {portfolioStats.worstPerforming.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="error.main" 
                      fontWeight="bold"
                    >
                      {portfolioStats.worstPerforming.gain.toFixed(2)}%
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );
      
      case 1: // Investments List
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Purchase Price</TableCell>
                  <TableCell>Current Price</TableCell>
                  <TableCell>Total Value</TableCell>
                  <TableCell>Gain/Loss</TableCell>
                  <TableCell>Purchase Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {investments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Alert severity="info">No investments found. Add your first investment!</Alert>
                    </TableCell>
                  </TableRow>
                ) : (
                  investments.map((investment) => {
                    const purchaseValue = investment.purchasePrice * investment.amount;
                    const currentValue = investment.currentPrice * investment.amount;
                    const gain = currentValue - purchaseValue;
                    const gainPercentage = (gain / purchaseValue) * 100;
                    
                    return (
                      <TableRow key={investment._id}>
                        <TableCell>{investment.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={investment.type.charAt(0).toUpperCase() + investment.type.slice(1)} 
                            size="small" 
                            color={
                              investment.type === 'stock' ? 'primary' : 
                              investment.type === 'bond' ? 'success' : 
                              investment.type === 'realEstate' ? 'warning' : 
                              investment.type === 'crypto' ? 'error' : 'secondary'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{investment.amount}</TableCell>
                        <TableCell>${investment.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>${investment.currentPrice.toFixed(2)}</TableCell>
                        <TableCell>${currentValue.toFixed(2)}</TableCell>
                        <TableCell>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: getPerformanceColor(gain)
                          }}>
                            {getPerformanceIcon(gain)}
                            <Box component="span" sx={{ ml: 0.5 }}>
                              ${gain.toFixed(2)} ({gainPercentage.toFixed(2)}%)
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{new Date(investment.purchaseDate).toLocaleDateString()}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEdit(investment)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openDeleteDialog(investment._id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        );
      
      case 2: // Add/Edit Investment
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {editMode ? 'Edit Investment' : 'Add New Investment'}
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Investment Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Type</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      label="Type"
                    >
                      <MenuItem value="stock">Stock</MenuItem>
                      <MenuItem value="bond">Bond</MenuItem>
                      <MenuItem value="realEstate">Real Estate</MenuItem>
                      <MenuItem value="crypto">Cryptocurrency</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Amount/Quantity"
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Purchase Price (per unit)"
                    name="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: <AttachMoney fontSize="small" />,
                    }}
                  />
                </Grid>
                
                {/* Always show current price field */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Current Price (per unit)"
                    name="currentPrice"
                    type="number"
                    value={formData.currentPrice}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    InputProps={{
                      startAdornment: <AttachMoney fontSize="small" />,
                    }}
                  />
                  {selectedStock && (
                    <Typography variant="caption" color="primary">
                      Stock selected: {selectedStock.symbol} at ₹{selectedStock.price}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Purchase Date"
                    name="purchaseDate"
                    type="date"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      type="submit"
                      startIcon={editMode ? <Edit /> : <Add />}
                    >
                      {editMode ? 'Update' : 'Add'} Investment
                    </Button>
                    
                    {editMode && (
                      <Button 
                        variant="outlined" 
                        color="secondary" 
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Paper>
        );
      
      case 3: // Stock Tracker
        return (
          <Box>
            <StockTracker onStockSelect={handleStockSelect} />
            {selectedStock && (
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Selected Stock: {selectedStock.symbol}
                </Typography>
                <Typography>
                  Current Price: ₹{selectedStock.price.toFixed(2)}
                </Typography>
                <Typography>
                  Change: {selectedStock.change}%
                </Typography>
              </Paper>
            )}
          </Box>
        );
      
      case 4: // Investment Chatbot
        return <InvestmentChatbot />;
      
      default:
        return null;
    }
  };

  const renderAddInvestmentDialog = () => (
    <Dialog
      open={addInvestmentDialogOpen}
      onClose={handleCloseDialog}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>{editMode ? 'Edit Investment' : 'Add New Investment'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmitInvestment}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Investment Name/Symbol"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                >
                  <MenuItem value="stock">Stock</MenuItem>
                  <MenuItem value="bond">Bond</MenuItem>
                  <MenuItem value="realEstate">Real Estate</MenuItem>
                  <MenuItem value="crypto">Cryptocurrency</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Amount/Quantity"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Purchase Price (per unit)"
                name="purchasePrice"
                type="number"
                value={formData.purchasePrice}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputProps={{
                  startAdornment: <AttachMoney fontSize="small" />,
                }}
              />
            </Grid>
            
            {/* Always show current price field */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Current Price (per unit)"
                name="currentPrice"
                type="number"
                value={formData.currentPrice}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputProps={{
                  startAdornment: <AttachMoney fontSize="small" />,
                }}
              />
              {selectedStock && (
                <Typography variant="caption" color="primary">
                  Stock selected: {selectedStock.symbol} at ₹{selectedStock.price}
                </Typography>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Purchase Date"
                name="purchaseDate"
                type="date"
                value={formData.purchaseDate}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Grid>

            {selectedStock && stockData && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Stock Price Chart
                  </Typography>
                  <Line 
                    data={stockData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: true,
                          text: `${selectedStock.symbol} Stock Price`
                        }
                      }
                    }}
                  />
                </Paper>
              </Grid>
            )}
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmitInvestment} color="primary" variant="contained">
          {editMode ? 'Update' : 'Add'} Investment
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderStockTrackerPanel = () => (
    <Box>
      <StockTracker onStockSelect={handleStockSelect} />
      {selectedStock && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Selected Stock: {selectedStock.symbol}
          </Typography>
          <Typography>
            Current Price: ₹{selectedStock.price.toFixed(2)}
          </Typography>
          <Typography>
            Change: {selectedStock.change}%
          </Typography>
        </Paper>
      )}
    </Box>
  );

  const renderPortfolioCharts = () => {
    const portfolioData = {
      labels: investments.map(inv => inv.symbol || inv.name),
      datasets: [
        {
          label: 'Portfolio Value',
          data: investments.map(inv => inv.currentPrice * inv.quantity),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };

    const returnsData = {
      labels: investments.map(inv => inv.symbol || inv.name),
      datasets: [
        {
          label: 'Total Returns',
          data: investments.map(inv => {
            const totalValue = inv.currentPrice * inv.quantity;
            const totalCost = inv.purchasePrice * inv.quantity;
            return totalValue - totalCost;
          }),
          backgroundColor: investments.map(inv => {
            const totalValue = inv.currentPrice * inv.quantity;
            const totalCost = inv.purchasePrice * inv.quantity;
            return (totalValue - totalCost) >= 0 ? 'rgba(75, 192, 192, 0.5)' : 'rgba(255, 99, 132, 0.5)';
          }),
          borderColor: investments.map(inv => {
            const totalValue = inv.currentPrice * inv.quantity;
            const totalCost = inv.purchasePrice * inv.quantity;
            return (totalValue - totalCost) >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)';
          }),
          borderWidth: 1
        }
      ]
    };

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Portfolio Value by Investment
            </Typography>
            <Bar
              data={portfolioData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Portfolio Value Distribution'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: value => `₹${value.toLocaleString()}`
                    }
                  }
                }
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Returns by Investment
            </Typography>
            <Bar
              data={returnsData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Investment Returns'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: value => `₹${value.toLocaleString()}`
                    }
                  }
                }
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderPortfolioPanel = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Portfolio Summary</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Add />}
              onClick={handleAddInvestmentClick}
            >
              Add Investment
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle2" color="textSecondary">Total Portfolio Value</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>₹{portfolioMetrics.totalValue.toFixed(2)}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle2" color="textSecondary">Total Cost</Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>₹{portfolioMetrics.totalCost.toFixed(2)}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle2" color="textSecondary">Total Return</Typography>
            <Typography 
              variant="h4" 
              sx={{ mt: 1, color: portfolioMetrics.totalReturn >= 0 ? 'success.main' : 'error.main' }}
            >
              ₹{portfolioMetrics.totalReturn.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="subtitle2" color="textSecondary">Return Percentage</Typography>
            <Typography 
              variant="h4" 
              sx={{ mt: 1, color: portfolioMetrics.returnPercentage >= 0 ? 'success.main' : 'error.main' }}
            >
              {portfolioMetrics.returnPercentage.toFixed(2)}%
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          {renderPortfolioCharts()}
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Company Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Purchase Price</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell align="right">Gain/Loss</TableCell>
                  <TableCell align="right">Return %</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {investments.map((investment) => {
                  const totalValue = investment.currentPrice * investment.quantity;
                  const totalCost = investment.purchasePrice * investment.quantity;
                  const gain = totalValue - totalCost;
                  const returnPercentage = totalCost > 0 ? (gain / totalCost) * 100 : 0;
                  
                  return (
                    <TableRow key={investment._id}>
                      <TableCell>{investment.symbol}</TableCell>
                      <TableCell>{investment.companyName}</TableCell>
                      <TableCell align="right">{investment.quantity}</TableCell>
                      <TableCell align="right">₹{investment.purchasePrice.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{investment.currentPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">₹{totalValue.toFixed(2)}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{ color: gain >= 0 ? 'success.main' : 'error.main' }}
                      >
                        ₹{gain.toFixed(2)}
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ color: returnPercentage >= 0 ? 'success.main' : 'error.main' }}
                      >
                        {returnPercentage.toFixed(2)}%
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleEdit(investment)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => openDeleteDialog(investment._id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Investments
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Portfolio Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h6">Total Portfolio Value</Typography>
            <Typography variant="h4">₹{portfolio.totalValue.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h6">Total Return</Typography>
            <Typography variant="h4">₹{portfolio.totalReturn.toLocaleString()}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
            <Typography variant="h6">Return Percentage</Typography>
            <Typography variant="h4">{portfolio.returnPercentage.toFixed(2)}%</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Stock Tracker" />
          <Tab label="Portfolio" />
          <Tab label="Investment Assistant" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderStockTrackerPanel()}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {renderPortfolioPanel()}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <InvestmentChatbot />
        </TabPanel>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this investment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {renderAddInvestmentDialog()}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Investments; 