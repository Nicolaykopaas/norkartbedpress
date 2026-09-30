import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Header from './components/Header';
import { MapLibreMap } from './components/MapLibreMap';
import './index.css';

const tema = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#ff2bd6' },
    secondary: { main: '#00e5ff' },
    success: { main: '#39ff14', contrastText: '#000' },
    warning: { main: '#ffd600', contrastText: '#000' },
    background: { default: '#0b0618', paper: '#150b2e' },
  },
  shape: { borderRadius: 14 },
  typography: { button: { fontWeight: 800 } },
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
