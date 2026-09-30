import type { Bar, DrinkId, Hull } from '../types/pubgolf';
import { parFor } from '../data/drinks';

export function haversineMeter(
  a: [number, number],
  b: [number, number]
): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const pos = (b: Bar) => b.geometry.coordinates as [number, number];

/** Dyreste bar er best startpunkt siden prisen kun kan gå nedover. */
export function finnDyresteStart(barer: Bar[]): Bar {
  return barer.reduce((best, b) =>
    b.properties.pris > best.properties.pris ? b : best
  );
}

export function lagBane(
  start: Bar,
  barer: Bar[],
  drinks: DrinkId[],
  opts: {
    antallHull?: number;
    maksAvstandMeter?: number;
    maksRadiusMeter?: number;
  } = {}
): Hull[] {
  const antallHull = opts.antallHull ?? 9;
  const maksAvstand = opts.maksAvstandMeter ?? 800;
  const maksRadius = opts.maksRadiusMeter ?? 1500;
  const drinkListe: DrinkId[] = drinks.length > 0 ? drinks : ['pils'];
  const drinkFor = (i: number) => drinkListe[i % drinkListe.length];

  const brukt = new Set<string>([start.properties.id]);
  const hull: Hull[] = [
    { nr: 1, bar: start, drink: drinkFor(0), par: parFor(drinkFor(0)) },
  ];
  let current = start;

  for (let i = 1; i < antallHull; i++) {
    const drink = drinkFor(i);
    const ledige = barer.filter((b) => !brukt.has(b.properties.id));
    if (ledige.length === 0) break;

    const medAvstand = ledige.map((b) => ({
      b,
      d: haversineMeter(pos(current), pos(b)),
    }));
    const billigere = medAvstand.filter(
      (x) => x.b.properties.pris <= current.properties.pris
    );

    const velg = (
      liste: { b: Bar; d: number }[],
      radius: number
    ): Bar | undefined => {
      let inne = liste.filter((x) => x.d <= radius);
      if (drink === 'guinness') {
        const g = inne.filter((x) => x.b.properties.guinness);
        if (g.length > 0) inne = g;
      }
      inne.sort(
        (a, b) => a.d - b.d || a.b.properties.pris - b.b.properties.pris
      );
      return inne[0]?.b;
    };

    let valgt: Bar | undefined;
    for (let r = maksAvstand; r <= Math.max(maksRadius, maksAvstand); r += 200) {
      valgt = velg(billigere, r);
      if (valgt) break;
    }
    if (!valgt) valgt = velg(medAvstand, Infinity);
    if (!valgt) break;

    brukt.add(valgt.properties.id);
    hull.push({ nr: i + 1, bar: valgt, drink, par: parFor(drink) });
    current = valgt;
  }
  return hull;
}
