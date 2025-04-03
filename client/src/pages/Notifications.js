import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Divider,
  IconButton,
  Card,
  CardContent,
  Chip,
  Badge,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  CelebrationOutlined,
  Clear,
  CheckCircle,
  InfoOutlined,
  TimerOutlined
} from '@mui/icons-material';
import { format, isToday, isPast, addDays } from 'date-fns';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Notifications = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    // Mock data for notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'milestone',
        title: 'Savings Milestone Reached!',
        message: 'Congratulations! You have saved your first ₹1,000. Keep it up!',
        date: new Date(),
        read: false,
        amount: 1000
      },
      {
        id: 2,
        type: 'reminder',
        title: 'Netflix Subscription Due',
        message: 'Your Netflix subscription of ₹499 is due in 2 days.',
        date: addDays(new Date(), 2),
        read: true,
        amount: 499,
        category: 'Entertainment'
      },
      {
        id: 3,
        type: 'reminder',
        title: 'Rent Payment Due',
        message: 'Your monthly rent payment of ₹15,000 is due tomorrow.',
        date: addDays(new Date(), 1),
        read: false,
        amount: 15000,
        category: 'Housing'
      },
      {
        id: 4,
        type: 'milestone',
        title: 'Savings Milestone Reached!',
        message: 'Amazing progress! You have saved ₹10,000. You are on your way to financial freedom!',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        read: true,
        amount: 10000
      },
      {
        id: 5,
        type: 'system',
        title: 'Profile Updated',
        message: 'Your profile information has been successfully updated.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        read: false
      }
    ];

    setNotifications(mockNotifications);
    setMilestones(mockNotifications.filter(notif => notif.type === 'milestone'));
    setReminders(mockNotifications.filter(notif => notif.type === 'reminder'));
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    
    setMilestones(milestones.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    
    setReminders(reminders.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleDismiss = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    setMilestones(milestones.filter(notif => notif.id !== id));
    setReminders(reminders.filter(notif => notif.id !== id));
  };

  const renderNotificationList = (notificationList) => {
    if (notificationList.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <InfoOutlined sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No notifications to display
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {notificationList.map((notification) => {
          const isPastDue = notification.type === 'reminder' && isPast(notification.date) && !isToday(notification.date);
          const isDueToday = notification.type === 'reminder' && isToday(notification.date);
          
          return (
            <ListItem 
              key={notification.id}
              alignItems="flex-start"
              sx={{ 
                mb: 1, 
                bgcolor: notification.read ? 'background.paper' : 'action.hover',
                borderRadius: 1
              }}
            >
              <ListItemAvatar>
                <Avatar 
                  sx={{ 
                    bgcolor: notification.type === 'milestone' 
                      ? 'success.main' 
                      : (isPastDue ? 'error.main' : (isDueToday ? 'warning.main' : 'primary.main')) 
                  }}
                >
                  {notification.type === 'milestone' && <CelebrationOutlined />}
                  {notification.type === 'reminder' && <TimerOutlined />}
                  {notification.type === 'system' && <InfoOutlined />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: !notification.read ? 'bold' : 'normal' }}>
                      {notification.title}
                    </Typography>
                    {!notification.read && (
                      <Chip 
                        label="New" 
                        size="small" 
                        color="primary" 
                        sx={{ ml: 1, height: 20 }} 
                      />
                    )}
                    {isPastDue && (
                      <Chip 
                        label="Past Due" 
                        size="small" 
                        color="error" 
                        sx={{ ml: 1, height: 20 }} 
                      />
                    )}
                    {isDueToday && (
                      <Chip 
                        label="Due Today" 
                        size="small" 
                        color="warning" 
                        sx={{ ml: 1, height: 20 }} 
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {notification.message}
                    </Typography>
                    {notification.amount && (
                      <Typography variant="body2" sx={{ mt: 1, color: notification.type === 'milestone' ? 'success.main' : 'text.primary' }}>
                        Amount: ₹{notification.amount.toLocaleString()}
                      </Typography>
                    )}
                    {notification.category && (
                      <Chip 
                        label={notification.category} 
                        size="small" 
                        sx={{ mt: 1, mr: 1 }} 
                      />
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {format(notification.date, 'PP')}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <Box>
                  {!notification.read && (
                    <IconButton 
                      edge="end" 
                      aria-label="mark as read"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <CheckCircle color="primary" />
                    </IconButton>
                  )}
                  <IconButton 
                    edge="end" 
                    aria-label="dismiss"
                    onClick={() => handleDismiss(notification.id)}
                    sx={{ ml: 1 }}
                  >
                    <Clear />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Badge badgeContent={unreadCount} color="primary" sx={{ mr: 2 }}>
            <NotificationsIcon color="primary" sx={{ fontSize: 32 }} />
          </Badge>
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>
        </Box>
        
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="notification tabs" sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All" />
          <Tab label={`Milestones (${milestones.length})`} />
          <Tab label={`Reminders (${reminders.length})`} />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {renderNotificationList(notifications)}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {renderNotificationList(milestones)}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {renderNotificationList(reminders)}
        </TabPanel>
      </Paper>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Notification Settings
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Subscription Reminders
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Get notified before your subscriptions are due.
                </Typography>
                <Button variant="contained" fullWidth>
                  Manage Subscriptions
                </Button>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Savings Milestones
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Receive congratulatory messages when you hit savings milestones.
                </Typography>
                <Button variant="contained" fullWidth>
                  Set Custom Milestones
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Notifications; 