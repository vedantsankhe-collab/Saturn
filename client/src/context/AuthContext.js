import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../utils/api';
import { useNavigate } from 'react-router-dom';

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
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Parse the token to get user data (JWT format: header.payload.signature)
          try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            const decodedUser = JSON.parse(decoded);
            setUser(decodedUser);
            setIsAuthenticated(true);
          } catch (err) {
            console.error('Error parsing token:', err);
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Error loading user from token:', err);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
      }
    };

    loadUser();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiLogin({ email, password });
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setLoading(false);
      navigate('/dashboard');
      return data;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.msg || 'Invalid credentials');
      setLoading(false);
      throw err;
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRegister(userData);
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      setLoading(false);
      navigate('/dashboard');
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.msg || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      setLoading(true);
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