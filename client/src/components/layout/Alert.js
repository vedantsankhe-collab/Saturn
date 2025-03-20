import React from 'react';
import { useSelector } from 'react-redux';
import { Alert as MuiAlert, Snackbar, Stack } from '@mui/material';

const Alert = () => {
  const alerts = useSelector(state => state.alerts);
  
  if (alerts !== null && alerts.length > 0) {
    return (
      <Stack sx={{ width: '100%', position: 'fixed', top: 70, left: 0, zIndex: 9999 }} spacing={2}>
        {alerts.map(alert => (
          <Snackbar 
            key={alert.id} 
            open={true} 
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <MuiAlert 
              elevation={6} 
              variant="filled" 
              severity={alert.severity}
              sx={{ width: '100%' }}
            >
              {alert.msg}
            </MuiAlert>
          </Snackbar>
        ))}
      </Stack>
    );
  }
  
  return null;
};

export default Alert; 