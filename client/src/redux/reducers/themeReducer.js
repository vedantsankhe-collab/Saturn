const initialState = {
  theme: 'green-black',
  loading: false,
  error: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: payload,
        loading: false
      };
    case 'THEME_ERROR':
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
} 