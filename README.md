# VisitTrondheim

Kartapp for å finne på ting i Trondheim sentrum, laget for familier. Uoffisielt prosjekt, ikke tilknyttet Visit Trondheim.

Live: https://nicolaykopaas.github.io/norkartbedpress/

## Funksjoner

- Utforsk: steder på satellittkart med bilde, søk og filter.
- Min tur: velg tid og hva dere vil gjøre, så settes det opp en gåtur fra Torvet med kortest mulig gangavstand. Trykk «Gjort» ved hvert stopp.
- Oppdrag: små oppgaver ved kjente steder, sortert etter avstand.
- Bytt mellom 2D og 3D (bygninger og terreng) med knappen på kartet.

På mobil ligger fanene nederst, på PC i en kolonne til venstre.

## Kjøre lokalt

Krever Node 22 (se `.nvmrc`).

```bash
npm install
npm run dev
```

Appen kjører på http://localhost:5173. Andre kommandoer:

```bash
npm run build
npm run lint
node scripts/hent-aktiviteter.mjs   # oppdater steder fra OpenStreetMap
node scripts/hent-bilder.mjs        # oppdater bilder fra Wikimedia Commons
```

Ingen API-nøkkel trengs.

## Teknologi

React, TypeScript, Vite, Material UI og MapLibre GL. Gangruter fra OSRM. Deployes til GitHub Pages med GitHub Actions ved push til `main`.

Stedene hentes fra OpenStreetMap og lagres som JSON i `src/sample_data/`. Bare steder med et ekte bilde fra Wikimedia Commons tas med. Severdigheter og turløyper er lagt inn for hånd i `scripts/hand-plukket.json`. Turplanleggeren ligger i `src/utils/bane.ts`.

## Kilder

- Satellittbilder: © Esri, Maxar, Earthstar Geographics
- Kartdata og steder: © OpenStreetMap-bidragsytere (ODbL), via Overpass og OpenFreeMap
- Bilder: Wikimedia Commons, kreditert i appen
- Terreng: Mapzen / AWS Terrain Tiles
- Ruter: OSRM
