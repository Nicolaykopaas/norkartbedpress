# Byvandring i Trondheim

En kartapp for hele familien. Dere velger hva dere har lyst til å gjøre, og appen lager en byvandring med sju stopp i Trondheim sentrum.

**Prøv den:** https://nicolaykopaas.github.io/norkartbedpress/

## Slik fungerer det

1. **Velg aktiviteter.** Startskjermen er et rutenett med store kort: bowling, is, badstue, lekeplass, museum, kino, utsikt, tur og flere. Trykk på de dere vil ha.
2. **Oversiktskartet.** Satellittkartet med 3D-bygninger viser alle valgte aktiviteter som ikoner, litt som kartet i GTA. Filterknapper skrur kategorier av og på, og et trykk på et ikon viser navn, avstand og en kort tekst.
3. **Planlegg tur.** Appen prøver mange rekkefølger av kategoriene og velger turen med kortest samlet gangavstand fra Torvet.
4. **På tur.** En figur går fra Studentersamfundet til første stopp. Ved hvert stopp kommer et flashcard som avslører hva dere skal gjøre, og dere trykker «Gjort!» for å gå videre, med jubel og stemme.
5. **Bonusoppdrag.** Innimellom ringer Kaptein Kart med et lite oppdrag når dere er i nærheten av et sted.
6. **Oppsummering** med deling av turen.

## Teknologi

- React, TypeScript, Vite og Material UI
- MapLibre GL med satellittbilder (Esri), 3D-bygninger og stedsnavn (OpenFreeMap / OpenStreetMap) og terreng (AWS Terrain Tiles)
- Gangruter fra OSRM med fotgjengerprofil (OpenStreetMap-data)
- Steder hentet fra OpenStreetMap via Overpass, lagret som GeoJSON i repoet
- GitHub Actions og GitHub Pages for deploy

Alt er åpne tjenester uten API-nøkkel, så det ligger ingen hemmeligheter i koden.

## Viktige valg

- **Turplanleggeren** (`src/utils/bane.ts`) fordeler de valgte kategoriene på stoppene, velger nærmeste ledige sted i hver kategori og prøver 60 tilfeldige rekkefølger for å finne den korteste turen.
- **Stedsdata** hentes av `scripts/hent-aktiviteter.mjs` og filtreres med en positivliste av kategorier, så det bare kommer med steder som passer for alle. Severdigheter og turløyper er håndplukket i `scripts/hand-plukket.json`.
- **Kartstilen** (`src/utils/kartstil.ts`) er satt sammen i koden. Høyden på 3D-byggene kommer fra OpenStreetMap-dataene.
- Appen startet som en workshop med Norkart-kart og kan byttes tilbake til Norkart ved å bytte kartstilen og rutekallet.

## Kjøre lokalt

```bash
npm install
npm run dev
```

Åpne http://localhost:5173. Bygg med `npm run build`, og kjør `npm run lint` for å sjekke koden. Oppdater stedene med `node scripts/hent-aktiviteter.mjs`.

## Datakilder

Satellittbilder © Esri, Maxar, Earthstar Geographics. Stedsdata og kartdata © OpenStreetMap-bidragsytere (ODbL) via Overpass og OpenFreeMap. Terreng: Mapzen / AWS Terrain Tiles. Ruter: OSRM.
