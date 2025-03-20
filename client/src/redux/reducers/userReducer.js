import {
  UPDATE_USER_SETTINGS_REQUEST,
  UPDATE_USER_SETTINGS_SUCCESS,
  UPDATE_USER_SETTINGS_FAIL,
  UPDATE_USER_SETTINGS_RESET,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAIL,
  CHANGE_PASSWORD_RESET,
  EXPORT_DATA_REQUEST,
  EXPORT_DATA_SUCCESS,
  EXPORT_DATA_FAIL,
  EXPORT_DATA_RESET,
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_SUCCESS,
  DELETE_ACCOUNT_FAIL,
  GET_USER_STATS_REQUEST,
  GET_USER_STATS_SUCCESS,
  GET_USER_STATS_FAIL,
  GET_USER_STATS_RESET
} from '../constants/userConstants';

// User settings reducer
export const userSettingsReducer = (state = { loading: false }, action) => {
  switch (action.type) {
    case UPDATE_USER_SETTINGS_REQUEST:
      return { loading: true };
    case UPDATE_USER_SETTINGS_SUCCESS:
      return { loading: false, success: true, userSettings: action.payload };
    case UPDATE_USER_SETTINGS_FAIL:
      return { loading: false, error: action.payload };
    case UPDATE_USER_SETTINGS_RESET:
      return { loading: false };
    default:
      return state;
  }
};

// Password change reducer
export const passwordChangeReducer = (state = {}, action) => {
  switch (action.type) {
    case CHANGE_PASSWORD_REQUEST:
      return { loading: true };
    case CHANGE_PASSWORD_SUCCESS:
      return { loading: false, success: true };
    case CHANGE_PASSWORD_FAIL:
      return { loading: false, error: action.payload };
    case CHANGE_PASSWORD_RESET:
      return {};
    default:
      return state;
  }
};

// Export data reducer
export const exportDataReducer = (state = {}, action) => {
  switch (action.type) {
    case EXPORT_DATA_REQUEST:
      return { loading: true };
    case EXPORT_DATA_SUCCESS:
      return { loading: false, success: true, data: action.payload };
    case EXPORT_DATA_FAIL:
      return { loading: false, error: action.payload };
    case EXPORT_DATA_RESET:
      return {};
    default:
      return state;
  }
};

// Delete account reducer
export const deleteAccountReducer = (state = {}, action) => {
  switch (action.type) {
    case DELETE_ACCOUNT_REQUEST:
      return { loading: true };
    case DELETE_ACCOUNT_SUCCESS:
      return { loading: false, success: true };
    case DELETE_ACCOUNT_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

// User stats reducer
export const userStatsReducer = (state = { stats: {} }, action) => {
  switch (action.type) {
    case GET_USER_STATS_REQUEST:
      return { ...state, loading: true };
    case GET_USER_STATS_SUCCESS:
      return { loading: false, stats: action.payload };
    case GET_USER_STATS_FAIL:
      return { loading: false, error: action.payload };
    case GET_USER_STATS_RESET:
      return { stats: {} };
    default:
      return state;
  }
}; 