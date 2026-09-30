import { RLayer, RSource } from 'maplibre-react-components';
import type { BarCollection } from '../types/pubgolf';
import { PRIS_FARGER, prisSkala } from '../utils/pris';

export function PilsLayer({ barer }: { barer: BarCollection }) {
  const { min, median, max } = prisSkala(barer.features);
  // Interpolate krever stigende og unike stopp
  const lav = min;
  const midt = Math.max(median, lav + 0.1);
  const hoy = Math.max(max, midt + 0.1);

  return (
    <>
      <RSource id="pils" type="geojson" data={barer} />
      <RLayer
        id="pils-circle"
        source="pils"
        type="circle"
        paint={{
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'pris'],
            lav,
            PRIS_FARGER.billig,
            midt,
            PRIS_FARGER.middels,
            hoy,
            PRIS_FARGER.dyr,
          ],
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['get', 'pris'],
            lav,
            6,
            hoy,
            14,
          ],
          'circle-stroke-width': ['case', ['get', 'guinness'], 3, 1],
          'circle-stroke-color': [
            'case',
            ['get', 'guinness'],
            '#222',
            '#ffffff',
          ],
          'circle-opacity': 0.9,
        }}
      />
    </>
  );
}

export function PrisLegend({ barer }: { barer: BarCollection }) {
  const { min, median, max } = prisSkala(barer.features);
  return (
    <div style={{ fontSize: 12 }}>
      <div
        style={{
          height: 10,
          borderRadius: 5,
          background: `linear-gradient(to right, ${PRIS_FARGER.billig}, ${PRIS_FARGER.middels}, ${PRIS_FARGER.dyr})`,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{min},-</span>
        <span>median {median},-</span>
        <span>{max},-</span>
      </div>
      <div>Pris per 0,5 l · svart ring = Guinness 🍀</div>
    </div>
  );
}
