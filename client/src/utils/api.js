import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? '/api'  // In production, requests go to /api which will be handled by Vercel rewrites
    : 'http://localhost:5001', // In development, use the local server
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API function to register a user
export const register = async (userData) => {
  try {
    const res = await api.post('/api/users/register', userData);
    return res.data;
  } catch (err) {
    console.error('Register error:', err.response?.data || err.message);
    throw err;
  }
};

// API function to login a user
export const login = async (userData) => {
  try {
    const res = await api.post('/api/users/login', userData);
    return res.data;
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
    throw err;
  }
};

// API function to logout (just for completeness, the actual logout happens on the client)
export const logout = () => {
  localStorage.removeItem('token');
};

// API function to update user profile
export const updateUser = async (userData) => {
  try {
    const res = await api.put('/api/users/profile', userData);
    return res.data;
  } catch (err) {
    console.error('Update user error:', err.response?.data || err.message);
    throw err;
  }
};

// API function to change password
export const changePassword = async (passwordData) => {
  try {
    const res = await api.put('/api/users/password', passwordData);
    return res.data;
  } catch (err) {
    console.error('Change password error:', err.response?.data || err.message);
    throw err;
  }
};

// API function to delete account
export const deleteAccount = async () => {
  try {
    const res = await api.delete('/api/users/account');
    return res.data;
  } catch (err) {
    console.error('Delete account error:', err.response?.data || err.message);
    throw err;
  }
};

// Export both named and default
export { api };
export default api; 