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
import { api } from '../utils/api';
import StockTracker from '../components/StockTracker';
import InvestmentChatbot from '../components/InvestmentChatbot';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`investment-tabpanel-${index}`}
      aria-labelledby={`investment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

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
      console.log('Investments fetched successfully:', res.data);
      
      if (Array.isArray(res.data)) {
        setInvestments(res.data);
        
        // Now that investments are loaded, update derived stats
        if (res.data.length > 0) {
          setTimeout(() => {
            calculatePortfolioStats();
            calculateAssetAllocation();
            updatePortfolioMetrics();
          }, 0);
        }
        
        setError(null);
      } else {
        console.error('Invalid investments data format:', res.data);
        setError('Received invalid investments data format');
      }
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
      console.log('Fetching portfolio data...');
      const response = await api.get('/api/investments/portfolio');
      console.log('Portfolio data fetched successfully:', response.data);
      
      if (response.data && typeof response.data === 'object') {
        setPortfolio(response.data);
        
        // Update portfolio metrics based on the fetched data
        if (response.data.totalValue !== undefined) {
          setPortfolioMetrics({
            totalValue: response.data.totalValue || 0,
            totalCost: response.data.totalCost || 0,
            totalReturn: response.data.totalReturn || 0,
            returnPercentage: response.data.returnPercentage || 0
          });
        }
        
        setError(null);
      } else {
        console.error('Invalid portfolio data format:', response.data);
        setError('Received invalid portfolio data format');
      }
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      setError('Failed to fetch portfolio data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async (symbol) => {
    try {
      console.log('Fetching stock data for symbol:', symbol);
      const response = await api.get(`/api/stocks/${symbol}`);
      console.log('Stock data fetched successfully:', response.data);
      setStockData(response.data);
      
      // Update form data with current stock price
      if (response.data && response.data.datasets && response.data.datasets[0].data.length > 0) {
        const currentPrice = response.data.datasets[0].data[response.data.datasets[0].data.length - 1];
        setFormData(prev => ({ 
          ...prev, 
          currentPrice: currentPrice.toString() 
        }));
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError('Failed to fetch stock data. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = { ...formData };
      
      // Convert string amounts to numbers
      if (formattedData.amount) formattedData.amount = parseFloat(formattedData.amount);
      if (formattedData.purchasePrice) formattedData.purchasePrice = parseFloat(formattedData.purchasePrice);
      if (formattedData.currentPrice) formattedData.currentPrice = parseFloat(formattedData.currentPrice);
      if (formattedData.quantity) formattedData.quantity = parseFloat(formattedData.quantity);
      
      console.log('Submitting investment:', formattedData);
      
      if (editMode) {
        console.log('Updating investment:', currentId);
        await api.put(`/api/investments/${currentId}`, formattedData);
        setSnackbar({
          open: true,
          message: 'Investment updated successfully!',
          severity: 'success'
        });
      } else {
        console.log('Creating new investment');
        await api.post('/api/investments', formattedData);
        setSnackbar({
          open: true,
          message: 'Investment added successfully!',
          severity: 'success'
        });
      }
      
      resetForm();
      fetchInvestments();
      fetchPortfolioData();
    } catch (err) {
      console.error('Error saving investment:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save investment',
        severity: 'error'
      });
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
      console.log('Deleting investment:', investmentToDelete);
      await api.delete(`/api/investments/${investmentToDelete}`);
      
      setInvestments(investments.filter(inv => inv._id !== investmentToDelete));
      setDeleteDialogOpen(false);
      setInvestmentToDelete(null);
      
      setSnackbar({
        open: true,
        message: 'Investment deleted successfully!',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting investment:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete investment',
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
    console.log('Calculating asset allocation from investments:', investments);
    
    if (!investments || investments.length === 0) {
      console.log('No investments available to calculate asset allocation');
      return;
    }
    
    try {
      // Initialize allocation counters
      let totalStock = 0;
      let totalBond = 0;
      let totalRealEstate = 0;
      let totalCrypto = 0;
      let totalOther = 0;
      let portfolioTotal = 0;
      
      // Calculate total value by type
      investments.forEach(investment => {
        if (investment.quantity && investment.currentPrice) {
          const value = investment.quantity * investment.currentPrice;
          portfolioTotal += value;
          
          switch (investment.type) {
            case 'stock':
              totalStock += value;
              break;
            case 'bond':
              totalBond += value;
              break;
            case 'realEstate':
              totalRealEstate += value;
              break;
            case 'crypto':
              totalCrypto += value;
              break;
            default:
              totalOther += value;
              break;
          }
        }
      });
      
      // Convert to percentages
      const allocation = {
        stock: portfolioTotal > 0 ? (totalStock / portfolioTotal) * 100 : 0,
        bond: portfolioTotal > 0 ? (totalBond / portfolioTotal) * 100 : 0,
        realEstate: portfolioTotal > 0 ? (totalRealEstate / portfolioTotal) * 100 : 0,
        crypto: portfolioTotal > 0 ? (totalCrypto / portfolioTotal) * 100 : 0,
        other: portfolioTotal > 0 ? (totalOther / portfolioTotal) * 100 : 0
      };
      
      console.log('Updated asset allocation:', allocation);
      setAssetAllocation(allocation);
    } catch (error) {
      console.error('Error calculating asset allocation:', error);
    }
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

      // Debug log
      console.log('Building investment data payload...');

      // Ensure purchaseDate is in the correct format
      let purchaseDate = formData.purchaseDate;
      if (!purchaseDate) {
        purchaseDate = new Date().toISOString().split('T')[0];
      }

      const investmentData = {
        symbol: selectedStock ? selectedStock.symbol : formData.name,
        companyName: selectedStock ? selectedStock.companyName : formData.name,
        quantity: quantity,
        purchasePrice: purchasePrice,
        currentPrice: currentPrice,
        purchaseDate: purchaseDate,
        notes: formData.notes || ''
      };

      console.log('Investment data being submitted:', investmentData);

      let response;
      if (editMode) {
        console.log(`Sending PUT request to /api/investments/${currentId}`);
        response = await api.put(`/api/investments/${currentId}`, investmentData);
        console.log('Investment updated, server response:', response.data);
      } else {
        console.log('Sending POST request to /api/investments');
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
      
      // Clear the form and selected stock
      resetForm();
      setSelectedStock(null);
      
      handleCloseDialog();
      
      // Show success message
      setSnackbar({
        open: true,
        message: editMode ? 'Investment updated successfully' : 'Investment added successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error submitting investment:', error);
      console.error('Error response:', error.response);
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
      
      // Ensure we have valid data in all fields
      return {
        ...prev,
        name: stock.symbol,
        currentPrice: priceToUse,
        // If purchasing for the first time, set purchase price to current price
        purchasePrice: prev.purchasePrice || priceToUse
      };
    });
    
    console.log('Form data updated with stock:', stock.symbol);
  };

  const updatePortfolioMetrics = () => {
    console.log('Updating portfolio metrics from investments:', investments);
    
    if (!investments || investments.length === 0) {
      console.log('No investments available to calculate metrics');
      return;
    }
    
    try {
      // Calculate total portfolio value and cost
      let totalValue = 0;
      let totalCost = 0;
      
      investments.forEach(investment => {
        if (investment.quantity && investment.currentPrice) {
          const investmentValue = investment.quantity * investment.currentPrice;
          totalValue += investmentValue;
        }
        
        if (investment.quantity && investment.purchasePrice) {
          const investmentCost = investment.quantity * investment.purchasePrice;
          totalCost += investmentCost;
        }
      });
      
      // Calculate total return and percentage
      const totalReturn = totalValue - totalCost;
      const returnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
      
      const updatedMetrics = {
        totalValue,
        totalCost,
        totalReturn,
        returnPercentage
      };
      
      console.log('Updated portfolio metrics:', updatedMetrics);
      setPortfolioMetrics(updatedMetrics);
    } catch (error) {
      console.error('Error calculating portfolio metrics:', error);
    }
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
        return renderStockTrackerPanel();
      
      case 4: // Investment Chatbot
        return <InvestmentChatbot />;
      
      default:
        return null;
    }
  };

  const renderStockTrackerPanel = () => {
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Stock Tracker
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Search for stocks to track and add to your portfolio.
        </Alert>
        <Box sx={{ mb: 2 }}>
          <StockTracker 
            onStockSelect={handleStockSelect} 
            onAddInvestment={handleAddInvestmentClick}
          />
        </Box>
        
        {selectedStock && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {selectedStock.companyName || selectedStock.name} ({selectedStock.symbol})
            </Typography>
            
            {stockData ? (
              <Box sx={{ height: 300 }}>
                <Line 
                  data={stockData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        title: {
                          display: true,
                          text: 'Price (₹)'
                        }
                      },
                      x: {
                        title: {
                          display: true,
                          text: 'Date'
                        }
                      }
                    }
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            )}
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddInvestmentClick}
              sx={{ mt: 2 }}
            >
              Add to Portfolio
            </Button>
          </Box>
        )}
      </Box>
    );
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

  const renderPortfolioCharts = () => {
    // Prepare data for Asset Allocation chart
    const assetAllocationData = {
      labels: Object.keys(assetAllocation).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
      datasets: [
        {
          data: Object.values(assetAllocation),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)', // Stock
            'rgba(255, 206, 86, 0.6)', // Bond
            'rgba(75, 192, 192, 0.6)', // Real Estate
            'rgba(153, 102, 255, 0.6)', // Crypto
            'rgba(255, 159, 64, 0.6)'  // Other
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };

    // Performance data (monthly returns)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const lastSixMonths = months.slice(currentMonth - 5, currentMonth + 1);
    
    const performanceData = {
      labels: lastSixMonths,
      datasets: [
        {
          label: 'Monthly Return (%)',
          data: [2.5, 1.8, -0.9, 3.2, 2.1, portfolioMetrics.returnPercentage || 1.5],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          tension: 0.4,
        },
      ],
    };
    
    console.log('Rendering portfolio charts with data:', { 
      assetAllocation, 
      performanceData, 
      portfolioMetrics 
    });

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) {
                label += ': ';
              }
              label += (context.parsed || 0) + '%';
              return label;
            }
          }
        }
      },
    };

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300, position: 'relative' }}>
            <Typography variant="h6" gutterBottom>
              Asset Allocation
            </Typography>
            {investments.length > 0 ? (
              <Box sx={{ height: 240, position: 'relative' }}>
                <Doughnut data={assetAllocationData} options={chartOptions} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
                <Typography color="textSecondary">
                  No investment data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Performance (Last 6 Months)
            </Typography>
            {investments.length > 0 ? (
              <Box sx={{ height: 240 }}>
                <Line data={performanceData} options={chartOptions} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
                <Typography color="textSecondary">
                  No performance data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderPortfolioPanel = () => (
    <Box>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Portfolio Summary Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4" color="primary.main">
                ${portfolioMetrics.totalValue.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Cost
              </Typography>
              <Typography variant="h4">
                ${portfolioMetrics.totalCost.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Total Return
              </Typography>
              <Typography 
                variant="h4" 
                color={portfolioMetrics.totalReturn >= 0 ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {portfolioMetrics.totalReturn >= 0 ? <TrendingUp sx={{ mr: 1 }} /> : <TrendingDown sx={{ mr: 1 }} />}
                ${Math.abs(portfolioMetrics.totalReturn).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Return Rate
              </Typography>
              <Typography 
                variant="h4" 
                color={portfolioMetrics.returnPercentage >= 0 ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                {portfolioMetrics.returnPercentage >= 0 ? <TrendingUp sx={{ mr: 1 }} /> : <TrendingDown sx={{ mr: 1 }} />}
                {Math.abs(portfolioMetrics.returnPercentage).toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Portfolio Charts */}
      {renderPortfolioCharts()}
      
      {/* Investments Table */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Your Investments</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddInvestmentClick}
          >
            Add Investment
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : investments.length === 0 ? (
          <Alert severity="info">
            You don't have any investments yet. Add your first investment to get started.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name/Symbol</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Purchase Price</TableCell>
                  <TableCell align="right">Current Price</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell align="right">Return</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {investments.map((investment) => {
                  const totalValue = investment.quantity * investment.currentPrice;
                  const totalCost = investment.quantity * investment.purchasePrice;
                  const totalReturn = totalValue - totalCost;
                  const returnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
                  
                  return (
                    <TableRow key={investment._id}>
                      <TableCell>{investment.symbol || investment.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={investment.type.charAt(0).toUpperCase() + investment.type.slice(1)} 
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{investment.quantity}</TableCell>
                      <TableCell align="right">${investment.purchasePrice}</TableCell>
                      <TableCell align="right">${investment.currentPrice}</TableCell>
                      <TableCell align="right">${totalValue.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'flex-end',
                            color: returnPercentage >= 0 ? 'success.main' : 'error.main'
                          }}
                        >
                          {returnPercentage >= 0 ? <TrendingUp fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />}
                          {returnPercentage.toFixed(2)}%
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleEdit(investment)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => openDeleteDialog(investment._id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
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