const initialState = {
  investments: [],
  investment: null,
  loading: true,
  error: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'GET_INVESTMENTS':
      return {
        ...state,
        investments: payload,
        loading: false
      };
    case 'ADD_INVESTMENT':
      return {
        ...state,
        investments: [payload, ...state.investments],
        loading: false
      };
    case 'DELETE_INVESTMENT':
      return {
        ...state,
        investments: state.investments.filter(investment => investment._id !== payload),
        loading: false
      };
    case 'SET_CURRENT_INVESTMENT':
      return {
        ...state,
        investment: payload
      };
    case 'CLEAR_CURRENT_INVESTMENT':
      return {
        ...state,
        investment: null
      };
    case 'ADD_RECOMMENDATION':
      return {
        ...state,
        investments: state.investments.map(investment => 
          investment._id === payload.investment._id ? payload.investment : investment
        ),
        loading: false
      };
    case 'INVESTMENT_ERROR':
      return {
        ...state,
        error: payload,
        loading: false
      };
    default:
      return state;
  }
} 