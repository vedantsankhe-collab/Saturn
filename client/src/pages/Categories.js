import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Menu,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Card,
  CardContent,
  Tabs,
  Tab,
  Tooltip,
  Fade
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Bookmark as BookmarkIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  ShoppingBag,
  LocalAtm,
  ArrowRightAlt,
  ColorLens,
  Label
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { 
  fetchCategories, 
  addCategory, 
  updateCategory, 
  deleteCategory 
} from '../redux/actions/categoryActions';

const CATEGORY_TYPES = ['expense', 'income'];
const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FF9F1C', '#A5D8FF', '#FF8CC6', 
  '#7367F0', '#28C76F', '#EA5455', '#6B5CA5', '#00CFDD'
];

const Categories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector(state => state.categories);
  
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: CATEGORY_COLORS[0],
    icon: 'ShoppingBag',
    budget: ''
  });
  
  // Get expense and income categories separately
  const expenseCategories = categories.filter(category => category.type === 'expense');
  const incomeCategories = categories.filter(category => category.type === 'income');
  
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenMenu = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleOpenDialog = (mode, category = null) => {
    setDialogMode(mode);
    
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name,
        type: category.type,
        color: category.color || CATEGORY_COLORS[0],
        icon: category.icon || 'ShoppingBag',
        budget: category.budget || ''
      });
    } else {
      // Default for add
      setFormData({
        name: '',
        type: tabValue === 0 ? 'expense' : 'income',
        color: CATEGORY_COLORS[0],
        icon: 'ShoppingBag',
        budget: ''
      });
    }
    
    setOpenDialog(true);
    handleCloseMenu();
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await dispatch(addCategory(formData));
        setSnackbar({
          open: true,
          message: 'Category added successfully',
          severity: 'success'
        });
      } else {
        await dispatch(updateCategory(selectedCategory._id, formData));
        setSnackbar({
          open: true,
          message: 'Category updated successfully',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred',
        severity: 'error'
      });
    }
  };
  
  const handleDelete = async () => {
    try {
      await dispatch(deleteCategory(selectedCategory._id));
      setSnackbar({
        open: true,
        message: 'Category deleted successfully',
        severity: 'success'
      });
      handleCloseMenu();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to delete category',
        severity: 'error'
      });
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'ShoppingBag':
        return <ShoppingBag />;
      case 'LocalAtm':
        return <LocalAtm />;
      case 'BookmarkIcon':
        return <BookmarkIcon />;
      default:
        return <ShoppingBag />;
    }
  };
  
  const CategoryCard = ({ category }) => (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 4
        },
        border: `1px solid ${alpha(category.color || '#ccc', 0.3)}`
      }}
    >
      <IconButton
        sx={{ position: 'absolute', top: 4, right: 4 }}
        onClick={(e) => handleOpenMenu(e, category)}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      
      <CardContent sx={{ pt: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: alpha(category.color || '#FF6B6B', 0.1),
              color: category.color || '#FF6B6B',
              mr: 2
            }}
          >
            {getIconComponent(category.icon)}
          </Box>
          
          <Typography variant="h6" component="div">
            {category.name}
          </Typography>
        </Box>
        
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 2
          }}
        >
          <Chip
            label={category.type.charAt(0).toUpperCase() + category.type.slice(1)}
            size="small"
            color={category.type === 'expense' ? 'error' : 'success'}
            variant="outlined"
          />
          
          {category.budget && (
            <Typography variant="body2" color="text.secondary">
              Budget: ₹{Number(category.budget).toLocaleString()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Categories
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
        >
          Add Category
        </Button>
      </Box>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Expense Categories" />
          <Tab label="Income Categories" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {(tabValue === 0 ? expenseCategories : incomeCategories).map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category._id}>
              <CategoryCard category={category} />
            </Grid>
          ))}
          
          {(tabValue === 0 ? expenseCategories : incomeCategories).length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No {tabValue === 0 ? 'expense' : 'income'} categories found.
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog('add')}
                  sx={{ mt: 2 }}
                >
                  Add {tabValue === 0 ? 'Expense' : 'Income'} Category
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Category Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Category' : 'Edit Category'}
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                placeholder="e.g., Groceries, Salary"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Category Type"
                >
                  {CATEGORY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Icon</InputLabel>
                <Select
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  label="Icon"
                  startAdornment={
                    <InputAdornment position="start">
                      {getIconComponent(formData.icon)}
                    </InputAdornment>
                  }
                >
                  <MenuItem value="ShoppingBag">Shopping</MenuItem>
                  <MenuItem value="LocalAtm">Money</MenuItem>
                  <MenuItem value="BookmarkIcon">Bookmark</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Select Color
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {CATEGORY_COLORS.map((color) => (
                  <Tooltip title={color} key={color} arrow TransitionComponent={Fade}>
                    <Box
                      onClick={() => setFormData({ ...formData, color })}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: color,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: formData.color === color ? '2px solid black' : 'none'
                      }}
                    >
                      {formData.color === color && <CheckIcon sx={{ color: 'white' }} />}
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </Grid>
            
            {formData.type === 'expense' && (
              <Grid item xs={12}>
                <TextField
                  label="Monthly Budget (Optional)"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  placeholder="Set a monthly budget limit"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.name.trim()}
          >
            {dialogMode === 'add' ? 'Add Category' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleOpenDialog('edit', selectedCategory)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      
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

export default Categories; 