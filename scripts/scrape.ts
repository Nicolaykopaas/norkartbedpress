/**
 * Engangsskript: henter ølpriser fra pilsguiden.no for Trondheim, geokoder og
 * skriver src/sample_data/olpriser.json. Kjøres med `npm run scrape`.
 *
 * Strukturen på pilsguiden er ikke kjent på forhånd, så skriptet prøver flere
 * strategier (Next.js-data, JSON-LD, HTML-heuristikk). Feiler parsingen lagres
 * rå-HTML i scripts/debug/ og eksisterende data blir ikke overskrevet.
 *
 * Manuelle rettelser: scripts/overrides.json
 *   { "<navn>": { "lat": 63.43, "lng": 10.39, "guinness": true, "skip": false } }
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parse, type HTMLElement } from 'node-html-parser';

const BASE = 'https://www.pilsguiden.no';
const LISTE = `${BASE}/liste/trondelag/trondheim`;
const UT = 'src/sample_data/olpriser.json';
const UA = 'norkart-webkurs-pubgolf/1.0 (engangsskript for workshop)';
const BBOX = { minLat: 63.3, maxLat: 63.5, minLng: 10.2, maxLng: 10.6 };

type Rad = {
  navn: string;
  pris: number;
  happyHour: boolean;
  bydel: string;
  href?: string;
  adresse?: string;
  lat?: number;
  lng?: number;
  guinness?: boolean;
};
type Override = {
  lat?: number;
  lng?: number;
  guinness?: boolean;
  skip?: boolean;
  pris?: number;
};

// --- hjelpere ---------------------------------------------------------------

function lesEnv() {
  if (!existsSync('.env')) return;
  for (const linje of readFileSync('.env', 'utf8').split('\n')) {
    const m = linje.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const vent = (ms: number) => new Promise((r) => setTimeout(r, ms));
let sisteKall = 0;
async function hent(url: string, init: RequestInit = {}): Promise<Response> {
  const d = Date.now() - sisteKall;
  if (d < 1000) await vent(1000 - d); // maks 1 req/s
  sisteKall = Date.now();
  const res = await fetch(url, {
    ...init,
    headers: { 'User-Agent': UA, ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}
const hentTekst = async (url: string) => (await hent(url)).text();

function debug(navn: string, innhold: string) {
  mkdirSync('scripts/debug', { recursive: true });
  writeFileSync(`scripts/debug/${navn}`, innhold);
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const rens = (s: string) => s.replace(/\s+/g, ' ').trim();

/** Finner pris i tekst: "89 kr", "89,-", "kr 89" (40–200 kr) */
function finnPris(tekst: string): number | undefined {
  const m =
    tekst.match(/(\d{2,3})(?:[.,]\d{1,2})?\s*(?:kr|,-|NOK)/i) ??
    tekst.match(/kr\.?\s*(\d{2,3})/i);
  const n = m ? Number(m[1]) : NaN;
  return n >= 40 && n <= 200 ? n : undefined;
}

const erHappyHour = (tekst: string) => /⏰|happy\s*hour/i.test(tekst);

// --- strategi 1: JSON (Next.js / inline) ------------------------------------

function finnObjekter(data: unknown, ut: Record<string, unknown>[] = []) {
  if (Array.isArray(data)) data.forEach((d) => finnObjekter(d, ut));
  else if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    const harNavn = ['name', 'navn', 'title'].some(
      (k) => typeof o[k] === 'string'
    );
    const harPris = Object.keys(o).some((k) => /pris|price/i.test(k));
    if (harNavn && harPris) ut.push(o);
    Object.values(o).forEach((v) => finnObjekter(v, ut));
  }
  return ut;
}

