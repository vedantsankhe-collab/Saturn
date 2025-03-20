import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Box,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountCircle,
  Email,
  DateRange,
  AttachMoney,
  TrendingUp,
  Receipt,
  ShoppingBag,
  Notifications,
  Security,
  Badge
} from '@mui/icons-material';
import { updateProfile } from '../redux/actions/authActions';
import { getUserStats } from '../redux/actions/userActions';
import { Link } from 'react-router-dom';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { stats, loading: statsLoading } = useSelector(state => state.userStats);
  
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [accountCreated, setAccountCreated] = useState('');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    profession: user?.profession || '',
    phone: user?.phone || '',
    currency: user?.settings?.currency || 'INR'
  });
  
  useEffect(() => {
    // Fetch user stats
    dispatch(getUserStats());
    
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        profession: user.profession || '',
        phone: user.phone || '',
        currency: user.settings?.currency || 'INR'
      });
      
      // Format the account creation date
      const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
      const formattedDate = createdAt.toLocaleDateString('en-US', {
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
      
      setAccountCreated(formattedDate);
    }
  }, [dispatch, user]);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await dispatch(updateProfile(formData));
      setMessage({ 
        type: 'success', 
        text: 'Profile updated successfully!' 
      });
      setEditMode(false);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.msg || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setEditMode(false);
    // Reset form data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        profession: user.profession || '',
        phone: user.phone || '',
        currency: user.settings?.currency || 'INR'
      });
    }
    
    setMessage({ type: '', text: '' });
  };
  
  const StatCard = ({ icon, title, value, color }) => (
    <Card sx={{ height: '100%', borderTop: `4px solid ${color}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ bgcolor: color, mr: 1 }}>
            {icon}
          </Avatar>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        {statsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <Typography variant="h4" component="div" sx={{ mt: 2, fontWeight: 'bold' }}>
            {title === 'Account Created' ? value : `₹${value.toLocaleString()}`}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 2 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            {!editMode && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '120px', 
                  bgcolor: 'primary.main',
                  zIndex: 0
                }} 
              />
            )}
            
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                bgcolor: 'primary.main',
                border: '4px solid #fff',
                fontSize: '3rem',
                mb: 1,
                zIndex: 1,
                mt: editMode ? 0 : 3
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            
            {!editMode ? (
              <Box sx={{ textAlign: 'center', zIndex: 1, width: '100%' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {user?.name || 'User Name'}
                </Typography>
                
                {user?.profession && (
                  <Chip 
                    icon={<Badge fontSize="small" />} 
                    label={user.profession} 
                    variant="outlined" 
                    sx={{ mb: 2 }}
                  />
                )}
                
                {user?.bio && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {user.bio}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Email fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{user?.email || 'email@example.com'}</Typography>
                </Box>
                
                {user?.phone && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Phone: {user.phone}
                  </Typography>
                )}
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Edit Profile
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <AccountCircle sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  margin="normal"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                
                <TextField
                  label="Profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                
                <TextField
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  margin="normal"
                />
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Statistics */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Account Overview
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <StatCard 
                icon={<ShoppingBag />} 
                title="Total Expenses" 
                value={stats.totalExpenses || 0} 
                color="#FF6B6B" 
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <StatCard 
                icon={<AttachMoney />} 
                title="Total Income" 
                value={stats.totalIncome || 0} 
                color="#4ECDC4" 
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <StatCard 
                icon={<TrendingUp />} 
                title="Investments Value" 
                value={stats.totalInvestments || 0} 
                color="#FF630B" 
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <StatCard 
                icon={<DateRange />} 
                title="Account Created" 
                value={accountCreated} 
                color="#6A0572" 
              />
            </Grid>
          </Grid>
          
          <Typography variant="h5" sx={{ mt: 4, mb: 3, fontWeight: 'bold' }}>
            Quick Links
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                component={Link} 
                to="/settings"
                sx={{ 
                  height: '100%', 
                  transition: 'transform 0.2s', 
                  '&:hover': { 
                    transform: 'translateY(-5px)' 
                  },
                  textDecoration: 'none'
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.light' }}>
                      <Security />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">Security</Typography>
                      <Typography variant="body2" color="text.secondary">Change password</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                component={Link} 
                to="/settings"
                sx={{ 
                  height: '100%', 
                  transition: 'transform 0.2s', 
                  '&:hover': { 
                    transform: 'translateY(-5px)' 
                  },
                  textDecoration: 'none'
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'secondary.light' }}>
                      <Notifications />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">Notifications</Typography>
                      <Typography variant="body2" color="text.secondary">Manage alerts</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Card 
                component={Link} 
                to="/categories"
                sx={{ 
                  height: '100%', 
                  transition: 'transform 0.2s', 
                  '&:hover': { 
                    transform: 'translateY(-5px)' 
                  },
                  textDecoration: 'none'
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'warning.light' }}>
                      <Receipt />
                    </Avatar>
                    <Box>
                      <Typography variant="h6">Categories</Typography>
                      <Typography variant="body2" color="text.secondary">Manage categories</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 