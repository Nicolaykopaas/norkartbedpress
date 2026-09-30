import type { BarProps } from '../types/pubgolf';

function farge(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h}, 85%, 55%)`;
}

/** Logo: bruker public/logos/<id>.png hvis den finnes, ellers en farget initial. */
export function BarLogo({
  bar,
  nr,
  liten,
}: {
  bar: BarProps;
  nr?: number;
  liten?: boolean;
}) {
  return (
    <div
      className={`bar-logo${liten ? ' liten' : ''}`}
      style={{ background: farge(bar.id) }}
    >
      <span>{bar.navn.charAt(0).toUpperCase()}</span>
      <img
        src={`${import.meta.env.BASE_URL}logos/${bar.id}.png`}
        alt=""
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      {nr !== undefined && <b className="bar-nr">{nr}</b>}
    </div>
  );
}
