import { api } from '../../utils/api';

// Action Types
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';
export const LOGOUT = 'LOGOUT';
export const USER_LOADED = 'USER_LOADED';
export const AUTH_ERROR = 'AUTH_ERROR';
export const UPDATE_PROFILE_REQUEST = 'UPDATE_PROFILE_REQUEST';
export const UPDATE_PROFILE_SUCCESS = 'UPDATE_PROFILE_SUCCESS';
export const UPDATE_PROFILE_FAIL = 'UPDATE_PROFILE_FAIL';

// Load User
export const loadUser = () => async (dispatch) => {
  try {
    const res = await api.get('/auth');
    dispatch({
      type: USER_LOADED,
      payload: res.data
    });
    return res.data;
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
      payload: { msg: err.response?.data?.msg || 'Error loading user' }
    });
    throw err;
  }
};

// Register User
export const register = (formData) => async (dispatch) => {
  dispatch({ type: REGISTER_REQUEST });
  
  try {
    console.log('Register action: Attempting to register user:', formData.email);
    const res = await api.post('/auth/register', formData);
    console.log('Register action: Server response:', res.data);
    
    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    });
    
    // Load user data after successful registration
    await dispatch(loadUser());
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
    return res.data;
  } catch (err) {
    console.error('Register action error:', err);
    const errors = err.response?.data?.errors;
    
    dispatch({
      type: REGISTER_FAIL,
      payload: { 
        msg: err.response?.data?.msg || 'Registration failed',
        errors,
        error: err.message
      }
    });
    
    throw err;
  }
};

// Login User
export const login = (email, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  
  try {
    console.log('Login action: Attempting to login with email:', email);
    const res = await api.post('/auth/login', { email, password });
    console.log('Login action: Server response:', res.data);
    
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });
    
    // Load user data after successful login
    await dispatch(loadUser());
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
    return res.data;
  } catch (err) {
    console.error('Login action error:', err);
    
    dispatch({
      type: LOGIN_FAIL,
      payload: { 
        msg: err.response?.data?.msg || 'Authentication failed',
        status: err.response?.status,
        error: err.message
      }
    });
    
    throw err;
  }
};

// Logout
export const logout = () => (dispatch) => {
  dispatch({ type: LOGOUT });
  localStorage.removeItem('token');
  window.location.href = '/login';
};

// Update User Profile
export const updateProfile = (profileData) => async (dispatch) => {
  dispatch({ type: UPDATE_PROFILE_REQUEST });
  
  try {
    const res = await api.put('/auth/profile', profileData);
    
    dispatch({
      type: UPDATE_PROFILE_SUCCESS,
      payload: res.data
    });
    
    // Update the user data in the state
    await dispatch(loadUser());
    
    return res.data;
  } catch (err) {
    dispatch({
      type: UPDATE_PROFILE_FAIL,
      payload: { 
        msg: err.response?.data?.msg || 'Failed to update profile',
        status: err.response?.status,
        error: err.message
      }
    });
    
    throw err;
  }
}; 