const initialState = {
  incomes: [],
  income: null,
  loading: true,
  error: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'GET_INCOMES':
      return {
        ...state,
        incomes: payload,
        loading: false
      };
    case 'ADD_INCOME':
      return {
        ...state,
        incomes: [payload, ...state.incomes],
        loading: false
      };
    case 'DELETE_INCOME':
      return {
        ...state,
        incomes: state.incomes.filter(income => income._id !== payload),
        loading: false
      };
    case 'SET_CURRENT_INCOME':
      return {
        ...state,
        income: payload
      };
    case 'CLEAR_CURRENT_INCOME':
      return {
        ...state,
        income: null
      };
    case 'INCOME_ERROR':
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
} 