import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Hull } from '../types/pubgolf';
import { getRuteMellomPunkter } from './getRuteMellomPunkter';

type Resultat = { geometri: FeatureCollection; totalSekunder?: number };

const koord = (h: Hull): [number, number] => {
  const [x, y] = h.bar.geometry.coordinates;
  return [x, y];
};

const erGeometri = (g: unknown): g is Geometry =>
  !!g &&
  typeof g === 'object' &&
  typeof (g as { type?: unknown }).type === 'string';

/** Prøver å finne total tid (sekunder) i CostList med ukjent form. */
function parseSekunder(data: unknown): number | undefined {
  const liste = (data as { CostList?: unknown } | undefined)?.CostList;
  if (!Array.isArray(liste) || liste.length === 0) return undefined;
  const nokkel = /time|tid|seconds|cost/i;
  let sum = 0;
  let fant = false;
  for (const el of liste) {
    if (typeof el === 'number' && Number.isFinite(el)) {
      sum += el;
      fant = true;
      continue;
    }
    if (!el || typeof el !== 'object') continue;
    const obj = el as Record<string, unknown>;
    if (typeof obj.Value === 'number') {
      sum += obj.Value;
      fant = true;
      continue;
    }
    const k = Object.keys(obj).find(
      (n) => nokkel.test(n) && typeof obj[n] === 'number'
    );
    if (k) {
      sum += obj[k] as number;
      fant = true;
    }
  }
  return fant && sum > 0 ? sum : undefined;
}

export async function getBaneRute(hull: Hull[]): Promise<Resultat | undefined> {
  if (hull.length < 2) return undefined;
  const punkter = hull.map(koord);

  // 1) Ett kall med via-punkter
  try {
    const [start, ...rest] = punkter;
    const stopp = rest[rest.length - 1];
    const via = rest.slice(0, -1);
    const data = await getRuteMellomPunkter(
      start[0],
      start[1],
      stopp[0],
      stopp[1],
      via
    );
    if (erGeometri(data?.RouteGeometry)) {
      return {
        geometri: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { etappe: 0 },
              geometry: data.RouteGeometry,
            },
          ],
        },
        totalSekunder: parseSekunder(data),
      };
    }
  } catch (e) {
    console.error('Samlet rutekall feilet:', e);
  }

  // 2) Ett kall per etappe
  try {
    const data = await Promise.all(
      punkter.slice(0, -1).map((p, i) => {
        const q = punkter[i + 1];
        return getRuteMellomPunkter(p[0], p[1], q[0], q[1]);
      })
    );
    const features: Feature[] = [];
    const tider: (number | undefined)[] = [];
    data.forEach((d, i) => {
      if (erGeometri(d?.RouteGeometry)) {
        features.push({
          type: 'Feature',
          properties: { etappe: i },
          geometry: d.RouteGeometry,
        });
        tider.push(parseSekunder(d));
      }
    });
    if (features.length > 0) {
      const alleTider = tider.every((t) => t !== undefined);
      return {
        geometri: { type: 'FeatureCollection', features },
        totalSekunder:
          alleTider && features.length === punkter.length - 1
            ? (tider as number[]).reduce((a, b) => a + b, 0)
            : undefined,
      };
    }
  } catch (e) {
    console.error('Etapperuter feilet:', e);
  }

  // 3) Rett linje som siste utvei
  return {
    geometri: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { rett: true },
          geometry: { type: 'LineString', coordinates: punkter },
        },
      ],
    },
  };
}