function fraJson(html: string): Rad[] {
  const root = parse(html);
  const kilder = [
    root.querySelector('script#__NEXT_DATA__')?.text,
    ...root
      .querySelectorAll('script[type="application/json"]')
      .map((s) => s.text),
  ].filter(Boolean) as string[];
  const rader: Rad[] = [];
  for (const k of kilder) {
    try {
      for (const o of finnObjekter(JSON.parse(k))) {
        const navn = String(o.name ?? o.navn ?? o.title);
        const prisFelt = Object.entries(o).find(([key]) =>
          /pris|price/i.test(key)
        )?.[1];
        const pris =
          typeof prisFelt === 'number' ? prisFelt : finnPris(`${prisFelt} kr`);
        if (!pris) continue;
        const lat = Number(
          o.lat ?? o.latitude ?? (o.location as Record<string, unknown>)?.lat
        );
        const lng = Number(
          o.lng ??
            o.lon ??
            o.longitude ??
            (o.location as Record<string, unknown>)?.lng
        );
        rader.push({
          navn: rens(navn),
          pris,
          happyHour: erHappyHour(JSON.stringify(o)),
          bydel: String(o.bydel ?? o.district ?? o.area ?? ''),
          href:
            typeof o.slug === 'string'
              ? o.slug
              : typeof o.url === 'string'
                ? o.url
                : undefined,
          adresse:
            typeof o.address === 'string'
              ? o.address
              : typeof o.adresse === 'string'
                ? o.adresse
                : undefined,
          lat: Number.isFinite(lat) ? lat : undefined,
          lng: Number.isFinite(lng) ? lng : undefined,
        });
      }
    } catch {
      /* ikke JSON */
    }
  }
  return rader;
}

// --- strategi 2: HTML-heuristikk --------------------------------------------

function radContainer(a: HTMLElement): HTMLElement {
  let el: HTMLElement = a;
  for (let i = 0; i < 5 && el.parentNode; i++) {
    if (['li', 'tr', 'article'].includes(el.tagName?.toLowerCase())) return el;
    if (finnPris(el.text)) return el;
    el = el.parentNode as HTMLElement;
  }
  return el;
}

function fraHtml(html: string): Rad[] {
  const root = parse(html);
  const rader = new Map<string, Rad>();
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') ?? '';
    const navn = rens(a.text);
    if (!navn || navn.length > 60 || /^\d/.test(navn)) continue;
    if (
      href.startsWith('/liste/') ||
      href.startsWith('#') ||
      (/^https?:/.test(href) && !href.includes('pilsguiden'))
    )
      continue;
    const c = radContainer(a);
    const tekst = c.text;
    const pris = finnPris(tekst);
    if (!pris || rader.has(navn)) continue;
    rader.set(navn, {
      navn,
      pris,
      happyHour: erHappyHour(tekst),
      bydel: '',
      href,
    });
  }
  return [...rader.values()];
}

function bydelLenker(html: string): { navn: string; url: string }[] {
  const root = parse(html);
  const sett = new Map<string, string>();
  for (const a of root.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') ?? '';
    const m = href.match(/\/liste\/trondelag\/trondheim\/([a-z0-9-]+)\/?$/i);
    if (m) sett.set(m[1], rens(a.text) || m[1]);
  }
  return [...sett].map(([s, navn]) => ({ navn, url: `${LISTE}/${s}` }));
}

// --- stedsside: adresse / koordinater ---------------------------------------

