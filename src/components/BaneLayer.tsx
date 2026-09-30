import { RLayer, RMarker, RSource } from 'maplibre-react-components';
import type { FeatureCollection } from 'geojson';
import { BarLogo } from './BarLogo';
import type { Hull } from '../types/pubgolf';

export function BaneLayer({
  hull,
  rute,
  aktivtHull,
  onVelgHull,
}: {
  hull: Hull[];
  rute?: FeatureCollection;
  aktivtHull?: number;
  onVelgHull?: (hullIdx: number) => void;
}) {
  return (
    <>
      {rute && (
        <>
          <RSource id="bane-rute" type="geojson" data={rute} />
          <RLayer
            id="bane-rute-line"
            source="bane-rute"
            type="line"
            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
            paint={{
              // Grå = luftlinje (ruteberegning feilet)
              'line-color': ['case', ['has', 'rett'], '#888888', '#00e5ff'],
              'line-width': 6,
              'line-opacity': 0.8,
            }}
          />
        </>
      )}
      {hull.map((h, i) => {
        const [lng, lat] = h.bar.geometry.coordinates;
        const aktiv = i === aktivtHull;
        return (
          <RMarker
            key={h.bar.properties.id}
            longitude={lng}
            latitude={lat}
            onClick={(e) => {
              e.stopPropagation();
              onVelgHull?.(i);
            }}
          >
            <div
              className={`bar-marker${aktiv ? ' aktiv' : ''}`}
              title={`Hull ${h.nr}: ${h.bar.properties.navn}`}
            >
              <div className="bar-pris">{h.bar.properties.pris},-</div>
              <BarLogo bar={h.bar.properties} nr={h.nr} />
            </div>
          </RMarker>
        );
      })}
    </>
  );
}
