import { RMarker } from 'maplibre-react-components';
import type { Sted } from '../types/pubgolf';
import { kategoriById } from '../data/kategorier';
import { Pin } from './Pin';

/** Oversikten, som kartet i GTA: alle valgte aktiviteter som ikoner. */
export function AktivitetMarkers({
  steder,
  valgtId,
  onVelg,
}: {
  steder: Sted[];
  valgtId?: string;
  onVelg: (sted: Sted) => void;
}) {
  return (
    <>
      {steder.map((s) => (
        <RMarker
          key={s.properties.id}
          longitude={s.geometry.coordinates[0]}
          latitude={s.geometry.coordinates[1]}
          onClick={(e) => {
            e.stopPropagation();
            onVelg(s);
          }}
        >
          <div
            className={`bar-marker${valgtId === s.properties.id ? ' aktiv' : ''}`}
            title={s.properties.navn}
          >
            <Pin kategori={kategoriById(s.properties.kategori)} />
          </div>
        </RMarker>
      ))}
    </>
  );
}
