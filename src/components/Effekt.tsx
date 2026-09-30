import { createPortal } from 'react-dom';
import type { EffektType } from '../utils/lyd';

const INNHOLD: Record<
  EffektType,
  { ikon: string[]; tekst: string; farge: string }
> = {
  strike: { ikon: ['🎳', '💥', '🎳'], tekst: 'STRIKE!', farge: '#2e7d32' },
  par: { ikon: ['👌'], tekst: 'Par', farge: '#1976d2' },
  gutter: { ikon: ['🎳', '💨'], tekst: 'Gutterball…', farge: '#c62828' },
};

export function Effekt({ type, tekst }: { type: EffektType; tekst?: string }) {
  const { ikon, farge, tekst: standard } = INNHOLD[type];
  return createPortal(
    <div className={`effekt effekt-${type}`} aria-hidden>
      <div className="effekt-ikon">
        {ikon.map((e, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            {e}
          </span>
        ))}
      </div>
      <div className="effekt-tekst" style={{ color: farge }}>
        {tekst ?? standard}
      </div>
    </div>,
    document.body
  );
}
