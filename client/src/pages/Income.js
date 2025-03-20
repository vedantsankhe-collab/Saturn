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
  Tooltip
} from '@mui/material';
import { Add, Delete, Edit, Sort, AttachMoney, TrendingUp } from '@mui/icons-material';
import api from '../utils/api';

const Income = () => {
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    source: 'salary'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    totalIncome: 0,
    averageIncome: 0,
    highestIncome: 0,
    monthlyIncome: 0
  });

  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchIncome();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (incomeEntries.length > 0) {
      calculateStats();
    }
  }, [incomeEntries]);

  const fetchIncome = async () => {
    setLoading(true);
    try {
      const res = await api.get('/income');
      setIncomeEntries(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch income data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      // Filter to only income categories
      const incomeCategories = res.data.filter(cat => cat.type === 'income');
      setCategories(incomeCategories);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editMode) {
        await api.put(`/income/${currentId}`, formData);
      } else {
        await api.post('/income', formData);
      }
      
      resetForm();
      fetchIncome();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save income entry');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      source: 'salary'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const handleEdit = (income) => {
    setFormData({
      amount: income.amount,
      description: income.description,
      category: income.category._id || income.category,
      date: new Date(income.date).toISOString().split('T')[0],
      source: income.source || 'salary'
    });
    setEditMode(true);
    setCurrentId(income._id);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/income/${incomeToDelete}`);
      setIncomeEntries(incomeEntries.filter(income => income._id !== incomeToDelete));
      setDeleteDialogOpen(false);
      setIncomeToDelete(null);
    } catch (err) {
      setError('Failed to delete income entry');
      console.error(err);
    }
  };

  const openDeleteDialog = (id) => {
    setIncomeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleFilterChange = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange({
      ...dateRange,
      [field]: value
    });
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const calculateStats = () => {
    const total = incomeEntries.reduce((sum, income) => sum + income.amount, 0);
    const avg = total / incomeEntries.length;
    const highest = Math.max(...incomeEntries.map(income => income.amount));
    
    // Calculate monthly income (current month)
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyTotal = incomeEntries
      .filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === currentMonth && incomeDate.getFullYear() === currentYear;
      })
      .reduce((sum, income) => sum + income.amount, 0);
    
    setStats({
      totalIncome: total.toFixed(2),
      averageIncome: avg.toFixed(2),
      highestIncome: highest.toFixed(2),
      monthlyIncome: monthlyTotal.toFixed(2)
    });
  };

  const filteredIncome = incomeEntries
    .filter(income => !filterCategory || (income.category && income.category._id === filterCategory))
    .filter(income => {
      const incomeDate = new Date(income.date);
      if (dateRange.startDate && dateRange.endDate) {
        return incomeDate >= new Date(dateRange.startDate) && incomeDate <= new Date(dateRange.endDate);
      } else if (dateRange.startDate) {
        return incomeDate >= new Date(dateRange.startDate);
      } else if (dateRange.endDate) {
        return incomeDate <= new Date(dateRange.endDate);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return 0;
    });

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Income Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Stats Cards */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Income
                    </Typography>
                    <Typography variant="h5" component="div" sx={{ color: 'success.main', display: 'flex', alignItems: 'center' }}>
                      <TrendingUp sx={{ mr: 1 }} />
                      ${stats.totalIncome}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Monthly Income
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${stats.monthlyIncome}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Average Income
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${stats.averageIncome}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Highest Income
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${stats.highestIncome}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Add/Edit Income Form */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {editMode ? 'Edit Income' : 'Add New Income'}
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <AttachMoney fontSize="small" />,
                  }}
                />
                
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                />
                
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    {categories.map(category => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Source</InputLabel>
                  <Select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    label="Source"
                  >
                    <MenuItem value="salary">Salary</MenuItem>
                    <MenuItem value="freelance">Freelance</MenuItem>
                    <MenuItem value="investment">Investment</MenuItem>
                    <MenuItem value="gift">Gift</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    type="submit"
                    startIcon={editMode ? <Edit /> : <Add />}
                  >
                    {editMode ? 'Update' : 'Add'} Income
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
              </form>
            </Paper>
          </Grid>

          {/* Income List */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Income History
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel size="small">Category</InputLabel>
                    <Select
                      value={filterCategory}
                      onChange={handleFilterChange}
                      label="Category"
                      size="small"
                      displayEmpty
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map(category => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="From"
                    type="date"
                    value={dateRange.startDate || ''}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    size="small"
                    sx={{ width: 150 }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  
                  <TextField
                    label="To"
                    type="date"
                    value={dateRange.endDate || ''}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    size="small"
                    sx={{ width: 150 }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Box>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : filteredIncome.length === 0 ? (
                <Alert severity="info">No income entries found. Add your first income!</Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Box 
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => handleSortChange('date')}
                          >
                            Date
                            {sortBy === 'date' && (
                              <Sort sx={{ ml: 0.5, transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>
                          <Box 
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => handleSortChange('amount')}
                          >
                            Amount
                            {sortBy === 'amount' && (
                              <Sort sx={{ ml: 0.5, transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>Source</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredIncome.map((income) => (
                        <TableRow key={income._id}>
                          <TableCell>
                            {new Date(income.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{income.description}</TableCell>
                          <TableCell>
                            <Chip 
                              label={income.category?.name || 'Uncategorized'} 
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>${income.amount.toFixed(2)}</TableCell>
                          <TableCell>{income.source}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton 
                                size="small" 
                                color="primary"
                                onClick={() => handleEdit(income)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => openDeleteDialog(income._id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this income entry? This action cannot be undone.
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
    </Container>
  );
};

export default Income; 