import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import api from '../utils/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentTransactions: [],
    upcomingBills: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch income data
        const incomeRes = await api.get('/income');
        const incomes = incomeRes.data;

        // Fetch expense data
        const expenseRes = await api.get('/expenses');
        const expenses = expenseRes.data;

        // Calculate totals
        const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const balance = totalIncome - totalExpenses;

        // Get recent transactions (combine and sort income and expenses)
        const allTransactions = [
          ...incomes.map(income => ({
            id: income._id,
            description: income.description,
            amount: income.amount,
            type: 'income',
            date: income.date,
            category: income.category?.name || 'Uncategorized'
          })),
          ...expenses.map(expense => ({
            id: expense._id,
            description: expense.description,
            amount: expense.amount,
            type: 'expense',
            date: expense.date,
            category: expense.category?.name || 'Uncategorized'
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5); // Get only the 5 most recent transactions

        // Get upcoming bills (expenses from the current month)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const upcomingBills = expenses
          .filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear &&
                   expenseDate > now;
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5); // Get only the 5 upcoming bills

        setSummary({
          totalIncome,
          totalExpenses,
          balance,
          recentTransactions: allTransactions,
          upcomingBills: upcomingBills
        });
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              bgcolor: 'success.light',
              color: 'white'
            }}
          >
            <Box display="flex" alignItems="center">
              <AccountBalanceIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Current Balance
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mt: 2 }}>
              ${summary.balance.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              bgcolor: 'primary.light'
            }}
          >
            <Box display="flex" alignItems="center">
              <TrendingUpIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Total Income
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mt: 2 }}>
              ${summary.totalIncome.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              bgcolor: 'error.light',
              color: 'white'
            }}
          >
            <Box display="flex" alignItems="center">
              <TrendingDownIcon sx={{ mr: 1 }} />
              <Typography variant="h6" component="div">
                Total Expenses
              </Typography>
            </Box>
            <Typography variant="h4" component="div" sx={{ mt: 2 }}>
              ${summary.totalExpenses.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Recent Transactions and Upcoming Bills */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader 
              title="Recent Transactions" 
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {summary.recentTransactions.map(transaction => (
                  <ListItem key={transaction.id} divider>
                    <ListItemText
                      primary={transaction.description}
                      secondary={`${new Date(transaction.date).toLocaleDateString()} - ${transaction.category}`}
                    />
                    <Typography 
                      variant="body1" 
                      color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                    >
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader 
              title="Upcoming Bills" 
              action={
                <Button size="small" color="primary">
                  View All
                </Button>
              }
            />
            <Divider />
            <CardContent>
              <List>
                {summary.upcomingBills.map(bill => (
                  <ListItem key={bill._id} divider>
                    <ListItemText
                      primary={bill.description}
                      secondary={`Due: ${new Date(bill.date).toLocaleDateString()} - ${bill.category?.name || 'Uncategorized'}`}
                    />
                    <Typography variant="body1" color="error.main">
                      -${bill.amount.toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 