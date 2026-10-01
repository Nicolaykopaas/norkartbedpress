// Finner ekte foto til stedene i src/sample_data/aktiviteter.json fra
// Wikimedia Commons (geotaggede bilder nær stedet) og legger dem inn som
// `foto` med kreditering. Kjør: node scripts/hent-bilder.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const FIL = new URL('../src/sample_data/aktiviteter.json', import.meta.url);
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = { 'User-Agent': 'byvandring-trondheim/1.0 (https://github.com/Nicolaykopaas/norkartbedpress)' };

const data = JSON.parse(readFileSync(FIL, 'utf-8'));

const rens = (s) => s.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim();
const ord = (navn) =>
  navn
    .toLowerCase()
    .split(/[^a-zæøå0-9]+/)
    .filter((t) => t.length >= 4 && !['trondheim', 'kafe', 'park', 'plass'].includes(t));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  for (let i = 0; i < 4; i++) {
    try {
      const svar = await fetch(url, { headers: UA, signal: AbortSignal.timeout(30000) });
      if (svar.ok) return await svar.json();
    } catch {
      /* prøv igjen */
    }
    await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
  }
  return undefined;
}

async function finnFoto(sted) {
  const [lon, lat] = sted.geometry.coordinates;
  const { navn, kategori } = sted.properties;
  const geo = await api({
    action: 'query',
    list: 'geosearch',
    gscoord: `${lat}|${lon}`,
    gsradius: kategori === 'se' || kategori === 'tur' ? '250' : '120',
    gsnamespace: '6',
    gslimit: '15',
  });
  const treff = geo?.query?.geosearch ?? [];
  if (treff.length === 0) return undefined;

  const info = await api({
    action: 'query',
    titles: treff.map((t) => t.title).join('|'),
    prop: 'imageinfo',
    iiprop: 'url|mime|extmetadata',
    iiurlwidth: '640',
  });
  const sider = Object.values(info?.query?.pages ?? {});
  const tokens = ord(navn);
  const kandidater = sider
    .map((p) => {
      const ii = p.imageinfo?.[0];
      const dist = treff.find((t) => t.title === p.title)?.dist ?? 999;
      const tittel = p.title.toLowerCase();
      const treffNavn = tokens.some((t) => tittel.includes(t));
      return { p, ii, dist, treffNavn };
    })
    .filter((k) => k.ii && /^image\/(jpeg|png)$/.test(k.ii.mime))
    // Landemerker kan bruke nærmeste bilde, andre steder må navnet stemme
    .filter((k) => k.treffNavn || kategori === 'se' || kategori === 'tur')
    .sort((a, b) => Number(b.treffNavn) - Number(a.treffNavn) || a.dist - b.dist);
  const valgt = kandidater[0];
  if (!valgt) return undefined;
  const m = valgt.ii.extmetadata ?? {};
  return {
    url: valgt.ii.thumburl ?? valgt.ii.url,
    side: valgt.ii.descriptionurl,
    forfatter: rens(m.Artist?.value ?? 'Ukjent'),
    lisens: rens(m.LicenseShortName?.value ?? 'Se kilde'),
  };
}

let funnet = 0;
for (const s of data.features) {
  const foto = await finnFoto(s);
  if (foto) {
    s.properties.foto = foto;
    funnet++;
  }
  console.log(foto ? 'OK ' : '-- ', s.properties.kategori, s.properties.navn);
  await new Promise((r) => setTimeout(r, 400));
}
writeFileSync(FIL, JSON.stringify(data, null, 1));
console.log(`Bilde funnet for ${funnet} av ${data.features.length} steder`);
