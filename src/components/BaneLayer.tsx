import { RMarker } from 'maplibre-react-components';
import type { Hull } from '../types/pubgolf';
import { kategoriById } from '../data/kategorier';
import { StedPin } from './StedPin';

/** Stoppene på turen: nummererte bilder med navnet over. */
export function BaneLayer({
  hull,
  aktivtHull,
  onVelgHull,
}: {
  hull: Hull[];
  aktivtHull?: number;
  onVelgHull?: (hullIdx: number) => void;
}) {
  return (
    <>
      {hull.map((h, i) => {
        const [lng, lat] = h.sted.geometry.coordinates;
        return (
          <RMarker
            key={h.sted.properties.id}
            longitude={lng}
            latitude={lat}
            onClick={(e) => {
              e.stopPropagation();
              onVelgHull?.(i);
            }}
          >
            <div
              className={`pin-marker${i === aktivtHull ? ' aktiv' : ''}`}
              title={`Stopp ${h.nr}: ${h.sted.properties.navn}`}
            >
              <div className="pin-navn">{h.sted.properties.navn}</div>
              <StedPin
                sted={h.sted}
                kategori={kategoriById(h.kategori)}
                nr={h.nr}
              />
            </div>
          </RMarker>
        );
      })}
    </>
  );
}
