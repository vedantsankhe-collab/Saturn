import { v4 as uuidv4 } from 'uuid';

// Action types
export const SET_ALERT = 'SET_ALERT';
export const REMOVE_ALERT = 'REMOVE_ALERT';

// Set alert
export const setAlert = (msg, severity, timeout = 5000) => dispatch => {
  const id = uuidv4();
  
  dispatch({
    type: SET_ALERT,
    payload: { msg, severity, id }
  });

  setTimeout(() => 
    dispatch({
      type: REMOVE_ALERT,
      payload: id
    }), 
    timeout
  );
};

// Remove alert
export const removeAlert = (id) => dispatch => {
  dispatch({
    type: REMOVE_ALERT,
    payload: id
  });
}; 