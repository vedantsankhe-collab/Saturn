import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MoreIcon from '@mui/icons-material/MoreVert';
import Dashboard from '@mui/icons-material/Dashboard';
import MoneyOff from '@mui/icons-material/MoneyOff';
import AttachMoney from '@mui/icons-material/AttachMoney';
import Notifications from '@mui/icons-material/Notifications';
import Category from '@mui/icons-material/Category';
import Settings from '@mui/icons-material/Settings';
import Palette from '@mui/icons-material/Palette';
import { useAuth } from '../../context/AuthContext';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: 240,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: 240,
    boxSizing: 'border-box',
  },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  // Override media queries injected by theme.mixins.toolbar
  '@media all': {
    minHeight: 64,
  },
}));

const Logo = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  letterSpacing: '.1rem',
  textDecoration: 'none',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const { isAuthenticated, logout } = useAuth();

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem component={Link} to="/categories" onClick={handleMenuClose}>Categories</MenuItem>
      <MenuItem component={Link} to="/settings" onClick={handleMenuClose}>Settings</MenuItem>
      <MenuItem component={Link} to="/theme" onClick={handleMenuClose}>Theme</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const drawerItems = (
    <Box
      sx={{ width: 240 }}
      role="presentation"
      onClick={handleDrawerToggle}
      onKeyDown={handleDrawerToggle}
    >
      <List>
        <ListItem button component={Link} to="/dashboard">
          <ListItemIcon><Dashboard /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/expenses">
          <ListItemIcon><MoneyOff /></ListItemIcon>
          <ListItemText primary="Expenses" />
        </ListItem>
        <ListItem button component={Link} to="/income">
          <ListItemIcon><AttachMoney /></ListItemIcon>
          <ListItemText primary="Income" />
        </ListItem>
        <ListItem button component={Link} to="/notifications">
          <ListItemIcon><Notifications /></ListItemIcon>
          <ListItemText primary="Notifications" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/categories">
          <ListItemIcon><Category /></ListItemIcon>
          <ListItemText primary="Categories" />
        </ListItem>
        <ListItem button component={Link} to="/settings">
          <ListItemIcon><Settings /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem button component={Link} to="/theme">
          <ListItemIcon><Palette /></ListItemIcon>
          <ListItemText primary="Theme" />
        </ListItem>
      </List>
    </Box>
  );

  const authLinks = (
    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
      <Button color="inherit" component={Link} to="/dashboard">
        Dashboard
      </Button>
      <Button color="inherit" component={Link} to="/expenses">
        Expenses
      </Button>
      <Button color="inherit" component={Link} to="/income">
        Income
      </Button>
      <Button color="inherit" component={Link} to="/notifications">
        <Badge badgeContent={4} color="error">
          <Notifications />
        </Badge>
      </Button>
      <IconButton
        size="large"
        edge="end"
        aria-label="account of current user"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
    </Box>
  );

  const guestLinks = (
    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
      <Button color="inherit" component={Link} to="/login">
        Login
      </Button>
      <Button color="inherit" component={Link} to="/register">
        Register
      </Button>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <StyledToolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Logo
            variant="h6"
            component={Link}
            to="/"
            color="inherit"
            sx={{ 
              flexGrow: 1,
              textDecoration: 'none',
              display: { xs: 'none', sm: 'block' } 
            }}
          >
            SATURN
          </Logo>
          {isAuthenticated ? authLinks : guestLinks}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </StyledToolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      <StyledDrawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
      >
        {drawerItems}
      </StyledDrawer>
    </Box>
  );
};

export default Navbar; 