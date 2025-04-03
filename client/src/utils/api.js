import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production'
    ? '/api'  // In production, use /api prefix
    : 'http://localhost:5001/api', // In development, use the local server
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
  config => {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    console.error('Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
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
    console.log('Register API call with data:', userData);
    const res = await api.post('/auth/register', userData);
    console.log('Register API response:', res.data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      console.log('Token stored in localStorage');
    }
    return res.data;
  } catch (err) {
    console.error('Register API error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    throw err;
  }
};

// API function to login a user
export const login = async (userData) => {
  try {
    console.log('Login API call with data:', userData);
    const res = await api.post('/auth/login', userData);
    console.log('Login API response:', res.data);
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      console.log('Token stored in localStorage');
    }
    return res.data;
  } catch (err) {
    console.error('Login API error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    throw err;
  }
};

// API function to logout
export const logout = () => {
  console.log('Logout called');
  localStorage.removeItem('token');
  window.location.href = '/login';
};

// API function to update user profile
export const updateUser = async (userData) => {
  try {
    console.log('Update user API call with data:', userData);
    const res = await api.put('/auth/profile', userData);
    console.log('Update user API response:', res.data);
    return res.data;
  } catch (err) {
    console.error('Update user API error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    throw err;
  }
};

// API function to change password
export const changePassword = async (passwordData) => {
  try {
    console.log('Change password API call');
    const res = await api.put('/auth/password', passwordData);
    console.log('Change password API response:', res.data);
    return res.data;
  } catch (err) {
    console.error('Change password API error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    throw err;
  }
};

// API function to delete account
export const deleteAccount = async () => {
  try {
    console.log('Delete account API call');
    const res = await api.delete('/auth/account');
    console.log('Delete account API response:', res.data);
    localStorage.removeItem('token');
    window.location.href = '/login';
    return res.data;
  } catch (err) {
    console.error('Delete account API error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
    throw err;
  }
};

// Export both named and default
export { api };
export default api; 