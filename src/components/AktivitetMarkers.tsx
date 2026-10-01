import { RMarker } from 'maplibre-react-components';
import type { Sted } from '../types/pubgolf';
import { kategoriById } from '../data/kategorier';
import { StedPin } from './StedPin';

/** Oversikten: alle steder som runde bilder i kartet. */
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
            className={`pin-marker${valgtId === s.properties.id ? ' aktiv' : ''}`}
            title={s.properties.navn}
          >
            <StedPin
              sted={s}
              kategori={kategoriById(s.properties.kategori)}
              liten
            />
          </div>
        </RMarker>
      ))}
    </>
  );
}
