import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const Navigation = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogout = () => {
    // Implement logout functionality
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          SATURN
        </Typography>
        {isAuthenticated && (
          <>
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>
            <Button color="inherit" component={Link} to="/investments">
              Investments
            </Button>
            <Button color="inherit" component={Link} to="/expenses">
              Expenses
            </Button>
            <Button color="inherit" component={Link} to="/income">
              Income
            </Button>
            <Button color="inherit" component={Link} to="/settings">
              Settings
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 