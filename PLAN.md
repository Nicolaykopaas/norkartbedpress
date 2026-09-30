# Plan: Pilsrunden Trondheim (Oppgave 5 og 6)

Fork av [Norkart/norkart-webkurs-React](https://github.com/Norkart/norkart-webkurs-React). Upstream er sjekket på commit `15ef546` («Allow any»).

**Mål**
1. **Oppgave 6 (egne åpne geodata):** vise steder som selger pils, og hva pilsen koster. Data kommer fra [pilsguiden.no/liste/trondelag/trondheim](https://www.pilsguiden.no/liste/trondelag/trondheim).
2. **Oppgave 5 (rute):** vise en bar-til-bar-rute («pilsrunde») der hvert stopp er billigere enn det forrige, fra dyr til billig pils.

Andre oppgaver (1–4) og ekstrafunksjoner som slider, topp 5 og koroplett er ikke med.

---

## Sjekket mot upstream

| Krav eller antakelse | Funnet i upstream | Konsekvens |
|---|---|---|
| Fork, `.env` med `VITE_API_KEY`, `.env` skal aldri committes | README krever dette, og `.gitignore` inneholder `.env` | Steg 0. Legg til `.env.example` uten verdi. |
| `getRuteMellomPunkter.ts` | En stub med ferdig `postData`. URL: `POST https://ruteberegner.api.norkart.no/Route/Expanded`. `SrsId: 4326`, `GraphName: 'ta-norden-dynamic'`, `CostFunction: 'time'`, **`ViaPoints: []`**. Svaret har `RouteGeometry` (GeoJSON MultiLineString) og `CostList`. | Implementer fetch-kallet som i `getHoydeFromPunkt` (header `X-WAAPI-TOKEN`). **`ViaPoints` gjør at hele runden kan hentes i ett kall.** |
| Grafen er en **kjøre**graf (`FeatureSnapRestriction: ['Road','Motorway']`) | README kaller det «kjørerute» | En pilsrunde bør gå til fots. Sjekk om det finnes en gange-graf (se steg 3a). Hvis ikke brukes kjøreruten, og UI-et kaller det «rute» og ikke «gåtid». |
| Oppgave 5 bygger på to klikk (`startPunkt` → `rute`) | Mønster i README med `RSource` og `RLayer type="line"` | Behold mønsteret, men la startpunktet være en bar man klikker på i stedet for et fritt punkt. |
| Ekstraoppgave: vis `CostList` | Står i README | Vis total tid og antall stopp i et MUI Card. |
| `RPopup`, `RSource`, `RLayer`, `useMap` | Eksporteres av `maplibre-react-components` | Ingen nye kartavhengigheter trengs. |
| `onMapClick` kaller `getHoydeFromPunkt` (Oppgave 1) | Står i `MapLibreMap.tsx` | Fjern eller erstatt dette. Kartklikk brukes nå til å velge bar. |
| Oppgave 6: «Visualiser din egen data — lag GeoJSON» | Står i README | `olpriser.json` gjort om til GeoJSON oppfyller dette. |
| Tester og CI | Ingen testskript. Bygg og lint er grønne, med 0 feil og 12 advarsler. | Sjekk med `npm run build`, `npm run lint` og manuell test i `npm run dev`. |

**Åpne blokkeringer**
- `www.pilsguiden.no` (og sannsynligvis Nominatim) er blokkert av nettverkspolicyen i skymiljøet. HTML-strukturen og om stedene har adresse er derfor **ikke kartlagt**. Rekognoseringen (steg 1a) må kjøres lokalt eller etter at domenet er åpnet.
- Ruteberegner-API-et er ikke testet herfra fordi API-nøkkelen mangler. Det gjelder både svarformatet og om `ViaPoints` og en gange-graf fungerer. Dette avklares i steg 3a.

---

## Steg 0: Oppsett
- `git remote add upstream …`, `git fetch`, deretter `git merge upstream/main --allow-unrelated-histories`.
- Kjør `npm ci`.
- Opprett `.env` lokalt og sjekk at `git status` ikke viser den.
- Commit `.env.example`.
- Kjør baseline med `npm run build` og `npm run lint`.

## Steg 1: Data til Oppgave 6 (`scripts/scrape.ts`, kjøres én gang)
**1a. Rekognosering.** Krever nettilgang.
- Er lista HTML eller JSON?
- Finn selektorer for navn, pris (0,5 l), happy hour og bydel.
- Undersøk om stedssidene har adresse eller koordinater.
- Les `robots.txt` og vilkårene for bruk.

**1b. Skript**
- Installer med `npm i -D tsx` og kjør med `tsx --env-file=.env scripts/scrape.ts`.
- Rate-limit på 1 forespørsel/s og en egen User-Agent.
- Geokoding, i denne rekkefølgen:
  1. Koordinater fra pilsguiden.
  2. Adresse → Norkart fritekstsøk. Skriptet kaller samme URL som `getAdresserFromSearchText`, men med `process.env`, siden `import.meta.env` ikke finnes i Node.
  3. Nominatim med «navn, Trondheim».
  4. Manuelle rettelser i `scripts/overrides.json`.
- Skriptet varsler om punkter som havner utenfor bbox for Trondheim.

**1c. Resultat**
- Skriv til `src/sample_data/olpriser.json` som en GeoJSON `FeatureCollection<Point>` med properties `{id, navn, pris, happyHour, bydel}`.
- Legg typer i `src/types/ol.ts`.
- Vis kildekreditering til Pilsguiden, med dato, i UI.

## Steg 2: Vise pilssteder (Oppgave 6, i appen)
- Lag `src/components/PilsLayer.tsx` med `RSource` (geojson) og `RLayer type="circle"`:
  - `circle-color`: `interpolate` på `pris`, fra grønn (billig) via gul til rød (dyr).
  - `circle-radius`: `interpolate` på `pris`.
  - min og maks beregnes fra dataene i `src/utils/pris.ts`.
- `RLayer type="symbol"` viser prisen som tekst («89,-») når zoom er 14 eller mer.
- Klikk på et punkt åpner `RPopup` med navn, pris og ⏰ happy hour. Popupen har knappen **«Start pilsrunde herfra»**.
- En enkel legend viser fargeskalaen i `Overlay`.

## Steg 3: Pilsrunden (Oppgave 5)
**3a. Avklar API-et først.** Dette er et spike på én gang, uten å endre koden i appen.
- Implementer fetch-kallet i `getRuteMellomPunkter` og logg svaret.
- Undersøk om `ViaPoints` gir én samlet `RouteGeometry`, og hvordan `CostList` ser ut, med totalsum eller per etappe.
- Undersøk om det finnes en gange-graf eller gangfunksjon (spør kursholder, eller prøv `GraphName`/`FeatureSnapRestriction`).
- Utvid signaturen på en bakoverkompatibel måte: `getRuteMellomPunkter(startX, startY, stoppX, stoppY, via: [number, number][] = [])`. Da fungerer README-eksempelet fortsatt.

**3b. Algoritme** (en ren funksjon i `src/utils/pilsrunde.ts`, uten kart- eller API-avhengighet)
- Input:
  - startbar
  - alle barer
  - `maksStopp` (standard 5)
  - `maksAvstandMeter` per etappe (standard 800 m)
- Grådig valg: neste stopp er den **nærmeste** baren med **lavere pris** enn nåværende og innenfor `maksAvstandMeter` (haversine). Ved lik avstand velges laveste pris.
- Stopp når `maksStopp` er nådd, eller når det ikke finnes billigere barer i nærheten.
- Output: en ordnet liste med barer. Prisen synker strengt fra stopp til stopp.
- Alternativ modus «Fra dyreste»: startbaren er den dyreste i Midtbyen eller i synlig område. Ellers er algoritmen den samme.

**3c. Rute og visning**
- Én ruteforespørsel: Start = første bar, Stop = siste bar, `ViaPoints` = barene imellom.
  - Fallback hvis `ViaPoints` ikke fungerer: N−1 kall med `Promise.all`, og geometriene slås sammen til én FeatureCollection.
- Tegn ruten med `RSource id="rute"` og `RLayer type="line"`. Ekstra (om fallback): farge per etappe ut fra prisen ved start av etappen (`line-gradient` eller én feature per etappe).
- Nummererte markører for stoppene 1..N (symbol-lag).
- MUI Card «Pilsrunde»:
  - En liste med stoppene og prisen på hvert, for eksempel 1. X – 119,- → 2. Y – 99,-.
  - Total rutetid fra `CostList` (ekstraoppgaven i Oppgave 5).
  - Hvor mye man sparer per pils fra første til siste stopp.
  - Knapp: «Nullstill».
- Behold det opprinnelige to-klikk-mønsteret fra README som reserve. Hvis man klikker i kartet utenfor en bar, går ruten fra dette startpunktet til nærmeste billigere bar.

## Filer som berøres
- **Nye:**
  - `scripts/scrape.ts`
  - `scripts/overrides.json`
  - `src/sample_data/olpriser.json`
  - `src/types/ol.ts`
  - `src/utils/pris.ts`
  - `src/utils/pilsrunde.ts`
  - `src/components/PilsLayer.tsx`
  - `src/components/PilsrundeCard.tsx`
  - `src/components/PrisLegend.tsx`
  - `.env.example`
- **Endres (minimalt):**
  - `src/api/getRuteMellomPunkter.ts`
  - `src/components/MapLibreMap.tsx`
  - `package.json` (`tsx` og scriptet `scrape`)
- Ingenting annet røres.

## Commits (små, én per punkt)
1. Upstream-oppsett og `.env.example`
2. Skrapeskript
3. Data (`olpriser.json`)
4. Pilslag og popup
5. Legend og kreditering
6. `getRuteMellomPunkter`
7. `pilsrunde.ts`
8. Rute og markører
9. PilsrundeCard

Før hver push må `npm run build` og `npm run lint` passere, og `.env` må ikke være staget.

## Akseptsjekk
- [ ] Repoet er en fork. `.env` finnes ikke i historikken, og `git log --all -- .env` er tom.
- [ ] `npm run build` er grønn. `npm run lint` gir 0 feil og ≤ 12 advarsler.
- [ ] **Oppgave 6:** alle pilssteder vises med farge og størrelse etter pris, og popupen viser navn, pris og happy hour. Pilsguiden er kreditert.
- [ ] **Oppgave 5:** `getRuteMellomPunkter` er implementert, og ruten tegnes som et `line`-lag.
- [ ] **Pilsrunde:** fra en valgt bar vises en rute med 2–5 stopp der prisen synker strengt, med nummererte stopp.
- [ ] **Ekstraoppgave 5:** reisetiden fra `CostList` vises i et Card.

## Beslutninger du bør ta før koding
1. Gange eller kjøring? Hvis det ikke finnes en gange-graf, godtar vi kjøreruten?
2. Standardverdier for `maksStopp` (5) og `maksAvstandMeter` (800 m)?
3. Skal startpunktet være en bar brukeren klikker på (standard) eller alltid den dyreste?
