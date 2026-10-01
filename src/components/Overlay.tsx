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
        backgroundColor: '#ffffff',
        color: '#1b2a35',
        borderRadius: '14px',
        padding: '16px',
        width: 'fit-content',
        boxShadow: '0 4px 20px rgba(15, 59, 87, 0.22)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
