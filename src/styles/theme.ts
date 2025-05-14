import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1B3B6F', // Deep navy blue - professional and trustworthy
      light: '#2C5282',
      dark: '#0F2444',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C4A77D', // Warm gold - adds sophistication
      light: '#D4B78F',
      dark: '#B38D5F',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F7FA', // Light gray-blue - easy on the eyes
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D3748', // Dark gray - good readability
      secondary: '#4A5568',
    },
    divider: '#E2E8F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        },
      },
    },
  },
}); 