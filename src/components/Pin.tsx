import type { Kategori } from '../types/pubgolf';

/** Rundt ikon for en aktivitet: emoji, kategorifarge og eventuelt stoppnummer. */
export function Pin({
  kategori,
  nr,
  liten,
}: {
  kategori: Kategori;
  nr?: number;
  liten?: boolean;
}) {
  return (
    <div
      className={`bar-logo${liten ? ' liten' : ''}`}
      style={{ background: kategori.farge, borderColor: '#fff' }}
    >
      <span>{kategori.emoji}</span>
      {nr !== undefined && <b className="bar-nr">{nr}</b>}
    </div>
  );
}
