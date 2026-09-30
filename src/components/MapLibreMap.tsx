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
import { PilsLayer, PrisLegend } from './PilsLayer';
import { BaneLayer } from './BaneLayer';
import { DrinkSwipe } from './DrinkSwipe';
import { Spillere } from './Spillere';
import { Scorekort } from './Scorekort';
import { Leaderboard } from './Leaderboard';
import { MatchSkjerm } from './MatchSkjerm';
import { usePubgolf } from '../hooks/usePubgolf';
import { finnDyresteStart, lagBane } from '../utils/bane';
import { getBaneRute } from '../api/getBaneRute';
import { drinkById } from '../data/drinks';
import type { Bar, BarCollection, DrinkId } from '../types/pubgolf';
import olpriser from '../sample_data/olpriser.json';

const TRONDHEIM_COORDS: [number, number] = [10.40565401, 63.4156575];

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
const NORKART_BASEMAP_VARIANT: NorkartBasemapVariant = 'greyscale';

const NORKART_BASEMAP_STYLE = `${KVP_BASE_URL}norkart-basemap/${NORKART_BASEMAP_VARIANT}/style.json`;

const ANTALL_HULL = 9;
const OPPSETT_KEY = 'pubgolf-oppsett-v1';
const BARER = olpriser as BarCollection;
const ER_EKSEMPELDATA = BARER.features.some((f) =>
  f.properties.id.startsWith('eksempel-')
);

type Fase = 'swipe' | 'match' | 'start' | 'spillere' | 'spill';
type Oppsett = { fase: Fase; drinks: DrinkId[]; startId?: string };

function lesOppsett(): Oppsett {
  try {
    const raw = localStorage.getItem(OPPSETT_KEY);
    if (raw) {
      const o = JSON.parse(raw) as Oppsett;
      // En lagret runde kan peke på en bar som ikke finnes lenger (nye data)
      const finnes = BARER.features.some((b) => b.properties.id === o.startId);
      if ((o.fase === 'spillere' || o.fase === 'spill') && !finnes) {
        return { fase: 'start', drinks: o.drinks ?? [] };
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

  const onMapClick = (e: MapLayerMouseEvent) => {
    const treff = e.target.queryRenderedFeatures(e.point, {
      layers: ['pils-circle'],
    });
    const id = treff[0]?.properties?.id;
    setValgtBar(BARER.features.find((b) => b.properties.id === id));
  };

  const startFra = (bar: Bar) => {
    setValgtBar(undefined);
    setRute(undefined);
    setOppsett((o) => ({ ...o, fase: 'spillere', startId: bar.properties.id }));
    const [lng, lat] = bar.geometry.coordinates;
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
            onVidere={() => setOppsett((o) => ({ ...o, fase: 'start' }))}
            onSwipePaNytt={() => setOppsett({ fase: 'swipe', drinks: [] })}
          />
        );
      case 'start':
        return (
          <Stack spacing={1.5}>
            <Typography variant="h6">Hvor starter runden?</Typography>
            <Typography variant="body2">
              Klikk på en bar i kartet, eller start på den dyreste. Banen går
              videre til stadig billigere pils.
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {oppsett.drinks.map((d) => (
                <Chip
                  key={d}
                  size="small"
                  label={`${drinkById(d).emoji} ${drinkById(d).navn}`}
                />
              ))}
            </Stack>
            <Button
              variant="contained"
              onClick={() => startFra(finnDyresteStart(BARER.features))}
            >
              Start på den dyreste 💸
            </Button>
            <Button
              size="small"
              onClick={() => setOppsett({ fase: 'swipe', drinks: [] })}
            >
              Swipe på nytt
            </Button>
            <PrisLegend barer={BARER} />
          </Stack>
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
              onClick={() => setOppsett((o) => ({ ...o, fase: 'start' }))}
            >
              ← Velg annen start
            </Button>
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

  return (
    <RMap
      minZoom={6}
      initialCenter={TRONDHEIM_COORDS}
      initialZoom={12}
      mapStyle={NORKART_BASEMAP_STYLE}
      initialTransformRequest={transformRequest}
      style={{
        height: `calc(100dvh - var(--header-height))`,
      }}
      onClick={onMapClick}
    >
      <PilsLayer barer={BARER} />
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
            {oppsett.fase === 'start' && (
              <Button
                size="small"
                variant="contained"
                onClick={() => startFra(valgtBar)}
              >
                Start pubgolf herfra ⛳
              </Button>
            )}
          </Box>
        </RPopup>
      )}
      {flyTil && <MapFlyTo lng={flyTil[0]} lat={flyTil[1]} />}
      <Overlay
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1,
          width: 'min(360px, calc(100vw - 48px))',
          maxHeight: 'calc(100% - 48px)',
          overflowY: 'auto',
          padding: '12px',
        }}
      >
        <div className="pubgolf-panel">{panel}</div>
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
      </Overlay>
    </RMap>
  );
};

function MapFlyTo({ lng, lat }: { lng: number; lat: number }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo({ center: [lng, lat], zoom: 16, speed: 1.5 });
  }, [lng, lat, map]);

  return null;
}

const transformRequest: RequestTransformFunction = (url) => {
  if (!url.startsWith(KVP_BASE_URL)) {
    return { url };
  }

  const apiKey = import.meta.env.VITE_API_KEY;
  const separator = url.includes('?') ? '&' : '?';
  return { url: `${url}${separator}api_key=${encodeURIComponent(apiKey)}` };
};
