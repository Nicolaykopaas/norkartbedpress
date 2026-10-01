import { RMarker } from 'maplibre-react-components';
import type { Hull } from '../types/pubgolf';
import { kategoriById } from '../data/kategorier';
import { Pin } from './Pin';

/** Stoppene på turen som nummererte ikoner med navnet svevende over. */
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
        const aktiv = i === aktivtHull;
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
              className={`bar-marker${aktiv ? ' aktiv' : ''}`}
              title={`Stopp ${h.nr}: ${h.sted.properties.navn}`}
            >
              <div className="bar-pris">{h.sted.properties.navn}</div>
              <Pin kategori={kategoriById(h.kategori)} nr={h.nr} />
            </div>
          </RMarker>
        );
      })}
    </>
  );
}
