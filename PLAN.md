# Plan: Pubgolf Trondheim (Oppgave 5 og 6)

Fork av [Norkart/norkart-webkurs-React](https://github.com/Norkart/norkart-webkurs-React). Upstream er sjekket på commit `15ef546` («Allow any»). Planen er ikke kodet ennå.

## Idé
Et kart over pubgolf i Trondheim:
1. **Oppgave 6 (egne åpne geodata):** kartet viser alle stedene som selger pils, med pris. Dataene kommer fra [pilsguiden.no/liste/trondelag/trondheim](https://www.pilsguiden.no/liste/trondelag/trondheim).
2. **Oppgave 5 (rute):** appen setter opp en pubgolfbane med 9 hull (eller 6). Hvert hull er en bar. Rekkefølgen går fra dyr til billigere pils, og ruten tegnes bar til bar med Norkarts ruteberegner.
3. **Pubgolf:** hvert hull har en drink og en **par**, som er anbefalt antall slurker. Et scorekort registrerer slurker per spiller og regner ut score mot par og hva runden koster. Bonus for **«Split the G»** på Guinness-hull.

Oppgave 1–4, slider, topp 5 og koroplett er ikke med.

---

## Sjekket mot upstream

| Krav eller antakelse | Funnet i upstream | Konsekvens |
|---|---|---|
| Fork, `.env` med `VITE_API_KEY`, `.env` skal aldri committes | README krever dette, og `.gitignore` inneholder `.env` | Steg 0. Legg til `.env.example` uten verdi. |
| `getRuteMellomPunkter.ts` | En stub med ferdig `postData`. URL: `POST https://ruteberegner.api.norkart.no/Route/Expanded`. `SrsId: 4326`, `GraphName: 'ta-norden-dynamic'`, `CostFunction: 'time'`, **`ViaPoints: []`**. Svaret har `RouteGeometry` (GeoJSON MultiLineString) og `CostList`. | Implementer fetch-kallet som i `getHoydeFromPunkt` (header `X-WAAPI-TOKEN`). `ViaPoints` gjør at hele banen kan hentes i ett kall. |
| Grafen er en **kjøre**graf (`FeatureSnapRestriction: ['Road','Motorway']`) | README kaller det «kjørerute» | Pubgolf går til fots. Sjekk om det finnes en gange-graf (steg 3a). Hvis ikke brukes kjøreruten, og UI-et kaller det «rute» og ikke «gåtid». |
| Oppgave 5-mønster: to klikk → `rute` → `RLayer type="line"` | Står i README | Følg samme mønster. Startbaren velges med klikk. |
| Ekstraoppgave: vis `CostList` | Står i README | Vis total rutetid i scorekortet. |
| `RPopup`, `RSource`, `RLayer`, `useMap` | Eksporteres av `maplibre-react-components` | Ingen nye kartavhengigheter. |
| MUI | `@mui/material` 7 er installert. `@mui/icons-material` er ikke installert. | Scorekortet bygges med MUI `Table`, `Card` og `Chip`. Ikoner lages med emoji, uten nye avhengigheter. |
| `onMapClick` kaller `getHoydeFromPunkt` (Oppgave 1) | Står i `MapLibreMap.tsx` | Erstatt dette. Kartklikk brukes nå til å velge bar. |
| Oppgave 6: «Visualiser din egen data — lag GeoJSON» | Står i README | `olpriser.json` som GeoJSON oppfyller dette. |
| Tester og CI | Ingen testskript. Bygg og lint er grønne, med 0 feil og 12 advarsler. | Sjekk med `npm run build`, `npm run lint` og manuell test i `npm run dev`. |

**Åpne blokkeringer**
- `www.pilsguiden.no` og sannsynligvis Nominatim er blokkert av nettverkspolicyen i skymiljøet. Strukturen på Pilsguiden er **ikke kartlagt**. Steg 1a må kjøres lokalt eller etter at domenet er åpnet.
- Ruteberegneren er ikke testet, fordi API-nøkkelen mangler. `ViaPoints` og om det finnes en gange-graf avklares i steg 3a.
- **Pilsguiden sier ikke hvilke barer som har Guinness.** Dette må legges inn manuelt (se 1c).

---

## Steg 0: Oppsett (følger README)
1. Fork [Norkart/norkart-webkurs-React](https://github.com/Norkart/norkart-webkurs-React) med fork-knappen og standardinnstillinger. Da får du `nicolaykopaas/norkart-webkurs-React`.
2. Klon forken: `git clone https://github.com/nicolaykopaas/norkart-webkurs-React.git`
3. Kjør `npm install`.
4. Lag `.env` i rotmappa med `VITE_API_KEY=<nøkkel>`. Sjekk at `git status` ikke viser den.
5. Kjør `npm run dev` og åpne http://localhost:5173/.
6. Kopier denne `PLAN.md` inn i forken og commit den sammen med `.env.example`.
7. Kjør `npm run build` og `npm run lint` som utgangspunkt.

`norkartbedpress`-repoet brukes ikke til koden. Det holdt bare planen.

## Steg 1: Data (`scripts/scrape.ts`, kjøres én gang)
**1a. Rekognosering** (trenger nettilgang)
- Er lista HTML eller JSON?
- Finn selektorer for navn, pris (0,5 l), happy hour og bydel.
- Sjekk om stedssidene har adresse eller koordinater.
- Les `robots.txt` og vilkårene.

**1b. Skript**
- Installer med `npm i -D tsx`. Kjør med `tsx --env-file=.env scripts/scrape.ts`.
- Maks 1 forespørsel/s og en egen User-Agent.
- Geokoding, i denne rekkefølgen:
  1. Koordinater fra Pilsguiden.
  2. Adresse → Norkart fritekstsøk. Skriptet kaller samme URL som `getAdresserFromSearchText`, men bruker `process.env`.
  3. Nominatim med «navn, Trondheim».
  4. `scripts/overrides.json`.
- Varsle om punkter som havner utenfor bbox for Trondheim.

**1c. Resultat**
- `src/sample_data/olpriser.json` er en GeoJSON `FeatureCollection<Point>` med properties `{id, navn, pris, happyHour, bydel, guinness?}`.
- `guinness: true` settes manuelt i `scripts/overrides.json`. Uten flagg kan man likevel markere et hull som Guinness-hull i oppsettet (steg 4a).
- Typer ligger i `src/types/ol.ts`.
- UI viser kildekreditering til Pilsguiden med dato.

## Steg 2: Kart over pilssteder (Oppgave 6)
- `src/components/PilsLayer.tsx`:
  - `RSource` (geojson) og `RLayer type="circle"`.
  - `circle-color` er en `interpolate` på `pris`: grønn (billig) → gul → rød (dyr).
  - `circle-radius` følger prisen.
  - Guinness-steder får en mørk ring (`circle-stroke-color`).
- `RLayer type="symbol"` viser prisen som tekst («89,-») ved zoom ≥ 14.
- Klikk åpner en `RPopup` med:
  - navn, pris og ⏰ happy hour
  - 🍀 Guinness hvis stedet har det
  - knappen **«Start pubgolf herfra»**
- `PrisLegend` viser fargeskalaen.

## Steg 3: Banen (Oppgave 5)
**3a. API-spike** (én gang, før appkoden)
- Implementer fetch-kallet i `getRuteMellomPunkter` og logg svaret.
- Sjekk om `ViaPoints` gir én geometri, og hvordan `CostList` ser ut per etappe.
- Sjekk om det finnes en gange-graf.
- Utvid signaturen bakoverkompatibelt:

  ```ts
  getRuteMellomPunkter(startX, startY, stoppX, stoppY, via: [number, number][] = [])
  ```

**3b. Banealgoritme** (`src/utils/bane.ts`, en ren funksjon)
- Input: `startbar`, `barer`, `antallHull` (9 som standard, eller 6) og `maksAvstandMeter` per etappe (800 m som standard).
- Neste hull er den **nærmeste** baren som er **billigere enn eller like billig som** den forrige, innenfor maksavstanden, og som ikke allerede er brukt. Prisen synker da (ikke nødvendigvis strengt), fra dyr til billig.
- Finnes ingen slik bar, øker radiusen trinnvis til 1500 m. Ellers slutter banen tidlig, og UI-et sier fra.
- Valgfritt: plasser minst ett Guinness-sted på banen hvis det finnes et innenfor rekkevidde.
- Output er en ordnet liste med hull `{nr, bar}`.

**3c. Rute på kartet**
- Ett kall: `Start` = hull 1, `Stop` = siste hull, `ViaPoints` = hullene imellom.
- Hvis `ViaPoints` ikke fungerer, brukes N−1 kall med `Promise.all`.
- Kartlag:
  - `RLayer type="line"` for ruten.
  - Nummererte hull-markører (1–9) som `symbol`-lag med flagg-emoji ⛳.
  - Aktivt hull er uthevet.

## Steg 4: Pubgolf
**4a. Par per hull** (`src/utils/par.ts`, konfigurerbar tabell)

| Drink | Standard par (slurker) | Merknad |
|---|---|---|
| Pils 0,5 l | 4 | Standard for alle hull |
| Guinness 0,5 l | 5 | «Split the G»-bonus er mulig |
| Cider / seltzer | 3 | |
| Shot | 1 | Maks ett shot-hull per bane |
| Alkoholfritt | 4 | Kan velges på alle hull, og teller likt |

- Standardbanen er pils på alle hull. Guinness-steder foreslår Guinness. I oppsettet kan man endre drink og par per hull (MUI `Select` og `TextField type=number`).
- Par for banen er summen av par per hull, typisk rundt 36 for 9 hull.

**4b. Scorekort** (`src/components/Scorekort.tsx`, MUI `Card` og `Table`)
- Spillere: legg til og fjern navn.
- Hver rad er ett hull: hull, bar, drink, pris, par og slurker per spiller (stepper −/+).
- Score per hull er slurker − par. Visningen er golf-stil: birdie (−1), eagle (−2), bogey (+1), og så videre, med farge-`Chip`.
- **Bonus for «Split the G»:** på Guinness-hull har hver spiller en avkrysning «Split the G ✔». Det gir **−1 slag** (konfigurerbart). Bonusen vises separat i summen.
- Totalen viser slag, totalt mot par, bonus og netto for hver spiller. Leder har 🏆.
- Kostnad: sum av prisene på banen per spiller («Runden koster 812 kr»), og total rutetid fra `CostList` (ekstraoppgaven i Oppgave 5).
- Tilstanden lagres i `localStorage` med try/catch, slik at runden overlever en reload. Knappen «Ny runde» nullstiller.
- En kort linje om å drikke ansvarlig og ta med vann. Alkoholfritt er et likeverdig valg.

**4c. Kobling mellom kart og scorekort**
- Klikk på et hull i scorekortet får kartet til å fly dit og åpner popupen.
- Popupen på et hull på banen viser «Hull 3 · Par 4 · 99,-».

## Filer som berøres
**Nye filer**
- `scripts/scrape.ts`, `scripts/overrides.json`
- `src/sample_data/olpriser.json`
- `src/types/ol.ts`
- `src/utils/pris.ts`, `src/utils/bane.ts`, `src/utils/par.ts`
- `src/components/PilsLayer.tsx`, `src/components/PrisLegend.tsx`, `src/components/BaneLayer.tsx`, `src/components/Scorekort.tsx`
- `.env.example`

**Endres minimalt**
- `src/api/getRuteMellomPunkter.ts`
- `src/components/MapLibreMap.tsx`
- `package.json` (`tsx` og scriptet `scrape`)

Ingenting annet røres.

## Commits (små, én per punkt)
1. Upstream-oppsett og `.env.example`
2. Skrapeskript
3. Data
4. Pilslag og popup
5. Legend og kreditering
6. `getRuteMellomPunkter`
7. `bane.ts`
8. Banelag med hull-markører
9. `par.ts`
10. Scorekort
11. Split the G-bonus
12. Kobling mellom kart og scorekort

Før hver push: `npm run build` og `npm run lint` må være grønne, og `.env` skal ikke være staget.

## Akseptsjekk
- [ ] Koden ligger i forken `nicolaykopaas/norkart-webkurs-React`, og `git log --all -- .env` er tom.
- [ ] `npm run build` er grønn, og `npm run lint` gir 0 feil og ≤ 12 advarsler.
- [ ] **Oppgave 6:** alle pilssteder vises med farge og størrelse etter pris. Popupen viser navn, pris, happy hour og Guinness. Pilsguiden er kreditert.
- [ ] **Oppgave 5:** `getRuteMellomPunkter` er implementert, og ruten tegnes som et `line`-lag. Reisetiden fra `CostList` vises.
- [ ] **Bane:** fra en valgt bar lages 6–9 hull der prisen synker, med nummererte hull på kartet.
- [ ] **Pubgolf:** par per hull kan endres. Scorekortet teller slurker per spiller og viser score mot par, birdie og bogey, og hva runden koster.
- [ ] **Split the G:** avkrysningen på Guinness-hull gir bonusen, og totalen viser den.
- [ ] Runden overlever en reload (`localStorage`).

## Beslutninger før koding
1. 9 eller 6 hull som standard?
2. Par-tabellen: er pils = 4 og Guinness = 5 riktig for dere?
3. Split the G-bonus: −1 slag, eller mer?
4. Gange eller kjøring? Hvis det ikke finnes en gange-graf, godtar vi kjøreruten?
5. Hvilke barer har Guinness? Legg dem inn manuelt, eller la brukeren markere hullet selv?
