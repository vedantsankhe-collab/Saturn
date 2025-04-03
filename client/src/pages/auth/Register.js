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
import { PersonAddOutlined } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, error, loading, isAuthenticated, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if (!formData.name.trim()) {
      setLocalError('Name is required');
      return false;
    }
    
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    
    if (!formData.email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    
    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
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
    
    console.log('Register form submitted with data:', {
      name: formData.name,
      email: formData.email,
      passwordLength: formData.password.length
    });
    
    // Validate form
    if (!validateForm()) {
      console.log('Form validation failed:', localError);
      return;
    }
    
    try {
      console.log('Attempting to register user...');
      // Create a new object without confirmPassword
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };
      
      await register(registrationData);
      console.log('Registration successful');
    } catch (err) {
      console.error('Registration form error:', err);
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
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonAddOutlined />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Create Account
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
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
            value={formData.name}
            onChange={handleChange}
            error={formSubmitted && !formData.name.trim()}
            helperText={formSubmitted && !formData.name.trim() ? 'Name is required' : ''}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            error={formSubmitted && formData.password.length < 6}
            helperText={formSubmitted && formData.password.length < 6 ? 'Password must be at least 6 characters' : ''}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={formSubmitted && formData.password !== formData.confirmPassword}
            helperText={formSubmitted && formData.password !== formData.confirmPassword ? 'Passwords do not match' : ''}
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
              'Register'
            )}
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Already have an account? Sign in
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 