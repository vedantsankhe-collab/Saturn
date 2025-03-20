import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Delete, Edit, FilterList, Sort, AttachMoney } from '@mui/icons-material';
import api from '../utils/api';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash'
  });
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [stats, setStats] = useState({
    totalExpenses: 0,
    averageExpense: 0,
    highestExpense: 0
  });

  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (expenses.length > 0) {
      calculateStats();
    }
  }, [expenses]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch expenses. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      // Filter to only expense categories
      const expenseCategories = res.data.filter(cat => cat.type === 'expense');
      setCategories(expenseCategories);
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
        await api.put(`/expenses/${currentId}`, formData);
      } else {
        await api.post('/expenses', formData);
      }
      
      resetForm();
      fetchExpenses();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to save expense');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const handleEdit = (expense) => {
    setFormData({
      amount: expense.amount,
      description: expense.description,
      category: expense.category._id || expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      paymentMethod: expense.paymentMethod || 'cash'
    });
    setEditMode(true);
    setCurrentId(expense._id);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/expenses/${expenseToDelete}`);
      setExpenses(expenses.filter(expense => expense._id !== expenseToDelete));
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    } catch (err) {
      setError('Failed to delete expense');
      console.error(err);
    }
  };

  const openDeleteDialog = (id) => {
    setExpenseToDelete(id);
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
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avg = total / expenses.length;
    const highest = Math.max(...expenses.map(expense => expense.amount));
    
    setStats({
      totalExpenses: total.toFixed(2),
      averageExpense: avg.toFixed(2),
      highestExpense: highest.toFixed(2)
    });
  };

  const filteredExpenses = expenses
    .filter(expense => !filterCategory || (expense.category && expense.category._id === filterCategory))
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      if (dateRange.startDate && dateRange.endDate) {
        return expenseDate >= new Date(dateRange.startDate) && expenseDate <= new Date(dateRange.endDate);
      } else if (dateRange.startDate) {
        return expenseDate >= new Date(dateRange.startDate);
      } else if (dateRange.endDate) {
        return expenseDate <= new Date(dateRange.endDate);
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
          Expense Management
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
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Expenses
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${stats.totalExpenses}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Average Expense
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${stats.averageExpense}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Highest Expense
                    </Typography>
                    <Typography variant="h5" component="div">
                      ${stats.highestExpense}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Add/Edit Expense Form */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {editMode ? 'Edit Expense' : 'Add New Expense'}
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
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    label="Payment Method"
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="credit">Credit Card</MenuItem>
                    <MenuItem value="debit">Debit Card</MenuItem>
                    <MenuItem value="bank">Bank Transfer</MenuItem>
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
                    {editMode ? 'Update' : 'Add'} Expense
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

          {/* Expenses List */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Expenses List
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
              ) : filteredExpenses.length === 0 ? (
                <Alert severity="info">No expenses found. Add your first expense!</Alert>
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
                        <TableCell>Payment Method</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredExpenses.map((expense) => (
                        <TableRow key={expense._id}>
                          <TableCell>
                            {new Date(expense.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell>
                            {expense.category && (
                              <Chip 
                                label={expense.category.name || 'Uncategorized'} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            )}
                          </TableCell>
                          <TableCell>${expense.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {expense.paymentMethod ? expense.paymentMethod.charAt(0).toUpperCase() + expense.paymentMethod.slice(1) : 'Cash'}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleEdit(expense)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => openDeleteDialog(expense._id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
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
            Are you sure you want to delete this expense? This action cannot be undone.
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

export default Expenses; 