import { 
  UPDATE_PROFILE_REQUEST,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAIL,
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAIL,
  EXPORT_DATA_REQUEST,
  EXPORT_DATA_SUCCESS,
  EXPORT_DATA_FAIL,
  GET_USER_STATS_REQUEST,
  GET_USER_STATS_SUCCESS,
  GET_USER_STATS_FAIL
} from './types';
import { api } from '../../utils/api';

// Update User Profile
export const updateProfile = (userData) => async dispatch => {
  dispatch({ type: UPDATE_PROFILE_REQUEST });
  
  try {
    const res = await api.put('/api/users/profile', userData);
    
    dispatch({
      type: UPDATE_PROFILE_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: UPDATE_PROFILE_FAIL,
      payload: { 
        msg: err.response?.data?.msg || 'Failed to update profile',
        status: err.response?.status
      }
    });
    
    throw err;
  }
};

// Change Password
export const changePassword = (passwordData) => async dispatch => {
  dispatch({ type: CHANGE_PASSWORD_REQUEST });
  
  try {
    const res = await api.put('/api/users/password', passwordData);
    
    dispatch({
      type: CHANGE_PASSWORD_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: CHANGE_PASSWORD_FAIL,
      payload: { 
        msg: err.response?.data?.msg || 'Failed to change password',
        status: err.response?.status
      }
    });
    
    throw err;
  }
};

// Delete Account
export const deleteAccount = () => async dispatch => {
  dispatch({ type: DELETE_ACCOUNT_REQUEST });
  
  try {
    const res = await api.delete('/api/users/account');
    
    dispatch({
      type: DELETE_ACCOUNT_SUCCESS,
      payload: res.data
    });
    
    return res.data;
  } catch (err) {
    dispatch({
      type: DELETE_ACCOUNT_FAIL,
      payload: { 
        msg: err.response?.data?.msg || 'Failed to delete account',
        status: err.response?.status
      }
    });
    
    throw err;
  }
};

// Export User Data
export const exportUserData = () => async dispatch => {
  dispatch({ type: EXPORT_DATA_REQUEST });
  
  try {
    const promises = [
      api.get('/api/expenses'),
      api.get('/api/income'),
      api.get('/api/investments')
    ];
    
    const [expenses, income, investments] = await Promise.all(promises);
    
    const exportData = {
      expenses: expenses.data,
      income: income.data,
      investments: investments.data
    };
    
    dispatch({
      type: EXPORT_DATA_SUCCESS,
      payload: exportData
    });
    
    return exportData;
  } catch (err) {
    dispatch({
      type: EXPORT_DATA_FAIL,
      payload: { 
        msg: err.response?.data?.msg || 'Failed to export data',
        status: err.response?.status
      }
    });
    
    throw err;
  }
};

// Get User Statistics
export const getUserStats = () => async dispatch => {
  dispatch({ type: GET_USER_STATS_REQUEST });
  
  try {
    // Create mock statistics data since the API endpoints might not exist yet
    const mockStats = {
      totalExpenses: 45000,
      totalIncome: 85000,
      totalInvestments: 50000,
      netWorth: 90000,
      savingsRate: 47.05,
      expenseCategories: [
        { name: 'Food', amount: 15000 },
        { name: 'Rent', amount: 20000 },
        { name: 'Transportation', amount: 5000 },
        { name: 'Entertainment', amount: 5000 }
      ],
      incomeCategories: [
        { name: 'Salary', amount: 75000 },
        { name: 'Freelance', amount: 10000 }
      ],
      investmentPerformance: 8.5
    };
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    dispatch({
      type: GET_USER_STATS_SUCCESS,
      payload: mockStats
    });
    
    return mockStats;
  } catch (err) {
    console.error('Error fetching user stats:', err);
    dispatch({
      type: GET_USER_STATS_FAIL,
      payload: { 
        msg: err.response?.data?.msg || 'Failed to fetch user statistics',
        status: err.response?.status
      }
    });
    
    throw err;
  }
}; 