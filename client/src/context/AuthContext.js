import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const navigate = useNavigate();

  // Load user from token when component mounts
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Token found in localStorage, attempting to load user');
          
          try {
            // Make API call to get user data instead of parsing token
            const response = await api.get('/auth');
            setUser(response.data);
            setIsAuthenticated(true);
            console.log('User loaded successfully', response.data);
          } catch (err) {
            console.error('Error loading user from API:', err);
            // If API call fails, clear auth state
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            setError('Session expired. Please login again.');
          }
        } else {
          console.log('No token found, user not authenticated');
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error in loadUser:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadUser();
    }
  }, [token]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    console.log('Login attempt with email:', email);

    try {
      console.log('Making login API call');
      const data = await apiLogin({ email, password });
      console.log('Login successful, data received:', data);
      
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      
      if (data.user) {
        setUser(data.user);
      } else {
        console.log('No user data in response, will fetch separately');
        // Make a separate call to get user data
        try {
          const userResponse = await api.get('/auth');
          setUser(userResponse.data);
        } catch (userErr) {
          console.error('Error getting user data after login:', userErr);
        }
      }
      
      setIsAuthenticated(true);
      setLoading(false);
      navigate('/dashboard');
      return data;
    } catch (err) {
      console.error('Login error details:', err);
      setError(err.response?.data?.msg || 'Login failed. Please check your credentials and try again.');
      setLoading(false);
      throw err;
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    console.log('Registration attempt with data:', userData);

    try {
      console.log('Making register API call');
      const data = await apiRegister(userData);
      console.log('Registration successful, data received:', data);
      
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', data.token);
      setToken(data.token);
      
      if (data.user) {
        setUser(data.user);
      } else {
        console.log('No user data in response, will fetch separately');
        // Make a separate call to get user data
        try {
          const userResponse = await api.get('/auth');
          setUser(userResponse.data);
        } catch (userErr) {
          console.error('Error getting user data after registration:', userErr);
        }
      }
      
      setIsAuthenticated(true);
      setLoading(false);
      navigate('/dashboard');
      return data;
    } catch (err) {
      console.error('Registration error details:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.data?.msg) {
        errorMessage = err.response.data.msg;
      } else if (err.response?.data?.errors) {
        // Handle validation errors
        errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
      }
      
      setError(errorMessage);
      setLoading(false);
      throw err;
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      setLoading(true);
      console.log('Logout called');
      await apiLogout();
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout: handleLogout,
        clearError: () => setError(null)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext; 