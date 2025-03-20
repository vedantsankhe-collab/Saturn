import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Dashboard,
  MonetizationOn,
  ShoppingCart,
  Category,
  Notifications,
  TrendingUp,
  Palette,
  Security
} from '@mui/icons-material';

const Home = () => {
  const { isAuthenticated } = useSelector(state => state.auth);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 2,
            borderRadius: 2,
            bgcolor: 'background.paper',
            mb: 4
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <img 
              src="/saturn-logo.svg" 
              alt="Saturn Logo" 
              style={{ height: '64px', marginRight: '16px' }} 
            />
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0 }}
            >
              SATURN
            </Typography>
          </Box>
          <Typography variant="h5" color="text.secondary" paragraph>
            Take control of your finances with our comprehensive tracking and management tools
          </Typography>
          <Box sx={{ mt: 4 }}>
            {isAuthenticated ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={RouterLink}
                to="/dashboard"
                sx={{ px: 4, py: 1.5 }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{ px: 4, py: 1.5, mr: 2 }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  component={RouterLink}
                  to="/login"
                  sx={{ px: 4, py: 1.5 }}
                >
                  Login
                </Button>
              </Box>
            )}
          </Box>
        </Box>

        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold' }}
        >
          Features
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                Track Expenses & Income
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <ShoppingCart color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Categorize expenses" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <MonetizationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Record income sources" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Category color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Customizable categories" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                Visualize Your Finances
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Dashboard color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Interactive dashboard" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Investment tracking" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Palette color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Customizable theme" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2
              }}
            >
              <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                Smart Features
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Notifications color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Automatic expense detection" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="AI investment strategies" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Security color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Secure authentication" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home; 