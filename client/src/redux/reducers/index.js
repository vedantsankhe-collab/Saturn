import { combineReducers } from 'redux';
import authReducer from './authReducer';
import expenseReducer from './expenseReducer';
import incomeReducer from './incomeReducer';
import categoryReducer from './categoryReducer';
import notificationReducer from './notificationReducer';
import investmentReducer from './investmentReducer';
import themeReducer from './themeReducer';
import alertReducer from './alertReducer';
import {
  userSettingsReducer,
  passwordChangeReducer,
  exportDataReducer,
  deleteAccountReducer,
  userStatsReducer
} from './userReducer';

export default combineReducers({
  auth: authReducer,
  expenses: expenseReducer,
  income: incomeReducer,
  categories: categoryReducer,
  notifications: notificationReducer,
  investments: investmentReducer,
  theme: themeReducer,
  userSettings: userSettingsReducer,
  passwordChange: passwordChangeReducer,
  exportData: exportDataReducer,
  deleteAccount: deleteAccountReducer,
  userStats: userStatsReducer,
  alerts: alertReducer
}); 