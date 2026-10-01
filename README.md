# Byvandring i Trondheim

En liten kartapp for hele familien. Du sveiper på alkoholfrie drikker som på Tinder, og appen lager en byvandring med sju stopp i Trondheim sentrum. Underveis får du møte kompisene du matchet med, poeng i golfstil for slurkene dine og bonusoppdrag.

**Prøv den:** https://nicolaykopaas.github.io/norkartbedpress/

## Slik fungerer det

1. **Sveip** til du har sju matcher. Hver match er en tegnet drikke-kompis (kakao, eplejuice, smoothie ...).
2. Appen **planlegger ruten** automatisk: den prøver alle startpunkter nær Torvet og velger rekkefølgen med kortest gangavstand.
3. En figur **går fra Studentersamfundet** til første stopp, og ved hvert stopp får du en avsløring av kompisen du møter der.
4. Registrer **slurker** per spiller. Scoren regnes mot par, med golf- og discgolf-begreper (birdie, bogey, ace ...) og lyd- og bowlingeffekter.
5. Innimellom ringer **Kaptein Kart** med et bonusoppdrag når du er i nærheten av et sted.
6. Resultatet kan deles fra leaderboardet.

## Teknologi

- React, TypeScript, Vite og Material UI
- MapLibre GL med satellittbilder (Esri), 3D-bygninger og stedsnavn (OpenFreeMap / OpenStreetMap) og terreng (AWS Terrain Tiles)
- Gangruter fra OSRM med fotgjengerprofil (OpenStreetMap-data)
- GitHub Actions og GitHub Pages for deploy

Alt er åpne tjenester uten API-nøkkel, så det ligger ingen hemmeligheter i koden.

## Viktige valg

- **Banealgoritmen** (`src/utils/bane.ts`) prøver hvert mulige startpunkt og velger ruten med kortest samlet gangavstand.
- **Kartstilen** (`src/utils/kartstil.ts`) er satt sammen i koden i stedet for å hentes ferdig. Det gir full kontroll over lagene, og høyden på 3D-byggene kommer fra OpenStreetMap-dataene.
- **Ingen bilder av personer.** Alle kompisene er tegnet som SVG, så appen er trygg å vise til alle.
- Appen startet som en workshop med Norkart-kart. Den kan byttes tilbake til Norkart ved å bytte kartstilen og rutekallet.

## Kjøre lokalt

```bash
npm install
npm run dev
```

Åpne http://localhost:5173. Bygg med `npm run build`, og kjør `npm run lint` for å sjekke koden.

## Datakilder

Satellittbilder © Esri, Maxar, Earthstar Geographics. Kartdata © OpenStreetMap-bidragsytere via OpenFreeMap. Terreng: Mapzen / AWS Terrain Tiles. Ruter: OSRM. Stedene og faktatekstene er håndplukket.
