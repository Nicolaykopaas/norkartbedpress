import type { Kategori, Sted } from '../types/pubgolf';

/** Rundt bilde av stedet, med kategorifarge som ramme og eventuelt stoppnummer. */
export function StedPin({
  sted,
  kategori,
  nr,
  liten,
}: {
  sted: Sted;
  kategori: Kategori;
  nr?: number;
  liten?: boolean;
}) {
  const foto = sted.properties.foto;
  return (
    <div
      className={`pin${liten ? ' liten' : ''}`}
      style={{
        ['--farge' as string]: kategori.farge,
        backgroundImage: foto ? `url("${foto.url}")` : undefined,
      }}
    >
      {!foto && sted.properties.navn.charAt(0).toUpperCase()}
      {nr !== undefined && <b className="pin-nr">{nr}</b>}
    </div>
  );
}
