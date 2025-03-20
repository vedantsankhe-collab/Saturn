import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Devices as DevicesIcon,
  AccountCircle as AccountCircleIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowForward as ArrowForwardIcon,
  Block as BlockIcon,
  CloudDownload as CloudDownloadIcon,
  Email as EmailIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { 
  updateUserSettings, 
  changePassword, 
  exportData,
  deleteAccount 
} from '../redux/actions/userActions';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { loading: settingsLoading } = useSelector(state => state.userSettings);
  const { loading: passwordLoading } = useSelector(state => state.passwordChange);
  const { loading: exportLoading } = useSelector(state => state.exportData);
  const { loading: deleteLoading } = useSelector(state => state.deleteAccount);
  
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    theme: user?.settings?.theme || 'light',
    currency: user?.settings?.currency || 'INR',
    language: user?.settings?.language || 'en',
    notifications: {
      email: user?.settings?.notifications?.email || false,
      push: user?.settings?.notifications?.push || false,
      budgetAlerts: user?.settings?.notifications?.budgetAlerts || true,
      weeklyReports: user?.settings?.notifications?.weeklyReports || false
    },
    privacy: {
      shareData: user?.settings?.privacy?.shareData || false,
      saveHistory: user?.settings?.privacy?.saveHistory || true
    },
    display: {
      compactView: user?.settings?.display?.compactView || false,
      showGraphs: user?.settings?.display?.showGraphs || true,
      decimalPlaces: user?.settings?.display?.decimalPlaces || 2
    }
  });
  
  useEffect(() => {
    // Update settings when user data changes
    if (user?.settings) {
      setSettings({
        theme: user.settings.theme || 'light',
        currency: user.settings.currency || 'INR',
        language: user.settings.language || 'en',
        notifications: {
          email: user.settings.notifications?.email || false,
          push: user.settings.notifications?.push || false,
          budgetAlerts: user.settings.notifications?.budgetAlerts || true,
          weeklyReports: user.settings.notifications?.weeklyReports || false
        },
        privacy: {
          shareData: user.settings.privacy?.shareData || false,
          saveHistory: user.settings.privacy?.saveHistory || true
        },
        display: {
          compactView: user.settings.display?.compactView || false,
          showGraphs: user.settings.display?.showGraphs || true,
          decimalPlaces: user.settings.display?.decimalPlaces || 2
        }
      });
    }
  }, [user]);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleSettingChange = (section, key, value) => {
    if (section) {
      setSettings({
        ...settings,
        [section]: {
          ...settings[section],
          [key]: value
        }
      });
    } else {
      setSettings({
        ...settings,
        [key]: value
      });
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      await dispatch(updateUserSettings(settings));
      setSnackbar({
        open: true,
        message: 'Settings updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to update settings',
        severity: 'error'
      });
    }
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };
  
  const handleChangePassword = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setSnackbar({
          open: true,
          message: 'New passwords do not match',
          severity: 'error'
        });
        return;
      }
      
      await dispatch(changePassword(passwordData));
      setSnackbar({
        open: true,
        message: 'Password changed successfully',
        severity: 'success'
      });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to change password',
        severity: 'error'
      });
    }
  };
  
  const handleExportData = async () => {
    try {
      await dispatch(exportData());
      setSnackbar({
        open: true,
        message: 'Data exported successfully. Check your email.',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to export data',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccount());
      // Redirect will happen automatically through redux action
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete account',
        severity: 'error'
      });
    }
  };
  
  const handleOpenDialog = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          sx={{ ml: 'auto' }}
          onClick={handleSaveSettings}
          disabled={settingsLoading}
        >
          {settingsLoading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ position: 'sticky', top: 20 }}>
            <Tabs
              orientation="vertical"
              variant="scrollable"
              value={activeTab}
              onChange={handleTabChange}
              sx={{ borderRight: 1, borderColor: 'divider' }}
            >
              <Tab 
                label="Appearance" 
                icon={<PaletteIcon />} 
                iconPosition="start"
                sx={{ justifyContent: 'flex-start', minHeight: 64 }}
              />
              <Tab 
                label="Notifications" 
                icon={<NotificationsIcon />} 
                iconPosition="start"
                sx={{ justifyContent: 'flex-start', minHeight: 64 }}
              />
              <Tab 
                label="Account Security" 
                icon={<SecurityIcon />} 
                iconPosition="start"
                sx={{ justifyContent: 'flex-start', minHeight: 64 }}
              />
              <Tab 
                label="Privacy" 
                icon={<VisibilityOffIcon />} 
                iconPosition="start"
                sx={{ justifyContent: 'flex-start', minHeight: 64 }}
              />
              <Tab 
                label="Data Management" 
                icon={<CloudDownloadIcon />} 
                iconPosition="start"
                sx={{ justifyContent: 'flex-start', minHeight: 64 }}
              />
            </Tabs>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            {/* Appearance Settings */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Appearance and Display Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {settings.theme === 'dark' ? (
                            <DarkModeIcon sx={{ mr: 1 }} />
                          ) : (
                            <LightModeIcon sx={{ mr: 1 }} />
                          )}
                          <Typography variant="h6">Theme</Typography>
                        </Box>
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.theme === 'dark'}
                              onChange={(e) => handleSettingChange(null, 'theme', e.target.checked ? 'dark' : 'light')}
                              color="primary"
                            />
                          }
                          label={settings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LanguageIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">Language</Typography>
                        </Box>
                        
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Language</InputLabel>
                          <Select
                            value={settings.language}
                            onChange={(e) => handleSettingChange(null, 'language', e.target.value)}
                            label="Language"
                          >
                            <MenuItem value="en">English</MenuItem>
                            <MenuItem value="hi">Hindi</MenuItem>
                            <MenuItem value="es">Spanish</MenuItem>
                            <MenuItem value="fr">French</MenuItem>
                          </Select>
                        </FormControl>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <ArrowForwardIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">Currency</Typography>
                        </Box>
                        
                        <FormControl fullWidth variant="outlined">
                          <InputLabel>Currency</InputLabel>
                          <Select
                            value={settings.currency}
                            onChange={(e) => handleSettingChange(null, 'currency', e.target.value)}
                            label="Currency"
                          >
                            <MenuItem value="INR">Indian Rupee (₹)</MenuItem>
                            <MenuItem value="USD">US Dollar ($)</MenuItem>
                            <MenuItem value="EUR">Euro (€)</MenuItem>
                            <MenuItem value="GBP">British Pound (£)</MenuItem>
                          </Select>
                        </FormControl>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <DevicesIcon sx={{ mr: 1 }} />
                          <Typography variant="h6">Display Options</Typography>
                        </Box>
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.display.compactView}
                              onChange={(e) => handleSettingChange('display', 'compactView', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Compact View"
                        />
                        
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.display.showGraphs}
                              onChange={(e) => handleSettingChange('display', 'showGraphs', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Show Graphs"
                        />
                        
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            Decimal Places
                          </Typography>
                          <Select
                            value={settings.display.decimalPlaces}
                            onChange={(e) => handleSettingChange('display', 'decimalPlaces', e.target.value)}
                            fullWidth
                            size="small"
                          >
                            <MenuItem value={0}>0</MenuItem>
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={2}>2</MenuItem>
                            <MenuItem value={3}>3</MenuItem>
                          </Select>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Notification Settings */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Notification Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email Notifications" 
                      secondary="Receive important updates via email"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications.email}
                        onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <NotificationsIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Push Notifications" 
                      secondary="Receive notifications on your device"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications.push}
                        onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Badge color="error" variant="dot">
                        <NotificationsIcon />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary="Budget Alerts" 
                      secondary="Get notified when you're approaching budget limits"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications.budgetAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'budgetAlerts', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <DownloadIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Weekly Reports" 
                      secondary="Receive weekly summary of your finances"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.notifications.weeklyReports}
                        onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Box>
            )}
            
            {/* Security Settings */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Account Security
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Password
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          It's a good idea to use a strong password that you're not using elsewhere
                        </Typography>
                        <Button 
                          variant="outlined" 
                          startIcon={<SecurityIcon />}
                          onClick={() => handleOpenDialog('password')}
                        >
                          Change Password
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ bgcolor: 'error.light' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="error">
                          Danger Zone
                        </Typography>
                        <Typography variant="body2" paragraph>
                          Once you delete your account, there is no going back. Please be certain.
                        </Typography>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          startIcon={<DeleteIcon />}
                          onClick={() => handleOpenDialog('delete')}
                        >
                          Delete Account
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {/* Privacy Settings */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Privacy Settings
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <BlockIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Anonymous Usage Data" 
                      secondary="Share anonymous usage data to help improve the app"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.privacy.shareData}
                        onChange={(e) => handleSettingChange('privacy', 'shareData', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  
                  <Divider variant="inset" component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <VisibilityIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Search History" 
                      secondary="Save your search history for better recommendations"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        edge="end"
                        checked={settings.privacy.saveHistory}
                        onChange={(e) => handleSettingChange('privacy', 'saveHistory', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </Box>
            )}
            
            {/* Data Management */}
            {activeTab === 4 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Data Management
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Export Your Data
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          Download a copy of your SATURN data, including transactions, investments, and budgets
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          startIcon={<CloudDownloadIcon />}
                          onClick={handleExportData}
                          sx={{ ml: 1, mb: 1 }}
                        >
                          Export Data
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Dialog for Password Change */}
      <Dialog open={openDialog && dialogType === 'password'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Please enter your current password and a new password.
          </DialogContentText>
          
          <TextField
            margin="normal"
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            fullWidth
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                    {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            margin="normal"
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            fullWidth
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                    {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            margin="normal"
            label="Confirm New Password"
            type={showNewPassword ? 'text' : 'password'}
            fullWidth
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
            helperText={
              passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== '' 
                ? 'Passwords do not match' 
                : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained" 
            color="primary"
            disabled={
              !passwordData.currentPassword || 
              !passwordData.newPassword || 
              passwordData.newPassword !== passwordData.confirmPassword
            }
          >
            Update Password
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog for Account Deletion */}
      <Dialog open={openDialog && dialogType === 'delete'} onClose={handleCloseDialog}>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Your Account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} autoFocus>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" variant="contained">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 