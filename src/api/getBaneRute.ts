import type { FeatureCollection } from 'geojson';
import type { Hull } from '../types/pubgolf';
import { hentGangRute, type Punkt } from '../utils/gange';

type Resultat = { geometri: FeatureCollection; totalSekunder?: number };

/** Gangrute gjennom alle stoppene på banen. */
export async function getBaneRute(hull: Hull[]): Promise<Resultat | undefined> {
  if (hull.length < 2) return undefined;
  const punkter = hull.map((h) => h.sted.geometry.coordinates as Punkt);
  const rute = await hentGangRute(punkter);
  return {
    geometri: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: rute.rett ? { rett: true } : { etappe: 0 },
          geometry: { type: 'LineString', coordinates: rute.linje },
        },
      ],
    },
    totalSekunder: rute.sekunder,
  };
}
