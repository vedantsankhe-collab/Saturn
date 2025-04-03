import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Switch,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider,
  Slider,
  Button,
  Alert
} from '@mui/material';
import {
  Palette,
  DarkMode,
  LightMode,
  Check,
  ColorLens,
  FormatSize,
  Contrast
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Theme = () => {
  const theme = useTheme();
  const [selectedPalette, setSelectedPalette] = useState('green');
  const [darkMode, setDarkMode] = useState(theme.palette.mode === 'dark');
  const [fontScale, setFontScale] = useState(1);
  const [borderRadius, setBorderRadius] = useState(4);
  const [density, setDensity] = useState('comfortable');
  const [success, setSuccess] = useState(false);

  const colorPalettes = [
    { name: 'green', primary: '#2e7d32', secondary: '#388e3c' },
    { name: 'blue', primary: '#1976d2', secondary: '#2196f3' },
    { name: 'purple', primary: '#7b1fa2', secondary: '#9c27b0' },
    { name: 'red', primary: '#d32f2f', secondary: '#f44336' },
    { name: 'orange', primary: '#ed6c02', secondary: '#ff9800' },
    { name: 'teal', primary: '#00796b', secondary: '#009688' }
  ];

  const handlePaletteChange = (paletteName) => {
    setSelectedPalette(paletteName);
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleFontScaleChange = (event, newValue) => {
    setFontScale(newValue);
  };

  const handleBorderRadiusChange = (event, newValue) => {
    setBorderRadius(newValue);
  };

  const handleDensityChange = (event) => {
    setDensity(event.target.value);
  };

  const handleSaveTheme = () => {
    // In a real application, this would save to the server/localStorage
    console.log('Saving theme preferences:', {
      colorPalette: selectedPalette,
      darkMode,
      fontScale,
      borderRadius,
      density
    });
    
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleResetTheme = () => {
    setSelectedPalette('green');
    setDarkMode(false);
    setFontScale(1);
    setBorderRadius(4);
    setDensity('comfortable');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Theme settings saved successfully!
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Palette color="primary" sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h4" component="h1">
            Theme Settings
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Customize the appearance of the application to suit your preferences.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Color Palette
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Choose a color scheme for the application.
          </Typography>
          
          <Grid container spacing={2}>
            {colorPalettes.map((palette) => (
              <Grid item xs={6} sm={4} md={2} key={palette.name}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderColor: selectedPalette === palette.name ? palette.primary : 'divider',
                    borderWidth: selectedPalette === palette.name ? 2 : 1
                  }}
                >
                  <CardActionArea onClick={() => handlePaletteChange(palette.name)}>
                    <Box sx={{ height: 60, bgcolor: palette.primary }} />
                    <Box sx={{ height: 30, bgcolor: palette.secondary }} />
                    <CardContent sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                        {palette.name}
                      </Typography>
                      {selectedPalette === palette.name && (
                        <Check sx={{ color: palette.primary }} />
                      )}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <DarkMode sx={{ mr: 1 }} /> Dark Mode
          </Typography>
          
          <FormControlLabel
            control={
              <Switch 
                checked={darkMode} 
                onChange={handleDarkModeToggle} 
                color="primary"
              />
            }
            label={darkMode ? "Dark Mode Enabled" : "Light Mode Enabled"}
          />
          
          <Box sx={{ mt: 2, p: 2, bgcolor: darkMode ? '#333' : '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ color: darkMode ? '#fff' : '#000' }}>
              Preview: This is how text will appear in {darkMode ? 'dark' : 'light'} mode.
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FormatSize sx={{ mr: 1 }} /> Typography
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Adjust the font size scaling across the application.
          </Typography>
          
          <Box sx={{ px: 2, width: '100%', maxWidth: 500 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Typography variant="body2">Smaller</Typography>
              </Grid>
              <Grid item xs>
                <Slider
                  value={fontScale}
                  onChange={handleFontScaleChange}
                  step={0.1}
                  min={0.8}
                  max={1.4}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}x`}
                />
              </Grid>
              <Grid item>
                <Typography variant="body2">Larger</Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ transform: `scale(${fontScale})`, transformOrigin: 'left' }}>
                Header Text Sample
              </Typography>
              <Typography variant="body1" sx={{ transform: `scale(${fontScale})`, transformOrigin: 'left' }}>
                This is a sample of body text at {fontScale}x scale.
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ColorLens sx={{ mr: 1 }} /> Element Styles
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Border Radius
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={borderRadius}
                  onChange={handleBorderRadiusChange}
                  step={1}
                  min={0}
                  max={16}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}px`}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: `${borderRadius}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="body2">{borderRadius}px</Typography>
                  </Paper>
                  
                  <Button 
                    variant="contained" 
                    sx={{ borderRadius: `${borderRadius}px` }}
                  >
                    Button
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                UI Density
              </Typography>
              <FormControl component="fieldset">
                <RadioGroup value={density} onChange={handleDensityChange}>
                  <FormControlLabel value="compact" control={<Radio />} label="Compact" />
                  <FormControlLabel value="comfortable" control={<Radio />} label="Comfortable" />
                  <FormControlLabel value="spacious" control={<Radio />} label="Spacious" />
                </RadioGroup>
              </FormControl>
              
              <Box 
                sx={{ 
                  mt: 2, 
                  p: density === 'compact' ? 1 : (density === 'comfortable' ? 2 : 3),
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                <Typography variant="body2">
                  This shows the {density} spacing.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={handleResetTheme}
          >
            Reset to Defaults
          </Button>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSaveTheme}
          >
            Save Theme Settings
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Theme; 