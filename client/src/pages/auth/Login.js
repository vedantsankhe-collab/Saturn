import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, error, loading, isAuthenticated, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate('/dashboard');
    }
    
    // Clear any previous errors
    return () => {
      if (clearError) clearError();
    };
  }, [isAuthenticated, navigate, clearError]);

  const validateForm = () => {
    // Basic validation
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password) {
      setLocalError('Password is required');
      return false;
    }
    
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setLocalError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    console.log('Login form submitted with email:', formData.email);
    
    // Validate form
    if (!validateForm()) {
      console.log('Form validation failed:', localError);
      return;
    }
    
    try {
      console.log('Attempting to login user...');
      await login(formData.email, formData.password);
      console.log('Login successful');
    } catch (err) {
      console.error('Login form error:', err);
      // If there's a network error, set a local error
      if (err.message === 'Network Error') {
        setLocalError('Cannot connect to server. Please check your internet connection.');
      }
    } finally {
      setFormSubmitted(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 8, 
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Sign in
        </Typography>
        
        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {localError || error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={formSubmitted && (!formData.email.trim() || !formData.email.includes('@'))}
            helperText={
              formSubmitted && !formData.email.trim() 
                ? 'Email is required' 
                : formSubmitted && !formData.email.includes('@') 
                  ? 'Please enter a valid email address' 
                  : ''
            }
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={formSubmitted && !formData.password}
            helperText={formSubmitted && !formData.password ? 'Password is required' : ''}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Sign In'
            )}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Don't have an account? Sign up
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 