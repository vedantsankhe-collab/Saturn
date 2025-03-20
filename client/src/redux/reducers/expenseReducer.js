const initialState = {
  expenses: [],
  expense: null,
  loading: true,
  error: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'GET_EXPENSES':
      return {
        ...state,
        expenses: payload,
        loading: false
      };
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [payload, ...state.expenses],
        loading: false
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense._id !== payload),
        loading: false
      };
    case 'SET_CURRENT_EXPENSE':
      return {
        ...state,
        expense: payload
      };
    case 'CLEAR_CURRENT_EXPENSE':
      return {
        ...state,
        expense: null
      };
    case 'EXPENSE_ERROR':
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
} 