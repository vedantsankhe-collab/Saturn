import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
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

// Auth API
export const login = async (credentials) => {
  try {
    const response = await api.post('/api/auth/login', credentials);
    
    // Store token in localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login API error:', error.response?.data || error.message);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    
    // Store token in localStorage
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Register API error:', error.response?.data || error.message);
    throw error;
  }
};

export const logout = async () => {
  try {
    localStorage.removeItem('token');
    const response = await api.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout API error:', error.response?.data || error.message);
    throw error;
  }
};

// User Settings API
export const updateUser = async (userData) => {
  try {
    const response = await api.put('/api/users/profile', userData);
    return response.data;
  } catch (error) {
    console.error('Update user API error:', error.response?.data || error.message);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/api/users/password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Change password API error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete('/api/users/account');
    return response.data;
  } catch (error) {
    console.error('Delete account API error:', error.response?.data || error.message);
    throw error;
  }
};

// Make sure we export both as named and default for compatibility
export { api };
export default api; 