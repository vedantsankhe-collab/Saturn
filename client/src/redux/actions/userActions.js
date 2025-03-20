import axios from 'axios';
import {
  UPDATE_USER_SETTINGS_REQUEST,
  UPDATE_USER_SETTINGS_SUCCESS,
  UPDATE_USER_SETTINGS_FAIL,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAIL,
  EXPORT_DATA_REQUEST,
  EXPORT_DATA_SUCCESS,
  EXPORT_DATA_FAIL,
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAIL,
  GET_USER_STATS_REQUEST,
  GET_USER_STATS_SUCCESS,
  GET_USER_STATS_FAIL,
} from '../constants/userConstants';
import { LOGOUT } from '../actions/authActions';
import { setAlert } from './alertActions';
import api from '../../utils/api';

// Update User Settings
export const updateUserSettings = (settings) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_USER_SETTINGS_REQUEST });

    const { data } = await api.put('/users/settings', settings);

    dispatch({
      type: UPDATE_USER_SETTINGS_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    dispatch({
      type: UPDATE_USER_SETTINGS_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
    throw error;
  }
};

// Change Password
export const changePassword = (passwordData) => async (dispatch) => {
  try {
    dispatch({ type: CHANGE_PASSWORD_REQUEST });

    const { data } = await api.put('/users/password', passwordData);

    dispatch({
      type: CHANGE_PASSWORD_SUCCESS,
      payload: data,
    });

    return data;
  } catch (error) {
    dispatch({
      type: CHANGE_PASSWORD_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
    throw error;
  }
};

// Export Data
export const exportData = () => async (dispatch) => {
  try {
    dispatch({ type: EXPORT_DATA_REQUEST });

    const { data } = await api.get('/users/export');

    dispatch({
      type: EXPORT_DATA_SUCCESS,
      payload: data,
    });

    dispatch(setAlert('Data exported successfully', 'success'));
    return data;
  } catch (error) {
    dispatch({
      type: EXPORT_DATA_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
    throw error;
  }
};

// Delete Account
export const deleteAccount = () => async (dispatch) => {
  try {
    dispatch({ type: DELETE_ACCOUNT_REQUEST });

    await api.delete('/users');

    dispatch({ type: DELETE_ACCOUNT_SUCCESS });
    
    // Logout the user after account deletion
    dispatch({ type: LOGOUT });
    
    dispatch(setAlert('Your account has been deleted', 'info'));
    
    // Redirect to login page handled by auth reducer LOGOUT action
  } catch (error) {
    dispatch({
      type: DELETE_ACCOUNT_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
    throw error;
  }
};

// Get User Statistics
export const getUserStats = () => async (dispatch) => {
  try {
    dispatch({ type: GET_USER_STATS_REQUEST });

    const [expensesRes, incomeRes, investmentsRes] = await Promise.all([
      api.get('/expenses/statistics'),
      api.get('/income/statistics'),
      api.get('/investments/statistics')
    ]);

    const stats = {
      totalExpenses: expensesRes.data.total || 0,
      totalIncome: incomeRes.data.total || 0,
      totalInvestments: investmentsRes.data.totalValue || 0
    };

    dispatch({
      type: GET_USER_STATS_SUCCESS,
      payload: stats,
    });

    return stats;
  } catch (error) {
    dispatch({
      type: GET_USER_STATS_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
    throw error;
  }
}; 