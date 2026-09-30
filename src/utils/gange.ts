import { getRuteMellomPunkter } from '../api/getRuteMellomPunkter';

export type Punkt = [number, number];

/** Gangrute mellom to punkter (Norkart-ruteberegner), ellers rett linje. */
export async function hentGangLinje(a: Punkt, b: Punkt): Promise<Punkt[]> {
  try {
    const d = await getRuteMellomPunkter(a[0], a[1], b[0], b[1]);
    const g = d?.RouteGeometry;
    if (g?.type === 'LineString' && g.coordinates.length > 1)
      return g.coordinates as Punkt[];
    if (g?.type === 'MultiLineString') {
      const flat = (g.coordinates as Punkt[][]).flat();
      if (flat.length > 1) return flat;
    }
  } catch {
    /* faller tilbake til rett linje */
  }
  return [a, b];
}
