import { type RequestTransformFunction } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RLayer, RMap, RSource, useMap } from 'maplibre-react-components';
import { useEffect, useMemo, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import { Button, Stack, Typography } from '@mui/material';
import { Overlay } from './Overlay';
import { EVENTER } from '../data/events';
import { GaaMarker, IntroGange } from './Gaa';
import { hentGangLinje, type Punkt } from '../utils/gange';
import { PersonKort, Reveal } from './HullPerson';
import { PROFILER } from '../data/profiler';
import { BaneLayer } from './BaneLayer';
import { DrinkSwipe } from './DrinkSwipe';
import { Spillere } from './Spillere';
import { Scorekort } from './Scorekort';
import { Leaderboard } from './Leaderboard';
import { MatchSkjerm } from './MatchSkjerm';
import { usePubgolf } from '../hooks/usePubgolf';
import { haversineMeter, lagBane, lagBesteBane } from '../utils/bane';
import { getBaneRute } from '../api/getBaneRute';
import type { Bar, BarCollection, DrinkId } from '../types/pubgolf';
import steder from '../sample_data/steder.json';

// Torvet, midt i Midtbyen
const TRONDHEIM_COORDS: [number, number] = [10.39506, 63.43049];

const KVP_BASE_URL = 'https://kvp.maps.norkart.no/mvt/';

type NorkartBasemapVariant =
  | 'standard'
  | 'standard-without-text'
  | 'greyscale'
  | 'greyscale-without-text'
  | 'darkmode'
  | 'transparent'
  | 'hybrid'
  | 'ortofoto';
const NORKART_BASEMAP_VARIANT: NorkartBasemapVariant = 'hybrid';

const NORKART_BASEMAP_STYLE = `${KVP_BASE_URL}norkart-basemap/${NORKART_BASEMAP_VARIANT}/style.json`;

// Man sveiper til man har 7 matcher, og hver match blir ett hull
const ANTALL_HULL = 7;
const OPPSETT_KEY = 'byvandring-oppsett-v1';
const BARER = steder as BarCollection;
const SAMFUNDET: Punkt = (BARER.features.find(
  (b) => b.properties.id === 'samfundet'
)?.geometry.coordinates as Punkt | undefined) ?? [10.3942, 63.4225];

type Fase = 'swipe' | 'match' | 'spillere' | 'spill';
type Oppsett = { fase: Fase; drinks: DrinkId[]; startId?: string };

function lesOppsett(): Oppsett {
  try {
    const raw = localStorage.getItem(OPPSETT_KEY);
    if (raw) {
      const o = JSON.parse(raw) as Oppsett;
      if ((o.fase as string) === 'start') return { ...o, fase: 'match' };
      // En lagret runde kan peke på en bar som ikke finnes lenger (nye data)
      const finnes = BARER.features.some((b) => b.properties.id === o.startId);
      if ((o.fase === 'spillere' || o.fase === 'spill') && !finnes) {
        return { fase: 'match', drinks: o.drinks ?? [] };
      }
      return o;
    }
  } catch {
    /* ignorer */
  }
  return { fase: 'swipe', drinks: [] };
}

export const MapLibreMap = () => {
  const [oppsett, setOppsett] = useState<Oppsett>(lesOppsett);
  const [rute, setRute] = useState<
    { geometri: FeatureCollection; totalSekunder?: number } | undefined
  >(undefined);
  const [flyTil, setFlyTil] = useState<[number, number] | undefined>(undefined);
  const spill = usePubgolf(ANTALL_HULL);

  useEffect(() => {
    try {
      localStorage.setItem(OPPSETT_KEY, JSON.stringify(oppsett));
    } catch {
      /* ignorer */
    }
  }, [oppsett]);

  const startBar = BARER.features.find(
    (b) => b.properties.id === oppsett.startId
  );
  const hull = useMemo(
    () =>
      startBar
        ? lagBane(startBar, BARER.features, oppsett.drinks, {
            antallHull: ANTALL_HULL,
          })
        : [],
    [startBar, oppsett.drinks]
  );

  useEffect(() => {
    if (hull.length < 2) return;
    let avbrutt = false;
    getBaneRute(hull).then((r) => {
      if (!avbrutt) setRute(r);
    });
    return () => {
      avbrutt = true;
    };
  }, [hull]);

  const planleggBane = () => {
    const bane = lagBesteBane(BARER.features, oppsett.drinks, {
      antallHull: ANTALL_HULL,
      startSenter: TRONDHEIM_COORDS,
    });
    if (bane.length === 0) return;
    const start = bane[0].bar;
    setRute(undefined);
    setOppsett((o) => ({
      ...o,
      fase: 'spillere',
      startId: start.properties.id,
    }));
    const [lng, lat] = start.geometry.coordinates;
    setFlyTil([lng, lat]);
  };

  const nyRunde = () => {
    spill.nullstill();
    setRute(undefined);
    setIntro('ferdig');
    setLeg(undefined);
    setOppsett({ fase: 'swipe', drinks: [] });
  };

  const visHull = (idx: number) => {
    spill.settHull(idx);
    const [lng, lat] = hull[idx].bar.geometry.coordinates;
    setFlyTil([lng, lat]);
  };

  // Følg aktivt hull på kartet når man blar i scorekortet
  const aktivBar =
    oppsett.fase === 'spill' ? hull[spill.aktivtHull]?.bar : undefined;
  useEffect(() => {
    if (aktivBar) setFlyTil(aktivBar.geometry.coordinates as [number, number]);
  }, [aktivBar]);

  const kunTinder = oppsett.fase === 'swipe' || oppsett.fase === 'match';

  const [lukkedeEventer, setLukkedeEventer] = useState<string[]>([]);
  // Gåanimasjon fra Samfundet etter at man har trykket play
  const [intro, setIntro] = useState<'gaar' | 'ferdig'>('ferdig');
  const [revealHull, setRevealHull] = useState<number>();
  // Special event dukker opp litt ut i runden, ikke med en gang
  const [eventKlar, setEventKlar] = useState(false);
  const aktivtHullNr = spill.aktivtHull;
  useEffect(() => {
    setEventKlar(false);
    if (oppsett.fase !== 'spill' || intro !== 'ferdig' || aktivtHullNr < 2)
      return;
    const t = setTimeout(() => setEventKlar(true), 4000);
    return () => clearTimeout(t);
  }, [aktivtHullNr, oppsett.fase, intro]);
  useEffect(() => {
    if (oppsett.fase === 'spill' && intro === 'ferdig')
      setRevealHull(aktivtHullNr);
    else setRevealHull(undefined);
  }, [aktivtHullNr, oppsett.fase, intro]);
  // Kun etappen til neste bar tegnes, ikke hele ruten på en gang
  const [leg, setLeg] = useState<Punkt[]>();
  useEffect(() => {
    setLeg(undefined);
    if (oppsett.fase !== 'spill' || intro !== 'ferdig' || aktivtHullNr < 1)
      return;
    let avbrutt = false;
    hentGangLinje(
      hull[aktivtHullNr - 1].bar.geometry.coordinates as Punkt,
      hull[aktivtHullNr].bar.geometry.coordinates as Punkt
    ).then((l) => {
      if (!avbrutt) setLeg(l);
    });
    return () => {
      avbrutt = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktivtHullNr, oppsett.fase, intro, hull.length]);
  const naerEvent =
    aktivBar && eventKlar
      ? EVENTER.map((e) => ({
          e,
          m: Math.round(
            haversineMeter(
              [e.lng, e.lat],
              aktivBar.geometry.coordinates as [number, number]
            )
          ),
        }))
          .filter((x) => x.m <= 500 && !lukkedeEventer.includes(x.e.id))
          .sort((a, b) => a.m - b.m)[0]
      : undefined;

  const panel = (() => {
    if (spill.ferdig && hull.length > 0) {
      return (
        <Leaderboard
          hull={hull}
          spillere={spill.spillere}
          onNyRunde={nyRunde}
        />
      );
    }
    switch (oppsett.fase) {
      case 'swipe':
        return (
          <DrinkSwipe
            onFerdig={(drinks) => setOppsett({ fase: 'match', drinks })}
          />
        );
      case 'match':
        return (
          <MatchSkjerm
            drinks={oppsett.drinks}
            antallHull={ANTALL_HULL}
            onVidere={planleggBane}
            onSwipePaNytt={() => setOppsett({ fase: 'swipe', drinks: [] })}
          />
        );
      case 'spillere':
        return (
          <Stack spacing={1}>
            <Typography variant="body2">
              Banen: {hull.length} hull, par{' '}
              {hull.reduce((s, h) => s + h.par, 0)}
              {rute?.totalSekunder !== undefined &&
                ` · ca. ${Math.round(rute.totalSekunder / 60)} min`}
            </Typography>
            <Spillere
              spillere={spill.spillere}
              onLeggTil={spill.leggTilSpiller}
              onFjern={spill.fjernSpiller}
              onStart={() => {
                setOppsett((o) => ({ ...o, fase: 'spill' }));
                spill.settHull(0);
                setIntro('gaar');
              }}
            />
            <Button
              size="small"
              onClick={() => setOppsett((o) => ({ ...o, fase: 'match' }))}
            >
              ← Tilbake
            </Button>
          </Stack>
        );
      case 'spill':
        if (intro === 'gaar') {
          const d = hull[0].drink;
          return (
            <Stack spacing={1} sx={{ p: 1 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
                🚶 På vei fra Samfundet til {hull[0].bar.properties.navn}…
              </Typography>
              <PersonKort drink={d} />
              <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
                {PROFILER[d].profilnavn} sitter allerede og venter.
              </Typography>
              <Button variant="outlined" onClick={() => setIntro('ferdig')}>
                Hopp over
              </Button>
            </Stack>
          );
        }
        return (
          <Scorekort
            hull={hull}
            spill={spill}
            totalSekunder={rute?.totalSekunder}
            onVisHull={visHull}
          />
        );
    }
  })();

  if (kunTinder) {
    return (
      <div className="start-skjerm">
        <div className="start-kort">
          {panel}
          <Button
            fullWidth
            color="secondary"
            onClick={nyRunde}
            sx={{ mt: 1, height: 48, fontWeight: 900 }}
          >
            ↺ Restart
          </Button>
        </div>
      </div>
    );
  }

  return (
    <RMap
      minZoom={6}
      initialCenter={TRONDHEIM_COORDS}
      initialZoom={15}
      initialPitch={50}
      maxPitch={75}
      mapStyle={NORKART_BASEMAP_STYLE}
      initialTransformRequest={transformRequest}
      style={{
        height: `calc(100dvh - var(--header-height))`,
      }}
    >
      {hull.length > 0 && (
        <BaneLayer
          // Kun én og én bar: de vi har besøkt og den vi er på nå
          hull={hull.slice(
            0,
            oppsett.fase === 'spill'
              ? intro === 'gaar'
                ? 0
                : spill.aktivtHull + 1
              : 1
          )}
          aktivtHull={oppsett.fase === 'spill' ? spill.aktivtHull : undefined}
          onVelgHull={visHull}
        />
      )}
      {leg && (
        <>
          <RSource
            id="leg"
            type="geojson"
            data={{
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: leg },
            }}
          />
          <RLayer
            id="leg-linje"
            source="leg"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{
              'line-color': '#00e5ff',
              'line-width': 6,
              'line-opacity': 0.9,
            }}
          />
          <GaaMarker
            linje={leg}
            varighetMs={8000}
            ikon="🧑‍🤝‍🧑🚶‍♀️🚶‍♂️"
            klasse="gjeng"
            loop
          />
        </>
      )}
      {oppsett.fase === 'spill' && intro === 'gaar' && hull.length > 0 && (
        <IntroGange
          fra={SAMFUNDET}
          til={hull[0].bar.geometry.coordinates as Punkt}
          onFerdig={() => setIntro('ferdig')}
        />
      )}
      {flyTil && <MapFlyTo lng={flyTil[0]} lat={flyTil[1]} />}
      {naerEvent && (
        <div className="gta">
          <div className="gta-banner">
            Nytt oppdrag
            <small>{naerEvent.e.navn}</small>
          </div>
          <div className="gta-samtale">
            <div className="gta-emoji">{naerEvent.e.emoji}</div>
            <div className="gta-tekst">
              <b>{naerEvent.e.fra} ringer</b>
              {naerEvent.e.tekst}{' '}
              {naerEvent.m < 50
                ? 'Du er rett ved siden av!'
                : `Bare ${naerEvent.m} m unna.`}
              <br />
              <button
                onClick={() => setLukkedeEventer((l) => [...l, naerEvent.e.id])}
              >
                Legg på
              </button>
            </div>
          </div>
        </div>
      )}
      {revealHull !== undefined && hull[revealHull] && (
        <Reveal
          drink={hull[revealHull].drink}
          hullNr={hull[revealHull].nr}
          onLukk={() => setRevealHull(undefined)}
        />
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={nyRunde}
        sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          zIndex: 2,
          height: 44,
          fontWeight: 900,
          boxShadow: '0 0 14px #ff2bd6',
        }}
      >
        ↺ Restart
      </Button>
      <Overlay
        className={kunTinder ? 'panel-midt' : 'panel-bunn'}
        style={{
          position: 'absolute',
          top: kunTinder ? '50%' : 12,
          left: kunTinder ? '50%' : 12,
          transform: kunTinder ? 'translate(-50%, -50%)' : undefined,
          zIndex: 1,
          width: 'min(360px, calc(100vw - 48px))',
          maxHeight: 'calc(100% - 24px)',
          overflowY: 'auto',
          padding: '12px',
        }}
      >
        <div className="pubgolf-panel">{panel}</div>

        {!kunTinder && oppsett.fase !== 'spill' && (
          <Typography
            variant="caption"
            component="p"
            sx={{ mt: 1, color: 'text.secondary' }}
          >
            Kart, satellittbilder og rute: © Norkart
          </Typography>
        )}
      </Overlay>
    </RMap>
  );
};

function MapFlyTo({ lng, lat }: { lng: number; lat: number }) {
  const map = useMap();

  useEffect(() => {
    const mobil = window.matchMedia('(max-width: 600px)').matches;
    map.flyTo({
      center: [lng, lat],
      zoom: 15.5,
      speed: 1.5,
      // Panelet ligger nederst på mobil, så flytt midten opp
      padding: { top: 0, left: 0, right: 0, bottom: mobil ? 320 : 0 },
    });
  }, [lng, lat, map]);

  return null;
}

const transformRequest: RequestTransformFunction = (url) => {
  if (!url.startsWith(KVP_BASE_URL)) {
    return { url };
  }

  // I produksjon går alt via proxyen, som holder nøkkelen hemmelig
  const proxy = import.meta.env.VITE_PROXY_URL;
  if (proxy) {
    return { url: `${proxy}/mvt/${url.slice(KVP_BASE_URL.length)}` };
  }

  const apiKey = (import.meta.env.VITE_API_KEY ?? '').replace(
    /[^A-Za-z0-9-]/g,
    ''
  );
  const separator = url.includes('?') ? '&' : '?';
  return { url: `${url}${separator}api_key=${encodeURIComponent(apiKey)}` };
};
