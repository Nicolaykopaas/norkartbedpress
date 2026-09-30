import {
  type MapLayerMouseEvent,
  type RequestTransformFunction,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { RMap, RPopup, useMap } from 'maplibre-react-components';
import { useEffect, useMemo, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { Overlay } from './Overlay';
import { PrisLegend } from './PilsLayer';
import { BarMarkers } from './BarMarkers';
import { EVENTER } from '../data/events';
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
import olpriser from '../sample_data/olpriser.json';

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

const ANTALL_HULL = 9;
const OPPSETT_KEY = 'pubgolf-oppsett-v1';
const ALLE_BARER = olpriser as BarCollection;
// Vi holder oss til Midtbyen (rundt Torvet) og Studentersamfundet
const BARER: BarCollection = {
  ...ALLE_BARER,
  features: ALLE_BARER.features.filter(
    (b) =>
      b.properties.navn.includes('Studentersamfundet') ||
      haversineMeter(
        TRONDHEIM_COORDS,
        b.geometry.coordinates as [number, number]
      ) <= 650
  ),
};
const ER_EKSEMPELDATA = BARER.features.some((f) =>
  f.properties.id.startsWith('eksempel-')
);

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
  const [valgtBar, setValgtBar] = useState<Bar | undefined>(undefined);
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
    setValgtBar(undefined);
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
  const naerEvent = aktivBar
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
                visHull(0);
              }}
            />
            <Button
              size="small"
              onClick={() => setOppsett((o) => ({ ...o, fase: 'match' }))}
            >
              ← Tilbake
            </Button>
            <PrisLegend barer={BARER} />
          </Stack>
        );
      case 'spill':
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
      onClick={() => setValgtBar(undefined)}
    >
      <BarMarkers
        barer={BARER.features}
        hopp={new Set(hull.map((h) => h.bar.properties.id))}
        onVelg={setValgtBar}
      />
      {hull.length > 0 && (
        <BaneLayer
          hull={hull}
          rute={rute?.geometri}
          aktivtHull={oppsett.fase === 'spill' ? spill.aktivtHull : undefined}
          onVelgHull={visHull}
        />
      )}
      {valgtBar && (
        <RPopup
          longitude={valgtBar.geometry.coordinates[0]}
          latitude={valgtBar.geometry.coordinates[1]}
          offset={12}
        >
          <Box sx={{ minWidth: 160 }}>
            <Typography variant="subtitle2">
              {valgtBar.properties.navn}
            </Typography>
            <Typography variant="body2">
              {valgtBar.properties.pris},- for 0,5 l ·{' '}
              {valgtBar.properties.bydel}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ my: 0.5 }}>
              {valgtBar.properties.happyHour && (
                <Chip size="small" label="⏰ Happy hour" />
              )}
              {valgtBar.properties.guinness && (
                <Chip size="small" label="🍀 Guinness" />
              )}
            </Stack>
          </Box>
        </RPopup>
      )}
      {flyTil && <MapFlyTo lng={flyTil[0]} lat={flyTil[1]} />}
      {naerEvent && (
        <div className="event-ad">
          {naerEvent.e.bilde && (
            <img
              className="event-bilde"
              src={`${import.meta.env.BASE_URL}drinks/${naerEvent.e.bilde}`}
              alt={naerEvent.e.profil ?? naerEvent.e.navn}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div className="event-tittel">{naerEvent.e.tittel}</div>
          <div>{naerEvent.e.tekst}</div>
          <div className="event-meter">📍 {naerEvent.m} m unna</div>
          <Button
            size="small"
            variant="contained"
            color="secondary"
            onClick={() => setLukkedeEventer((l) => [...l, naerEvent.e.id])}
          >
            Kult, ikke nå
          </Button>
        </div>
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

        {!kunTinder && (
          <Typography
            variant="caption"
            component="p"
            sx={{ mt: 1, color: 'text.secondary' }}
          >
            {ER_EKSEMPELDATA ? (
              'Eksempeldata (fiktive barer). Kjør skrapeskriptet for ekte priser.'
            ) : (
              <>
                Priser:{' '}
                <a
                  href="https://www.pilsguiden.no/liste/trondelag/trondheim"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pilsguiden.no
                </a>
              </>
            )}
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

  const apiKey = (import.meta.env.VITE_API_KEY ?? '').replace(
    /[^A-Za-z0-9-]/g,
    ''
  );
  const separator = url.includes('?') ? '&' : '?';
  return { url: `${url}${separator}api_key=${encodeURIComponent(apiKey)}` };
};
