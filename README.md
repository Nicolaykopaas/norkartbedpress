# VisitTrondheim

En kartapp for å oppdage Trondheim sentrum, for hele familien. Dette er en **uoffisiell prosjektdemo** og er ikke tilknyttet Visit Trondheim.

**Prøv den:** https://nicolaykopaas.github.io/norkartbedpress/

## Slik fungerer det

Appen har tre faner: **Utforsk**, **Min tur** og **Oppdrag**. På mobil ligger de nederst med bildekortene under kartet. På PC ligger de i en sidekolonne til venstre, med kartet til høyre.

1. **Utforsk.** Alle steder vises som runde bilder av stedet på et satellittkart. Søkefeltet og filterknappene snevrer inn utvalget, og bildekortene kan blas i. Trykk på et kort eller et bilde for å se stedet.
2. **Min tur.** Svar på to spørsmål med bilder (hvor lang tid dere har, og hva dere har lyst til), så lager appen en tur med kortest mulig gangavstand fra Torvet. En figur går fra Studentersamfundet til første stopp, og ved hvert stopp får dere et kort med bilde og trykker «Gjort» for å gå videre.
3. **Oppdrag.** Små oppgaver knyttet til kjente steder, sortert etter avstand. Dere kan vise dem på kartet og markere dem som gjort. Oppdrag i nærheten dukker også opp underveis på turen.
4. **2D/3D.** Knappen på kartet bytter mellom flatt kart og vinklet kart med 3D-bygninger og terreng.

## Teknologi

- React, TypeScript, Vite og Material UI
- MapLibre GL med satellittbilder (Esri), 3D-bygninger og stedsnavn (OpenFreeMap / OpenStreetMap) og terreng (AWS Terrain Tiles)
- Gangruter fra OSRM med fotgjengerprofil (OpenStreetMap-data)
- Steder fra OpenStreetMap via Overpass og ekte foto fra Wikimedia Commons, lagret som GeoJSON i repoet
- GitHub Actions og GitHub Pages for deploy

Alt er åpne tjenester uten API-nøkkel, så det ligger ingen hemmeligheter i koden.

## Viktige valg

- **Kun steder med ekte bilde.** `scripts/hent-bilder.mjs` leter etter geotaggede bilder fra Wikimedia Commons nær hvert sted og krever at filnavnet stemmer med stedet. Steder uten godkjent bilde vises ikke. Hvert bilde krediteres i appen.
- **Turplanleggeren** (`src/utils/bane.ts`) fordeler kategoriene på stoppene, velger nærmeste ledige sted i hver kategori og prøver 60 rekkefølger for å finne den korteste turen.
- **Stedsdata** hentes av `scripts/hent-aktiviteter.mjs` med en positivliste av kategorier, så det bare kommer med steder som passer for alle. Severdigheter og turløyper er håndplukket i `scripts/hand-plukket.json`.
- **Kartstilen** (`src/utils/kartstil.ts`) er satt sammen i koden. Høyden på 3D-byggene kommer fra OpenStreetMap-dataene.

## Kjøre lokalt

```bash
npm install
npm run dev
```

Åpne http://localhost:5173. Bygg med `npm run build`, og kjør `npm run lint` for å sjekke koden. Oppdater stedene og bildene med `node scripts/hent-aktiviteter.mjs` og `node scripts/hent-bilder.mjs`.

## Datakilder

Satellittbilder © Esri, Maxar, Earthstar Geographics. Stedsdata og kartdata © OpenStreetMap-bidragsytere (ODbL) via Overpass og OpenFreeMap. Stedsbilder fra Wikimedia Commons med fotografens kreditering og lisens. Terreng: Mapzen / AWS Terrain Tiles. Ruter: OSRM.
