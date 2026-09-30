# Plan: Ølkart Trondheim

Fork av [Norkart/norkart-webkurs-React](https://github.com/Norkart/norkart-webkurs-React) (React 19, TypeScript, MapLibre via `maplibre-react-components`, MUI 7, Vite 7). Appen viser ølpriser fra [pilsguiden.no/liste/trondelag/trondheim](https://www.pilsguiden.no/liste/trondelag/trondheim) på kartet.

## Sjekket mot upstream (2026-09-30)

| Krav eller antakelse | Status i upstream | Konsekvens for planen |
|---|---|---|
| Fork prosjektet | Det eneste obligatoriske steget i README | Dette repoet er tomt. Steg 0 henter inn upstream. |
| `.env` med `VITE_API_KEY`, aldri committet | `.gitignore` inneholder `.env`, og README sier det eksplisitt | Behold. Legg til `.env.example` uten nøkkel. |
| `getAdresserFromSearchText` | Finnes og er implementert. Signatur: `(searchText) => Options[]`. Posisjonen ligger i `PayLoad.Posisjon.X` (lng) og `.Y` (lat). | Kan brukes direkte i appen. I Node finnes ikke `import.meta.env`, så skriptet må kalle endepunktet selv (se steg 1). |
| `getRuteMellomPunkter` | Tom stub. URL og `postData` (SrsId 4326) er klare. | Må implementeres (Oppgave 5). |
| `RPopup` | Eksporteres av `maplibre-react-components`, men brukes ikke ennå | Kan brukes direkte. |
| `RSource` og `RLayer` | Finnes bare som eksempel i README | Følg samme mønster. |
| Bydel-polygoner | Finnes ikke. Eneste polygondata er `befolkning_5km.json`. | Koropletten trenger ekstern polygondata (steg 4c). |
| `tsx`/`ts-node` | Ikke installert. `"type": "module"`, Node 22.14 (`.nvmrc`). | `npm i -D tsx` og kjør med `node --env-file=.env`. |
| `@mui/icons-material` | Ikke installert | Bruk `Chip` eller emoji (⏰). Ingen ny avhengighet. |
| Tester | Ingen testskript | Verifiser med `npm run build`, `npm run lint` og manuelt i `npm run dev`. |
| Lint-baseline | 0 feil, 12 advarsler (ubrukte variabler i stubber) | Ikke flere feil. Antallet advarsler skal ikke øke. |
| Deploy | Ikke påkrevd. `homepage` peker på Norkarts gh-pages. | Ikke rør `homepage` eller `gh-pages`. |

**Blokkert her:** pilsguiden.no ble avvist av nettverkspolicyen i denne sky-sesjonen, så HTML-strukturen er ikke kartlagt. Steg 1a må derfor kjøres lokalt eller etter at `www.pilsguiden.no` er lagt til i miljøets tillatte domener. Det samme gjelder sannsynligvis `nominatim.openstreetmap.org`.

## Steg 0: Oppsett (1 commit)
```bash
git remote add upstream https://github.com/Norkart/norkart-webkurs-React.git
git fetch upstream
git merge upstream/main --allow-unrelated-histories   # sjekk branch-navnet
npm ci
npm run build && npm run lint                         # baseline
```
- Lag `.env` lokalt og sjekk at `git status` ikke viser den.
- Commit `.env.example` med `VITE_API_KEY=`.

## Steg 1: Data (`scripts/scrape.ts`, kjøres én gang, er ikke del av appen)
**1a. Rekognosering.** Krever nettilgang.
- Er lista server-rendret, eller kommer den fra JSON (`__NEXT_DATA__`, XHR)? Bruk JSON-kilden hvis den finnes.
- Finn selektorer for navn, pris og ⏰, og sjekk at prisen gjelder 0,5 l. Normaliser andre volumer, eller forkast dem.
- Finn bydel-slugs (for eksempel `/midtbyen`). Skrap hver bydelsliste for å få koblingen sted → bydel.
- Undersøk om stedssidene har adresse eller koordinater (JSON-LD, kartinnbygging).
- Les `robots.txt` og vilkårene. Begrens raten til 1 forespørsel/s og sett en egen User-Agent.

**1b. Skript**
- `npm i -D tsx`, og legg til `"scrape": "tsx --env-file=.env scripts/scrape.ts"`.
- Geokoding, i denne rekkefølgen:
  1. Koordinater fra pilsguiden, hvis de finnes.
  2. Adresse → Norkart fritekstsøk. Skriptet kaller samme URL som `src/api/getAdresserFromSearchText.ts` (`https://fritekstsok.api.norkart.no/suggest/custom?Query=…&Targets=gateadresse`, header `X-WAAPI-TOKEN: process.env.VITE_API_KEY`). `src/` skal ikke endres for dette.
  3. Nominatim med `"navn, Trondheim"`. Maks 1 forespørsel/s, og User-Agent må settes (krav i bruksvilkårene).
- Manuelle rettelser legges i `scripts/overrides.json`, med `{ navn: {lat, lng} }`, og slås inn til slutt. Skriptet logger steder som havner utenfor bbox for Trondheim (ca. 63.3–63.5 N, 10.2–10.6 Ø).
- Resultatet skrives til `src/sample_data/olpriser.json`: `{navn, pris, happyHour, bydel, lat, lng}[]`. Legg typen `Olpris` i `src/types.ts`.
- Commits: (1) skript og avhengighet, (2) JSON-data, (3) overrides.

**1c. Kildekreditering.** Legg «Priser: Pilsguiden.no» med lenke og datoen dataene ble hentet i `Overlay`, eller som MapLibre `customAttribution`.

## Steg 2: Kart (`src/components/OlLayer.tsx`)
- `useMemo` bygger en GeoJSON FeatureCollection fra den filtrerte lista.
- `<RSource id="ol" type="geojson" data={fc}/>` og `<RLayer id="ol-circle" type="circle">` med:
  - `circle-color`: `['interpolate',['linear'],['get','pris'], min,'#1a9850', median,'#fee08b', max,'#d73027']`
  - `circle-radius`: `['interpolate',['linear'],['get','pris'], min,5, max,14]`, samt `circle-stroke-width` 1.
  - min, median og max regnes ut fra dataene. Delte konstanter legges i `src/utils/pris.ts`, slik at legenden bruker de samme.
- Klikk: bruk `onClick` på laget (eller `queryRenderedFeatures` i `MapLibreMap`) og sett `valgtBar`. Da vises `<RPopup longitude latitude>` med navn, pris og en ⏰ `Chip` hvis happy hour.
- Commit: «Vis ølpriser som sirkellag med popup».

## Steg 3: UI (MUI, i `Overlay`)
- `Slider` for makspris, fra min til max.
- `Switch`: «Kun happy hour».
- `Topp5Liste`: `useMap()` og `moveend` gir `getBounds()`. Filtrer stedene til synlig område, sorter på pris og vis de 5 første i en `List`. Klikk på en rad kjører `flyTo` og åpner popupen.
- `Legend`: en gradientstripe grønn → gul → rød med min/median/max i kr.
- `MedianBoks`: medianpris for gjeldende filter.
- Filtertilstanden (`maxPris`, `kunHH`) løftes til `MapLibreMap`, og alle komponentene leser fra samme filtrerte liste.
- Én commit per komponent.

## Steg 4: Bonus
**4a. Oppgave 2: «Billigste øl nærmest meg».** `SearchBar` bruker `getAdresserFromSearchText` og gir en valgt adresse. Regn haversine-avstand til alle filtrerte steder. «Billigste nær meg» er billigste sted innenfor N km (MUI-slider, standard 1 km), eller en score. Marker valgt adresse og vis resultatet, med `MapFlyTo`.

**4b. Oppgave 5: Rute.** Fyll inn stubben i `getRuteMellomPunkter`: `fetch(url, {method:'POST', headers:{'X-WAAPI-TOKEN', 'Content-Type':'application/json'}, body: JSON.stringify(postData)})`, og returner `{RouteGeometry, CostList}`. Tegn ruten fra adressen til billigste bar med et `line`-lag, og vis reisetiden fra `CostList`.

**4c. Koroplett: median per bydel.**
- Hent bydelspolygoner for Trondheim (for eksempel SSB/Geonorge grunnkretser eller Trondheim kommunes åpne data) i `scripts/`, forenkle dem og lagre til `src/sample_data/bydeler.json`.
- Slå sammen `bydel`-slugs fra pilsguiden med polygonnavnene gjennom en eksplisitt mappingtabell.
- Median per bydel legges i `properties`. Tegn et `fill`-lag med 0.4 opacity under sirkellaget, med en toggle.
- Fallback hvis det ikke finnes egnede polygoner: median per rute i et hex- eller rutenett.

## Regler
- `.env` committes aldri. Kjør `git diff --cached --name-only | grep -x .env` før hver commit.
- Små commits per steg. `npm run build && npm run lint` må passere før hver push.
- Endringer i upstream-filer holdes så små som mulig: `MapLibreMap.tsx`, `Overlay.tsx`, `SearchBar.tsx` og stubben `getRuteMellomPunkter.ts`. Ingenting annet.

## Akseptsjekk (til slutt)
- [ ] Repoet er en fork av upstream, og `.env` finnes ikke i historikken (`git log --all -- .env` er tom).
- [ ] `npm run build` er grønn, og `npm run lint` gir 0 feil og ≤ 12 advarsler.
- [ ] Sirkelfargen går fra grønn til rød, og radiusen øker med prisen.
- [ ] Popupen viser navn, pris og ⏰.
- [ ] Slider og happy hour-toggle filtrerer kartet, topp 5, legenden og medianen samtidig.
- [ ] Topp 5 oppdateres når kartet flyttes.
- [ ] Pilsguiden er kreditert i UI.
- [ ] Bonus: adressesøk gir billigste bar i nærheten med rute og reisetid, og koropletten kan slås av og på.
