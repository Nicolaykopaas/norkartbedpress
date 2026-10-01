import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import { MapLibreMap } from './components/MapLibreMap';
import './index.css';

const tema = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0f5c8a' },
    secondary: { main: '#0f8ad6' },
    success: { main: '#2e7d32' },
    background: { default: '#f4f6f8', paper: '#ffffff' },
    text: { primary: '#1b2a35', secondary: '#5b6b76' },
  },
  shape: { borderRadius: 10 },
  typography: {
    button: { fontWeight: 700, textTransform: 'none' },
  },
});

function App() {
  return (
    <ThemeProvider theme={tema}>
      <CssBaseline />
      <Header />
      <MapLibreMap />
    </ThemeProvider>
  );
}

export default App;
