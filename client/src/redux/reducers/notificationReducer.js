const initialState = {
  notifications: [],
  notification: null,
  loading: true,
  error: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'GET_NOTIFICATIONS':
      return {
        ...state,
        notifications: payload,
        loading: false
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [payload, ...state.notifications],
        loading: false
      };
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification._id !== payload),
        loading: false
      };
    case 'PROCESS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notification => 
          notification._id === payload._id ? payload : notification
        ),
        loading: false
      };
    case 'NOTIFICATION_ERROR':
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
} 