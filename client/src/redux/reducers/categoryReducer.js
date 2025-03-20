const initialState = {
  categories: [],
  category: null,
  loading: true,
  error: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'GET_CATEGORIES':
      return {
        ...state,
        categories: payload,
        loading: false
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [payload, ...state.categories],
        loading: false
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category._id !== payload),
        loading: false
      };
    case 'SET_CURRENT_CATEGORY':
      return {
        ...state,
        category: payload
      };
    case 'CLEAR_CURRENT_CATEGORY':
      return {
        ...state,
        category: null
      };
    case 'CATEGORY_ERROR':
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
} 