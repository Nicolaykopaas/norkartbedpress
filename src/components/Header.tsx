import type { CSSProperties } from 'react';

const styles: CSSProperties = {
  height: 'var(--header-height)',
  boxSizing: 'border-box',
  width: '100%',
  padding: '0 16px',
  position: 'sticky',
  top: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#ffffff',
  color: '#0f3b57',
  borderBottom: '1px solid #dde4e9',
  zIndex: 1200,
};

const Header = () => {
  return (
    <header style={styles}>
      <h1
        style={{
          margin: 0,
          fontSize: '1.3rem',
          fontWeight: 800,
          letterSpacing: '-0.01em',
        }}
      >
        Visit<span style={{ color: '#0f8ad6' }}>Trondheim</span>
      </h1>
      <span style={{ fontSize: 11, color: '#6b7b86' }}>
        Uoffisiell prosjektdemo
      </span>
    </header>
  );
};

export default Header;
