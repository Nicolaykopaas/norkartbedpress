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
- MapLibre GL med Norkarts satellittkart og stedsdata, og Norkarts ruteberegner for gangrutene
- GitHub Actions og GitHub Pages for deploy
- En liten **Cloudflare Worker** (`worker/`) som proxy foran Norkart. En statisk side kan ikke holde en API-nøkkel hemmelig, så Workeren legger på nøkkelen og slipper bare inn forespørsler fra selve siden.

## Viktige valg

- **Banealgoritmen** (`src/utils/bane.ts`) prøver hvert mulige startpunkt og velger ruten med kortest samlet gangavstand.
- **Nøkkelen er aldri i bygget.** I produksjon går kartfliser og rutekall via Workeren (`VITE_PROXY_URL`). Lokalt brukes `VITE_API_KEY` fra en `.env`-fil som ikke committes.
- **Ingen bilder av personer.** Alle kompisene er tegnet som SVG, så appen er trygg å vise til alle.

## Kjøre lokalt

```bash
npm install
echo "VITE_API_KEY=din-norkart-nøkkel" > .env
npm run dev
```

Åpne http://localhost:5173. Bygg med `npm run build`, og kjør `npm run lint` for å sjekke koden.

## Datakilder

Kart, satellittbilder og ruteberegning: © Norkart. Stedene og faktatekstene er håndplukket.
