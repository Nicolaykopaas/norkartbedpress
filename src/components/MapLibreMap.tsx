import 'maplibre-gl/dist/maplibre-gl.css';
import {
  RLayer,
  RMap,
  RPopup,
  RSource,
  useMap,
} from 'maplibre-react-components';
import { useEffect, useMemo, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { Overlay } from './Overlay';
import { EVENTER } from '../data/events';
import { GaaMarker, IntroGange } from './Gaa';
import { KARTSTIL } from '../utils/kartstil';
import { hentGangLinje, type Punkt } from '../utils/gange';
import { Reveal } from './HullPerson';
import { BaneLayer } from './BaneLayer';
import { AktivitetMarkers } from './AktivitetMarkers';
import { Kategorivelger } from './Kategorivelger';
import { StoppKort } from './StoppKort';
import { Oppsummering } from './Oppsummering';
import { useTur } from '../hooks/useTur';
import { haversineMeter, lagBesteTur } from '../utils/bane';
import { getBaneRute } from '../api/getBaneRute';
import { kategoriById } from '../data/kategorier';
import type { Hull, KategoriId, Sted, StedCollection } from '../types/pubgolf';
import aktiviteter from '../sample_data/aktiviteter.json';

// Torvet, midt i Midtbyen
const TRONDHEIM_COORDS: Punkt = [10.39506, 63.43049];

const ANTALL_STOPP = 7;
const OPPSETT_KEY = 'byvandring-oppsett-v2';
const STEDER = aktiviteter as StedCollection;
const SAMFUNDET: Punkt = (STEDER.features.find(
  (s) => s.properties.id === 'samfundet'
)?.geometry.coordinates as Punkt | undefined) ?? [10.3942, 63.4225];

const ANTALL_PER_KATEGORI = STEDER.features.reduce<
  Partial<Record<KategoriId, number>>
>((acc, s) => {
  acc[s.properties.kategori] = (acc[s.properties.kategori] ?? 0) + 1;
  return acc;
}, {});

type Fase = 'velg' | 'oversikt' | 'tur';
type Oppsett = {
  fase: Fase;
  kategorier: KategoriId[];
  /** Kategorier som er skrudd av i oversikten */
  skjult: KategoriId[];
  turIds: string[];
};

const TOMT: Oppsett = { fase: 'velg', kategorier: [], skjult: [], turIds: [] };

function lesOppsett(): Oppsett {
  try {
    const raw = localStorage.getItem(OPPSETT_KEY);
    if (raw) {
      const o = JSON.parse(raw) as Oppsett;
      const ids = new Set(STEDER.features.map((s) => s.properties.id));
      if (o.fase === 'tur' && !o.turIds?.every((id) => ids.has(id)))
        return TOMT;
      if (o.fase === 'oversikt' && !o.kategorier?.length) return TOMT;
      return { ...TOMT, ...o };
    }
  } catch {
    /* ignorer */
  }
  return TOMT;
}

export const MapLibreMap = () => {
  const [oppsett, setOppsett] = useState<Oppsett>(lesOppsett);
  const [rute, setRute] = useState<
    { geometri: FeatureCollection; totalSekunder?: number } | undefined
  >(undefined);
  const [flyTil, setFlyTil] = useState<{ pos: Punkt; zoom: number }>();
  const [valgtSted, setValgtSted] = useState<Sted>();
  const tur = useTur(ANTALL_STOPP);

  useEffect(() => {
    try {
      localStorage.setItem(OPPSETT_KEY, JSON.stringify(oppsett));
    } catch {
      /* ignorer */
    }
  }, [oppsett]);

  const hull: Hull[] = useMemo(
    () =>
      oppsett.turIds.flatMap((id, i) => {
        const sted = STEDER.features.find((s) => s.properties.id === id);
        return sted
          ? [{ nr: i + 1, sted, kategori: sted.properties.kategori }]
          : [];
      }),
    [oppsett.turIds]
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

  const synlige = useMemo(
    () =>
      STEDER.features.filter(
        (s) =>
          oppsett.kategorier.includes(s.properties.kategori) &&
          !oppsett.skjult.includes(s.properties.kategori)
      ),
    [oppsett.kategorier, oppsett.skjult]
  );

  const [intro, setIntro] = useState<'gaar' | 'ferdig'>('ferdig');
  const [revealHull, setRevealHull] = useState<number>();
  const [leg, setLeg] = useState<Punkt[]>();
  const [lukkedeEventer, setLukkedeEventer] = useState<string[]>([]);
  const [eventKlar, setEventKlar] = useState(false);

  const planlegg = () => {
    const aktive = oppsett.kategorier.filter(
      (k) => !oppsett.skjult.includes(k)
    );
    const bruk = aktive.length > 0 ? aktive : oppsett.kategorier;
    const bane = lagBesteTur(
      STEDER.features,
      bruk,
      ANTALL_STOPP,
      TRONDHEIM_COORDS
    );
    if (bane.length === 0) return;
    tur.nullstill();
    setRute(undefined);
    setValgtSted(undefined);
    setIntro('gaar');
    setOppsett((o) => ({
      ...o,
      fase: 'tur',
      turIds: bane.map((h) => h.sted.properties.id),
    }));
  };

  const nyTur = () => {
    tur.nullstill();
    setRute(undefined);
    setIntro('ferdig');
    setLeg(undefined);
    setValgtSted(undefined);
    setOppsett(TOMT);
  };

  const iTur = oppsett.fase === 'tur';
  const aktivtHullNr = tur.aktivtHull;
  const aktivSted = iTur && !tur.ferdig ? hull[aktivtHullNr]?.sted : undefined;

  // Følg aktivt stopp på kartet
  useEffect(() => {
    if (aktivSted)
      setFlyTil({ pos: aktivSted.geometry.coordinates as Punkt, zoom: 15.5 });
  }, [aktivSted]);

  // Oversikten: vis hele byen når man kommer inn
  useEffect(() => {
    if (oppsett.fase === 'oversikt')
      setFlyTil({ pos: TRONDHEIM_COORDS, zoom: 14.3 });
  }, [oppsett.fase]);

  // Bonusoppdrag dukker opp litt ut i turen, ikke med en gang
  useEffect(() => {
    setEventKlar(false);
    if (!iTur || intro !== 'ferdig' || tur.ferdig || aktivtHullNr < 2) return;
    const t = setTimeout(() => setEventKlar(true), 4000);
    return () => clearTimeout(t);
  }, [aktivtHullNr, iTur, intro, tur.ferdig]);

  // Avsløring ved hvert nye stopp
  useEffect(() => {
    if (iTur && intro === 'ferdig' && !tur.ferdig) setRevealHull(aktivtHullNr);
    else setRevealHull(undefined);
  }, [aktivtHullNr, iTur, intro, tur.ferdig]);

  // Kun etappen til neste stopp tegnes, ikke hele ruten på en gang
  useEffect(() => {
    setLeg(undefined);
    if (!iTur || intro !== 'ferdig' || tur.ferdig || aktivtHullNr < 1) return;
    const forrige = hull[aktivtHullNr - 1];
    const naa = hull[aktivtHullNr];
    if (!forrige || !naa) return;
    let avbrutt = false;
    hentGangLinje(
      forrige.sted.geometry.coordinates as Punkt,
      naa.sted.geometry.coordinates as Punkt
    ).then((l) => {
      if (!avbrutt) setLeg(l);
    });
    return () => {
      avbrutt = true;
    };
  }, [aktivtHullNr, iTur, intro, tur.ferdig, hull]);

  const naerEvent =
    aktivSted && eventKlar
      ? EVENTER.map((e) => ({
          e,
          m: Math.round(
            haversineMeter(
              [e.lng, e.lat],
              aktivSted.geometry.coordinates as Punkt
            )
          ),
        }))
          .filter((x) => x.m <= 500 && !lukkedeEventer.includes(x.e.id))
          .sort((a, b) => a.m - b.m)[0]
      : undefined;

  if (oppsett.fase === 'velg') {
    return (
      <div className="start-skjerm">
        <div className="start-kort">
          <Kategorivelger
            antall={ANTALL_PER_KATEGORI}
            onFerdig={(k) =>
              setOppsett({
                fase: 'oversikt',
                kategorier: k,
                skjult: [],
                turIds: [],
              })
            }
          />
        </div>
      </div>
    );
  }

  const panel = (() => {
    if (oppsett.fase === 'oversikt') {
      return (
        <Stack spacing={1} sx={{ p: 0.5 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
            Aktiviteter i byen 🗺️
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {oppsett.kategorier.map((id) => {
              const k = kategoriById(id);
              const av = oppsett.skjult.includes(id);
              return (
                <Chip
                  key={id}
                  onClick={() =>
                    setOppsett((o) => ({
                      ...o,
                      skjult: av
                        ? o.skjult.filter((x) => x !== id)
                        : [...o.skjult, id],
                    }))
                  }
                  label={`${k.emoji} ${k.navn} ${ANTALL_PER_KATEGORI[id] ?? 0}`}
                  sx={{
                    height: 40,
                    fontSize: 15,
                    fontWeight: 700,
                    opacity: av ? 0.4 : 1,
                    border: `2px solid ${k.farge}`,
                    background: av ? 'transparent' : `${k.farge}55`,
                  }}
                />
              );
            })}
          </Box>
          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={planlegg}
            sx={{ height: 60, fontSize: 20, fontWeight: 900 }}
          >
            Planlegg tur 🚶 ({ANTALL_STOPP} stopp)
          </Button>
          <Button
            color="inherit"
            onClick={() => setOppsett({ ...TOMT })}
            sx={{ opacity: 0.8 }}
          >
            ← Endre valg
          </Button>
        </Stack>
      );
    }
    if (intro === 'gaar' && hull[0]) {
      const kat = kategoriById(hull[0].kategori);
      return (
        <Stack spacing={1} sx={{ p: 1 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 900 }}>
            🚶 På vei fra Samfundet til {hull[0].sted.properties.navn}…
          </Typography>
          <Typography sx={{ fontSize: 15 }}>
            {kat.emoji} Her skal du {kat.gjor}.
          </Typography>
          <Button variant="outlined" onClick={() => setIntro('ferdig')}>
            Hopp over
          </Button>
        </Stack>
      );
    }
    if (tur.ferdig) {
      return (
        <Oppsummering
          hull={hull}
          tur={tur}
          totalSekunder={rute?.totalSekunder}
          onNyTur={nyTur}
        />
      );
    }
    return (
      <StoppKort hull={hull} tur={tur} totalSekunder={rute?.totalSekunder} />
    );
  })();

  const synligeHull = tur.ferdig
    ? hull.length
    : intro === 'gaar'
      ? 0
      : tur.aktivtHull + 1;

  return (
    <RMap
      minZoom={6}
      initialCenter={TRONDHEIM_COORDS}
      initialZoom={14.3}
      initialPitch={50}
      maxPitch={75}
      mapStyle={KARTSTIL}
      style={{
        height: `calc(100dvh - var(--header-height))`,
      }}
      onClick={() => setValgtSted(undefined)}
    >
      {oppsett.fase === 'oversikt' && (
        <AktivitetMarkers
          steder={synlige}
          valgtId={valgtSted?.properties.id}
          onVelg={setValgtSted}
        />
      )}
      {oppsett.fase === 'oversikt' && valgtSted && (
        <RPopup
          longitude={valgtSted.geometry.coordinates[0]}
          latitude={valgtSted.geometry.coordinates[1]}
          offset={26}
        >
          <Box sx={{ minWidth: 170, maxWidth: 240, color: '#111' }}>
            <Typography sx={{ fontWeight: 900, fontSize: 15, color: '#111' }}>
              {kategoriById(valgtSted.properties.kategori).emoji}{' '}
              {valgtSted.properties.navn}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#333' }}>
              {kategoriById(valgtSted.properties.kategori).navn}
              {' · '}
              {Math.round(
                haversineMeter(
                  TRONDHEIM_COORDS,
                  valgtSted.geometry.coordinates as Punkt
                ) / 10
              ) * 10}{' '}
              m fra Torvet
            </Typography>
            <Typography sx={{ fontSize: 13, mt: 0.5, color: '#333' }}>
              {valgtSted.properties.fakta ??
                kategoriById(valgtSted.properties.kategori).fakta}
            </Typography>
          </Box>
        </RPopup>
      )}
      {iTur && hull.length > 0 && (
        <BaneLayer
          // Kun ett og ett stopp: de vi har vært på og det vi er på nå
          hull={hull.slice(0, synligeHull)}
          aktivtHull={tur.ferdig ? undefined : tur.aktivtHull}
          onVelgHull={tur.settHull}
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
      {iTur && intro === 'gaar' && hull.length > 0 && (
        <IntroGange
          fra={SAMFUNDET}
          til={hull[0].sted.geometry.coordinates as Punkt}
          onFerdig={() => setIntro('ferdig')}
        />
      )}
      {flyTil && (
        <MapFlyTo lng={flyTil.pos[0]} lat={flyTil.pos[1]} zoom={flyTil.zoom} />
      )}
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
          hull={hull[revealHull]}
          onLukk={() => setRevealHull(undefined)}
        />
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={nyTur}
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
        className="panel-bunn"
        style={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 1,
          width: 'min(360px, calc(100vw - 48px))',
          maxHeight: 'calc(100% - 24px)',
          overflowY: 'auto',
          padding: '12px',
        }}
      >
        <div className="pubgolf-panel">{panel}</div>
        {oppsett.fase === 'oversikt' && (
          <Typography
            variant="caption"
            component="p"
            sx={{ mt: 1, color: 'text.secondary' }}
          >
            Steder: © OpenStreetMap-bidragsytere. Kart: Esri, OpenFreeMap.
          </Typography>
        )}
      </Overlay>
    </RMap>
  );
};

function MapFlyTo({
  lng,
  lat,
  zoom,
}: {
  lng: number;
  lat: number;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    const mobil = window.matchMedia('(max-width: 600px)').matches;
    map.flyTo({
      center: [lng, lat],
      zoom,
      speed: 1.5,
      // Panelet ligger nederst på mobil, så flytt midten opp
      padding: { top: 0, left: 0, right: 0, bottom: mobil ? 320 : 0 },
    });
  }, [lng, lat, zoom, map]);

  return null;
}
