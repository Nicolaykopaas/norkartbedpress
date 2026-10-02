# VisitTrondheim

Et kart som hjelper familier å finne på noe i Trondheim sentrum. Du velger hvor lang tid dere har og hva dere har lyst til, og appen lager en gåtur for dere.

**[Prøv appen her](https://nicolaykopaas.github.io/norkartbedpress/)**

Dette er et eget prosjekt og har ingenting med Visit Trondheim å gjøre.

## Hva du kan gjøre

| Fane | Hva den gjør |
|---|---|
| **Utforsk** | Se alle stedene på kartet med bilde. Søk eller filtrer på type, for eksempel park, museum eller lekeplass. |
| **Min tur** | Svar på to spørsmål, så får dere en tur fra Torvet med så kort gåavstand som mulig. Trykk «Gjort» ved hvert stopp. |
| **Oppdrag** | Små oppgaver ved kjente steder, med de nærmeste først. |

Knappen på kartet bytter mellom vanlig kart og 3D med bygninger og terreng. På mobil ligger fanene nederst, og på PC til venstre.

## Hvorfor den er bygget sånn

- **Bare ekte bilder.** Et sted kommer bare med hvis det finnes et ekte bilde av det på Wikimedia Commons. Jeg ville heller ha færre steder enn feil bilder.
- **Passer for alle.** Stedene hentes fra OpenStreetMap, men bare fra kategorier som passer for barn. Severdigheter og turløyper har jeg valgt ut selv.
- **Kort tur.** Appen prøver 60 ulike rekkefølger på stoppene og velger den korteste.
- **Ingen API-nøkkel.** Alt bruker åpne tjenester, så det finnes ingen hemmeligheter i koden.

## Kjør den selv

Du trenger Node 22.

```bash
npm install
npm run dev
```

Åpne http://localhost:5173.

| Kommando | Hva den gjør |
|---|---|
| `npm run build` | Bygger appen |
| `npm run lint` | Sjekker koden |
| `node scripts/hent-aktiviteter.mjs` | Henter steder på nytt fra OpenStreetMap |
| `node scripts/hent-bilder.mjs` | Henter bilder på nytt fra Wikimedia Commons |

## Teknologi

React, TypeScript, Vite, Material UI og MapLibre. Gangrutene kommer fra OSRM. Appen legges ut på GitHub Pages hver gang noe pushes til `main`.

## Status

63 steder fordelt på 13 kategorier. Bygget og lint går gjennom uten feil.

## Kilder

- Satellittbilder: Esri, Maxar, Earthstar Geographics
- Kart og steder: OpenStreetMap-bidragsytere (ODbL), via Overpass og OpenFreeMap
- Bilder: Wikimedia Commons, med fotograf og lisens i appen
- Terreng: Mapzen / AWS Terrain Tiles
- Gangruter: OSRM
