// Henter aktiviteter i Trondheim sentrum fra OpenStreetMap (Overpass) og lager
// src/sample_data/aktiviteter.json. Kjør: node scripts/hent-aktiviteter.mjs
// Data © OpenStreetMap-bidragsytere (ODbL).
import { readFileSync, writeFileSync } from 'node:fs';

const TORVET = [10.39506, 63.43049];
const BBOX = '63.412,10.36,63.448,10.435'; // sør, vest, nord, øst
const MAKS_PER_KATEGORI = 10;

// Kategori -> OSM-filtre. Kun kategorier som passer for hele familien.
const KATEGORIER = {
  bowling: ['nwr["leisure"="bowling_alley"]'],
  badstue: ['nwr["leisure"="sauna"]', 'nwr["amenity"="public_bath"]'],
  bading: [
    'nwr["leisure"~"^(swimming_pool|water_park|bathing_place)$"]["access"!="private"]',
  ],
  lekeplass: ['nwr["leisure"="playground"]'],
  park: ['nwr["leisure"~"^(park|garden)$"]'],
  is: ['nwr["amenity"="ice_cream"]'],
  kino: ['nwr["amenity"="cinema"]'],
  museum: ['nwr["tourism"~"^(museum|gallery)$"]'],
  scene: ['nwr["amenity"~"^(theatre|arts_centre)$"]'],
  utsikt: ['nwr["tourism"="viewpoint"]'],
  spill: [
    'nwr["leisure"~"^(amusement_arcade|escape_game)$"]',
    'nwr["sport"~"^(climbing|bouldering)$"]["leisure"~"^(sports_centre|climbing)$"]',
  ],
};

// Ord vi aldri vil ha med i en familieapp
const PRIVAT = /barnehage|avdeling|stellerom|skole|tkb|lekerom|bhg|sfo|private/i;
const FORBUDT = /\b(pub|bar|vinbar|nightclub|nattklubb|strip|sex|erotic|casino|bingo|vape|tobakk)\b/i;

const haversine = (a, b) => {
  const R = 6371000;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b[1] - a[1]);
  const dLng = rad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const SERVERE = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

async function overpass(query) {
  for (let runde = 0; runde < 5; runde++) {
    for (const url of SERVERE) {
      try {
        const svar = await fetch(url, {
          method: 'POST',
          headers: { 'User-Agent': 'byvandring-trondheim/1.0' },
          body: new URLSearchParams({ data: query }),
          signal: AbortSignal.timeout(45000),
        });
        console.log('  ', url.split('/')[2], svar.status);
        if (svar.ok) return await svar.json();
      } catch {
        /* prøv neste server */
      }
    }
    await new Promise((r) => setTimeout(r, 5000 * (runde + 1)));
  }
  throw new Error('Overpass svarte ikke');
}

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[æ]/g, 'ae')
    .replace(/[ø]/g, 'o')
    .replace(/[å]/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const features = [];
const brukt = new Set();

for (const [kategori, filtre] of Object.entries(KATEGORIER)) {
  const query = `[out:json][timeout:60];(${filtre
    .map((f) => `${f}["name"](${BBOX});`)
    .join('')});out center tags 200;`;
  const data = await overpass(query);
  const steder = [];
  for (const e of data.elements) {
    const navn = e.tags?.name;
    const c = e.center ?? { lat: e.lat, lon: e.lon };
    if (!navn || !c || FORBUDT.test(navn)) continue;
    if (kategori === 'lekeplass' && PRIVAT.test(navn)) continue;
    if (['Stiftsgården', 'Gamle Bybro'].includes(navn)) continue; // ligger i hand-plukket
    const nokkel = `${kategori}:${navn.toLowerCase()}`;
    if (brukt.has(nokkel)) continue;
    brukt.add(nokkel);
    steder.push({
      navn,
      pos: [Math.round(c.lon * 1e5) / 1e5, Math.round(c.lat * 1e5) / 1e5],
    });
  }
  steder
    .sort((a, b) => haversine(TORVET, a.pos) - haversine(TORVET, b.pos))
    .slice(0, MAKS_PER_KATEGORI)
    .forEach((s) =>
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: s.pos },
        properties: { id: `${kategori}-${slug(s.navn)}`, navn: s.navn, kategori },
      })
    );
  console.log(kategori, steder.length);
  await new Promise((r) => setTimeout(r, 3000));
}

// Håndplukkede steder: severdigheter og turløyper (koordinater sjekket mot kart)
const hand = JSON.parse(
  readFileSync(new URL('./hand-plukket.json', import.meta.url), 'utf-8')
);
for (const h of hand) {
  features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: h.pos },
    properties: {
      id: h.id,
      navn: h.navn,
      kategori: h.kategori,
      ...(h.fakta ? { fakta: h.fakta } : {}),
    },
  });
}

writeFileSync(
  new URL('../src/sample_data/aktiviteter.json', import.meta.url),
  JSON.stringify({ type: 'FeatureCollection', features }, null, 1)
);
console.log('Ferdig:', features.length, 'steder');
