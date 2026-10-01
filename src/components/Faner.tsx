export type Fane = 'utforsk' | 'tur' | 'oppdrag';

const IKON = {
  utforsk: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </svg>
  ),
  tur: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <path d="M8.5 18H15a3 3 0 000-6H9a3 3 0 010-6h6.5" />
    </svg>
  ),
  oppdrag: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 21V4" />
      <path d="M5 4h11l-2 4 2 4H5" />
    </svg>
  ),
};

const NAVN: Record<Fane, string> = {
  utforsk: 'Utforsk',
  tur: 'Min tur',
  oppdrag: 'Oppdrag',
};

/** Faner nederst: Utforsk, Min tur og Oppdrag. */
export function Faner({
  aktiv,
  onVelg,
  badge,
}: {
  aktiv: Fane;
  onVelg: (f: Fane) => void;
  badge: Partial<Record<Fane, number>>;
}) {
  return (
    <nav className="tabs" aria-label="Hovedmeny">
      {(Object.keys(NAVN) as Fane[]).map((f) => (
        <button
          key={f}
          className={`tab${aktiv === f ? ' on' : ''}`}
          onClick={() => onVelg(f)}
          aria-current={aktiv === f ? 'page' : undefined}
        >
          {IKON[f]}
          <span>{NAVN[f]}</span>
          {!!badge[f] && (
            <b className={`badge${f === 'oppdrag' ? ' or' : ''}`}>{badge[f]}</b>
          )}
        </button>
      ))}
    </nav>
  );
}
