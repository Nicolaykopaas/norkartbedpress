import type { Hull, KategoriId, Sted } from '../types/pubgolf';

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

const pos = (s: Sted) => s.geometry.coordinates as [number, number];

function stokk<T>(liste: T[]): T[] {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Fordeler valgte kategorier på stoppene, så det blir variasjon. */
function kategoriPlan(
  kategorier: KategoriId[],
  antall: number,
  rekkefolge: KategoriId[]
): KategoriId[] {
  const liste = rekkefolge.length > 0 ? rekkefolge : kategorier;
  return Array.from({ length: antall }, (_, i) => liste[i % liste.length]);
}

/**
 * Lager en tur: for hvert stopp velges nærmeste ledige sted i den kategorien
 * som står for tur, målt fra forrige stopp.
 */
export function lagTur(
  steder: Sted[],
  kategorier: KategoriId[],
  antall: number,
  start: [number, number],
  rekkefolge: KategoriId[] = kategorier
): Hull[] {
  const plan = kategoriPlan(kategorier, antall, rekkefolge);
  const brukt = new Set<string>();
  const hull: Hull[] = [];
  let naa = start;

  for (let i = 0; i < antall; i++) {
    const onsket = plan[i];
    const velg = (liste: Sted[]) =>
      liste
        .filter((s) => !brukt.has(s.properties.id))
        .map((s) => ({ s, d: haversineMeter(naa, pos(s)) }))
        .sort((a, b) => a.d - b.d)[0]?.s;

    const valgt =
      velg(steder.filter((s) => s.properties.kategori === onsket)) ??
      velg(steder.filter((s) => kategorier.includes(s.properties.kategori)));
    if (!valgt) break;

    brukt.add(valgt.properties.id);
    hull.push({
      nr: hull.length + 1,
      sted: valgt,
      kategori: valgt.properties.kategori,
    });
    naa = pos(valgt);
  }
  return hull;
}

function turLengde(hull: Hull[], start: [number, number]): number {
  let sum = 0;
  let forrige = start;
  for (const h of hull) {
    sum += haversineMeter(forrige, pos(h.sted));
    forrige = pos(h.sted);
  }
  return sum;
}

/**
 * Prøver mange rekkefølger av kategoriene og velger turen med kortest
 * samlet gangavstand.
 */
export function lagBesteTur(
  steder: Sted[],
  kategorier: KategoriId[],
  antall: number,
  start: [number, number]
): Hull[] {
  let beste: Hull[] = [];
  let besteScore = Infinity;
  for (let forsok = 0; forsok < 60; forsok++) {
    const tur = lagTur(steder, kategorier, antall, start, stokk(kategorier));
    // Færre stopp enn ønsket straffes hardt
    const score = (antall - tur.length) * 100000 + turLengde(tur, start);
    if (score < besteScore) {
      besteScore = score;
      beste = tur;
    }
  }
  return beste;
}
