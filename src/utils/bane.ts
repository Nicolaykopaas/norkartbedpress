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
  const plan = drinkPlan(drinks, antallHull);
  const drinkFor = (i: number) => plan[i];

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
    for (
      let r = maksAvstand;
      r <= Math.max(maksRadius, maksAvstand);
      r += 200
    ) {
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

/**
 * Fordeler likte drinker på hullene i rekkefølge. Shot brukes maks én gang,
 * og da på siste hull. Uten likte drinker blir det pils.
 */
export function drinkPlan(drinks: DrinkId[], antallHull: number): DrinkId[] {
  const harShot = drinks.includes('shot');
  const utenShot = drinks.filter((d) => d !== 'shot');
  const liste: DrinkId[] = utenShot.length > 0 ? utenShot : ['pils'];
  const plan = Array.from(
    { length: antallHull },
    (_, i) => liste[i % liste.length]
  );
  if (harShot && antallHull > 0) plan[antallHull - 1] = 'shot';
  return plan;
}

/**
 * Planlegger banen automatisk ut fra swipene: prøver hver bar som start og
 * velger banen med kortest gangavstand, færrest prisøkninger og flest
 * Guinness-barer på Guinness-hullene.
 */
export function lagBesteBane(
  barer: Bar[],
  drinks: DrinkId[],
  opts: {
    antallHull?: number;
    maksAvstandMeter?: number;
    maksRadiusMeter?: number;
    /** Start nær dette punktet (lng, lat), f.eks. midt i Midtbyen */
    startSenter?: [number, number];
    startRadiusMeter?: number;
  } = {}
): Hull[] {
  const antallHull = opts.antallHull ?? 9;
  let kandidater = barer;
  if (opts.startSenter) {
    const sentrum = opts.startSenter;
    const nar = barer.filter(
      (b) =>
        haversineMeter(sentrum, b.geometry.coordinates as [number, number]) <=
        (opts.startRadiusMeter ?? 600)
    );
    kandidater =
      nar.length > 0
        ? nar
        : [
            barer.reduce((a, b) =>
              haversineMeter(sentrum, pos(b)) < haversineMeter(sentrum, pos(a))
                ? b
                : a
            ),
          ];
  }
  let beste: Hull[] = [];
  let besteScore = Infinity;
  for (const start of kandidater) {
    const bane = lagBane(start, barer, drinks, opts);
    let score = (antallHull - bane.length) * 10000;
    for (let i = 1; i < bane.length; i++) {
      const a = bane[i - 1].bar;
      const b = bane[i].bar;
      score += haversineMeter(
        a.geometry.coordinates as [number, number],
        b.geometry.coordinates as [number, number]
      );
      if (b.properties.pris > a.properties.pris) score += 3000;
    }
    for (const h of bane) {
      if (h.drink === 'guinness' && !h.bar.properties.guinness) score += 300;
    }
    if (score < besteScore) {
      besteScore = score;
      beste = bane;
    }
  }
  return beste;
}
