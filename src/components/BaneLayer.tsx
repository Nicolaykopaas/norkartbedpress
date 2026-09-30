import { RLayer, RMarker, RSource } from 'maplibre-react-components';
import type { FeatureCollection } from 'geojson';
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
              'line-color': ['case', ['has', 'rett'], '#888888', '#1a73e8'],
              'line-width': 5,
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
              title={`Hull ${h.nr}: ${h.bar.properties.navn}`}
              style={{
                width: aktiv ? 34 : 26,
                height: aktiv ? 34 : 26,
                borderRadius: '50%',
                background: aktiv ? '#1a73e8' : 'white',
                color: aktiv ? 'white' : '#1a73e8',
                border: '3px solid #1a73e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: aktiv ? 16 : 13,
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
              }}
            >
              {h.nr}
            </div>
          </RMarker>
        );
      })}
    </>
  );
}