async function detaljer(r: Rad) {
  if (!r.href || (r.lat && r.lng)) return;
  const url = r.href.startsWith('http')
    ? r.href
    : `${BASE}${r.href.startsWith('/') ? '' : '/'}${r.href}`;
  try {
    const html = await hentTekst(url);
    if (/guinness/i.test(html)) r.guinness = true;
    const root = parse(html);
    for (const s of root.querySelectorAll(
      'script[type="application/ld+json"]'
    )) {
      try {
        const j = JSON.parse(s.text);
        const geo =
          j.geo ?? j?.['@graph']?.find?.((g: { geo?: unknown }) => g.geo)?.geo;
        if (geo?.latitude) {
          r.lat = Number(geo.latitude);
          r.lng = Number(geo.longitude);
        }
        const a = j.address;
        if (a)
          r.adresse =
            typeof a === 'string'
              ? a
              : [a.streetAddress, a.postalCode, a.addressLocality]
                  .filter(Boolean)
                  .join(' ');
      } catch {
        /* ignorer */
      }
    }
    if (!r.lat) {
      const m = html.match(/(63\.\d{3,})[,\s"']+(10\.\d{3,})/);
      if (m) {
        r.lat = Number(m[1]);
        r.lng = Number(m[2]);
      }
    }
    if (!r.adresse) {
      const m = root.text.match(
        /\b([A-ZÆØÅ][\wæøåÆØÅ.' -]{2,40}(?:gata|gate|gaten|veien|vei|plass|allé|bakken|brygga|kaia|torget|svingen)\s+\d+[A-Za-z]?)/
      );
      if (m) r.adresse = m[1];
    }
  } catch (e) {
    console.warn('  kunne ikke hente stedsside', url, (e as Error).message);
  }
}

// --- geokoding --------------------------------------------------------------

async function norkart(adresse: string): Promise<[number, number] | undefined> {
  const key = process.env.VITE_API_KEY;
  if (!key) return undefined;
  try {
    const q = encodeURIComponent(`${adresse}, Trondheim`);
    const res = await hent(
      `https://fritekstsok.api.norkart.no/suggest/custom?Query=${q}&Targets=gateadresse`,
      { headers: { 'X-WAAPI-TOKEN': key, Accept: 'application/json' } }
    );
    const p = (await res.json())?.Options?.[0]?.PayLoad?.Posisjon;
    return p ? [p.X, p.Y] : undefined;
  } catch {
    return undefined;
  }
}

async function nominatim(q: string): Promise<[number, number] | undefined> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&viewbox=${BBOX.minLng},${BBOX.maxLat},${BBOX.maxLng},${BBOX.minLat}&bounded=1&q=${encodeURIComponent(q)}`;
    const j = await (await hent(url)).json();
    return j?.[0] ? [Number(j[0].lon), Number(j[0].lat)] : undefined;
  } catch {
    return undefined;
  }
}

const iTrondheim = (lng: number, lat: number) =>
  lat >= BBOX.minLat &&
  lat <= BBOX.maxLat &&
  lng >= BBOX.minLng &&
  lng <= BBOX.maxLng;

// --- main -------------------------------------------------------------------

async function main() {
  lesEnv();
  const overrides: Record<string, Override> = existsSync(
    'scripts/overrides.json'
  )
    ? JSON.parse(readFileSync('scripts/overrides.json', 'utf8'))
    : {};

  console.log('Henter', LISTE);
  const html = await hentTekst(LISTE);
  let rader = fraJson(html);
  console.log(`  JSON-strategi: ${rader.length} steder`);
  if (rader.length < 5) {
    rader = fraHtml(html);
    console.log(`  HTML-strategi: ${rader.length} steder`);
  }
  if (rader.length < 5) {
    debug('liste.html', html);
    throw new Error(
      'Fant for få steder. Rå-HTML lagret i scripts/debug/liste.html – juster parseren.'
    );
  }

  // Bydel fra underlistene
  const bydeler = bydelLenker(html);
  console.log(
    `  ${bydeler.length} bydeler: ${bydeler.map((b) => b.navn).join(', ')}`
  );
  for (const b of bydeler) {
    try {
      const sub = await hentTekst(b.url);
      const navn = new Set(
        [...fraJson(sub), ...fraHtml(sub)].map((r) => r.navn)
      );
      rader
        .filter((r) => navn.has(r.navn) && !r.bydel)
        .forEach((r) => (r.bydel = b.navn));
    } catch (e) {
      console.warn('  bydel feilet', b.url, (e as Error).message);
    }
  }

  // Detaljer + geokoding
  const ut = [];
  for (const r of rader) {
    const o = overrides[r.navn] ?? {};
    if (o.skip) continue;
    await detaljer(r);
    let pos: [number, number] | undefined =
      o.lat && o.lng
        ? [o.lng, o.lat]
        : r.lat && r.lng
          ? [r.lng, r.lat]
          : undefined;
    let kilde = pos ? (o.lat ? 'override' : 'pilsguiden') : '';
    if (!pos && r.adresse) {
      pos = await norkart(r.adresse);
      kilde = 'norkart';
    }
    if (!pos) {
      pos = await nominatim(`${r.navn}, Trondheim`);
      kilde = 'nominatim';
    }
    if (!pos || !iTrondheim(pos[0], pos[1])) {
      console.warn(
        `  ✗ ${r.navn}: ingen gyldig posisjon (${kilde}) – legg inn i scripts/overrides.json`
      );
      continue;
    }
    console.log(`  ✓ ${r.navn} ${r.pris},- [${kilde}]`);
    ut.push({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: pos },
      properties: {
        id: slug(r.navn),
        navn: r.navn,
        pris: o.pris ?? r.pris,
        happyHour: r.happyHour,
        bydel: r.bydel || 'Ukjent',
        ...((o.guinness ?? r.guinness) ? { guinness: true } : {}),
      },
    });
  }

  if (ut.length < 5)
    throw new Error(
      `Bare ${ut.length} steder med posisjon – skriver ikke over ${UT}.`
    );
  writeFileSync(
    UT,
    JSON.stringify({ type: 'FeatureCollection', features: ut }, null, 2) + '\n'
  );
  console.log(
    `\nSkrev ${ut.length} steder til ${UT} (${rader.length - ut.length} hoppet over).`
  );
}

main().catch((e) => {
  console.error('Skraping feilet:', e.message);
  process.exit(1);
});
