import { RMarker } from 'maplibre-react-components';
import type { Bar } from '../types/pubgolf';
import { BarLogo } from './BarLogo';

/** Alle barer som logo med prisen svevende over. */
export function BarMarkers({
  barer,
  hopp,
  onVelg,
}: {
  barer: Bar[];
  hopp: Set<string>;
  onVelg: (bar: Bar) => void;
}) {
  return (
    <>
      {barer
        .filter((b) => !hopp.has(b.properties.id))
        .map((b) => (
          <RMarker
            key={b.properties.id}
            longitude={b.geometry.coordinates[0]}
            latitude={b.geometry.coordinates[1]}
            onClick={(e) => {
              e.stopPropagation();
              onVelg(b);
            }}
          >
            <div className="bar-marker liten">
              <div className="bar-pris">{b.properties.pris},-</div>
              <BarLogo bar={b.properties} liten />
            </div>
          </RMarker>
        ))}
    </>
  );
}
