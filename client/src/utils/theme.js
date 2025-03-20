import { createTheme } from '@mui/material/styles';

// Green and black theme
export const greenBlackTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00A86B', // Green
      light: '#4CAF50',
      dark: '#2E7D32',
      contrastText: '#fff'
    },
    secondary: {
      main: '#212121', // Dark gray/black
      light: '#484848',
      dark: '#000000',
      contrastText: '#fff'
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E'
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500
    },
    h2: {
      fontWeight: 500
    },
    h3: {
      fontWeight: 500
    },
    h4: {
      fontWeight: 500
    },
    h5: {
      fontWeight: 500
    },
    h6: {
      fontWeight: 500
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#2E7D32'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
        }
      }
    }
  }
});

// Function to get theme based on name
export const getTheme = (themeName) => {
  switch (themeName) {
    case 'green-black':
    default:
      return greenBlackTheme;
  }
}; 