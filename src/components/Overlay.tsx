import type { PropsWithChildren, CSSProperties } from 'react';

export function Overlay({
  children,
  style,
  className,
}: PropsWithChildren & { style?: CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        backgroundColor: 'rgba(14, 6, 34, 0.86)',
        backdropFilter: 'blur(10px)',
        color: '#fff',
        border: '1px solid rgba(255, 43, 214, 0.6)',
        borderRadius: '20px',
        padding: '20px',
        width: 'fit-content',
        boxShadow:
          '0 0 18px rgba(255, 43, 214, 0.45), 0 0 40px rgba(0, 229, 255, 0.2)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
