import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  MonetizationOn,
  ShoppingCart,
  Category,
  Notifications,
  TrendingUp,
  Palette,
  ExitToApp
} from '@mui/icons-material';
import { logout } from '../../redux/actions/authActions';

const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = React.useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
  };

  const authLinks = (
    <>
      <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Button
          color="inherit"
          component={RouterLink}
          to="/dashboard"
          startIcon={<Dashboard />}
        >
          Dashboard
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/expenses"
          startIcon={<ShoppingCart />}
        >
          Expenses
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/income"
          startIcon={<MonetizationOn />}
        >
          Income
        </Button>
        <Button
          color="inherit"
          component={RouterLink}
          to="/investments"
          startIcon={<TrendingUp />}
        >
          Investments
        </Button>
        <IconButton
          color="inherit"
          component={RouterLink}
          to="/notifications"
        >
          <Notifications />
        </IconButton>
        <IconButton
          edge="end"
          aria-label="account of current user"
          aria-haspopup="true"
          onClick={handleProfileMenuOpen}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
      </Box>
      <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
        <IconButton
          aria-label="show more"
          aria-haspopup="true"
          onClick={handleMobileMenuOpen}
          color="inherit"
        >
          <MenuIcon />
        </IconButton>
      </Box>
    </>
  );

  const guestLinks = (
    <>
      <Button color="inherit" component={RouterLink} to="/login">
        Login
      </Button>
      <Button color="inherit" component={RouterLink} to="/register">
        Register
      </Button>
    </>
  );

  const profileMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
        <Avatar sx={{ width: 24, height: 24, mr: 1 }} />
        {user && user.name}
      </MenuItem>
      <Divider />
      <MenuItem component={RouterLink} to="/categories" onClick={handleMenuClose}>
        <Category fontSize="small" sx={{ mr: 1 }} />
        Categories
      </MenuItem>
      <MenuItem component={RouterLink} to="/settings" onClick={handleMenuClose}>
        <Palette fontSize="small" sx={{ mr: 1 }} />
        Theme
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ExitToApp fontSize="small" sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  const mobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(mobileMenuAnchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem component={RouterLink} to="/dashboard" onClick={handleMenuClose}>
        <Dashboard fontSize="small" sx={{ mr: 1 }} />
        Dashboard
      </MenuItem>
      <MenuItem component={RouterLink} to="/expenses" onClick={handleMenuClose}>
        <ShoppingCart fontSize="small" sx={{ mr: 1 }} />
        Expenses
      </MenuItem>
      <MenuItem component={RouterLink} to="/income" onClick={handleMenuClose}>
        <MonetizationOn fontSize="small" sx={{ mr: 1 }} />
        Income
      </MenuItem>
      <MenuItem component={RouterLink} to="/investments" onClick={handleMenuClose}>
        <TrendingUp fontSize="small" sx={{ mr: 1 }} />
        Investments
      </MenuItem>
      <MenuItem component={RouterLink} to="/notifications" onClick={handleMenuClose}>
        <Notifications fontSize="small" sx={{ mr: 1 }} />
        Notifications
      </MenuItem>
      <Divider />
      <MenuItem component={RouterLink} to="/profile" onClick={handleMenuClose}>
        <AccountCircle fontSize="small" sx={{ mr: 1 }} />
        Profile
      </MenuItem>
      <MenuItem component={RouterLink} to="/categories" onClick={handleMenuClose}>
        <Category fontSize="small" sx={{ mr: 1 }} />
        Categories
      </MenuItem>
      <MenuItem component={RouterLink} to="/settings" onClick={handleMenuClose}>
        <Palette fontSize="small" sx={{ mr: 1 }} />
        Theme
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout}>
        <ExitToApp fontSize="small" sx={{ mr: 1 }} />
        Logout
      </MenuItem>
    </Menu>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img 
              src="/saturn-logo.svg" 
              alt="Saturn Logo" 
              style={{ height: '32px', marginRight: '10px' }} 
            />
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 'bold'
              }}
            >
              SATURN
            </Typography>
          </Box>
          {isAuthenticated ? authLinks : guestLinks}
        </Toolbar>
      </AppBar>
      {profileMenu}
      {mobileMenu}
    </>
  );
};

export default Navbar; 