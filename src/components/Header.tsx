import type { CSSProperties } from 'react';
import NorkartLogo from '../assets/norkart_logo.svg';

const styles: CSSProperties = {
  height: 'var(--header-height)',
  boxSizing: 'border-box',
  width: '100vw',
  padding: '10px 30px',
  textAlign: 'center',
  fontSize: '30px',
  position: 'sticky',
  display: 'flex',
  alignItems: 'center',
  color: '#fff',
  background: 'linear-gradient(90deg,#3a0ca3,#ff2bd6,#00e5ff,#3a0ca3)',
  backgroundSize: '300% 100%',
  animation: 'disco 8s linear infinite',
  boxShadow: '0 0 20px rgba(255, 43, 214, 0.7)',
  zIndex: 1200,
};

const Header = () => {
  return (
    <header style={styles}>
      <img
        height="40px"
        src={NorkartLogo}
        style={{ filter: 'brightness(0) invert(1)' }}
      />
      <h1 style={{ fontSize: '1.5rem', margin: '0 0 0 12px' }}>🗺️ Byvandring</h1>
    </header>
  );
};

export default Header;
