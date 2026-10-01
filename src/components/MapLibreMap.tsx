import 'maplibre-gl/dist/maplibre-gl.css';
import {
  RLayer,
  RMap,
  RMarker,
  RSource,
  useMap,
} from 'maplibre-react-components';
import { useEffect, useMemo, useState } from 'react';
import type { FeatureCollection } from 'geojson';
import {
  Box,
  Button,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Overlay } from './Overlay';
import { GaaMarker, IntroGange } from './Gaa';
import { KARTSTIL } from '../utils/kartstil';
import { hentGangLinje, type Punkt } from '../utils/gange';
import { Reveal } from './HullPerson';
import { BaneLayer } from './BaneLayer';
import { AktivitetMarkers } from './AktivitetMarkers';
import { StoppKort } from './StoppKort';
import { Oppsummering } from './Oppsummering';
import { OppdragPanel, type OppdragMedPos } from './OppdragPanel';
import { useTur } from '../hooks/useTur';
import { useOppdrag } from '../hooks/useOppdrag';
import { OPPDRAG } from '../data/oppdrag';
import { haversineMeter, lagBesteTur } from '../utils/bane';
import { getBaneRute } from '../api/getBaneRute';
import { KATEGORIER, kategoriById } from '../data/kategorier';
import type { Hull, KategoriId, Sted, StedCollection } from '../types/pubgolf';
import aktiviteter from '../sample_data/aktiviteter.json';

// Torvet, midt i Midtbyen
const TRONDHEIM_COORDS: Punkt = [10.39506, 63.43049];

const ANTALL_STOPP = 7;
const OPPSETT_KEY = 'byvandring-oppsett-v3';

// Kun steder vi har et ekte foto av
const STEDER: Sted[] = (aktiviteter as StedCollection).features.filter(
  (s) => s.properties.foto
);
const SAMFUNDET: Punkt = (STEDER.find((s) => s.properties.id === 'samfundet')
  ?.geometry.coordinates as Punkt | undefined) ?? [10.3942, 63.4225];

const ANTALL_PER_KATEGORI = STEDER.reduce<Partial<Record<KategoriId, number>>>(
  (acc, s) => {
    acc[s.properties.kategori] = (acc[s.properties.kategori] ?? 0) + 1;
    return acc;
  },
  {}
);
const TILGJENGELIGE = KATEGORIER.filter((k) => ANTALL_PER_KATEGORI[k.id]);

type Fase = 'oversikt' | 'tur';
type Oppsett = {
  fase: Fase;
  /** Kategorier som er skrudd av i filteret */
  skjult: KategoriId[];
  turIds: string[];
};

const TOMT: Oppsett = { fase: 'oversikt', skjult: [], turIds: [] };

function lesOppsett(): Oppsett {
  try {
    const raw = localStorage.getItem(OPPSETT_KEY);
    if (raw) {
      const o = { ...TOMT, ...(JSON.parse(raw) as Oppsett) };
      const ids = new Set(STEDER.map((s) => s.properties.id));
      if (o.fase === 'tur' && !o.turIds.every((id) => ids.has(id))) return TOMT;
      return o;
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
  const [er3d, setEr3d] = useState(true);
  const [visOppdrag, setVisOppdrag] = useState(false);
  const tur = useTur(ANTALL_STOPP);
  const oppdrag = useOppdrag();

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
        const sted = STEDER.find((s) => s.properties.id === id);
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
    () => STEDER.filter((s) => !oppsett.skjult.includes(s.properties.kategori)),
    [oppsett.skjult]
  );

  const [intro, setIntro] = useState<'gaar' | 'ferdig'>('ferdig');
  const [revealHull, setRevealHull] = useState<number>();
  const [leg, setLeg] = useState<Punkt[]>();
  const [lukkedeOppdrag, setLukkedeOppdrag] = useState<string[]>([]);
  const [oppdragKlar, setOppdragKlar] = useState(false);

  const planlegg = () => {
    const kategorier = TILGJENGELIGE.map((k) => k.id).filter(
      (k) => !oppsett.skjult.includes(k)
    );
    if (kategorier.length === 0) return;
    const bane = lagBesteTur(
      STEDER,
      kategorier,
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

  // Oppdrag i nærheten dukker opp litt ut i turen, ikke med en gang
  useEffect(() => {
    setOppdragKlar(false);
    if (!iTur || intro !== 'ferdig' || tur.ferdig || aktivtHullNr < 1) return;
    const t = setTimeout(() => setOppdragKlar(true), 3500);
    return () => clearTimeout(t);
  }, [aktivtHullNr, iTur, intro, tur.ferdig]);

  // Kort ved hvert nytt stopp
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

  // Oppdrag med posisjon og avstand fra der man er
  const referanse: Punkt =
    (aktivSted?.geometry.coordinates as Punkt | undefined) ?? TRONDHEIM_COORDS;
  const oppdragMedPos: OppdragMedPos[] = useMemo(
    () =>
      OPPDRAG.flatMap((o) => {
        const sted = STEDER.find((s) => s.properties.id === o.stedId);
        if (!sted) return [];
        const pos = sted.geometry.coordinates as Punkt;
        return [{ ...o, pos, meter: haversineMeter(referanse, pos) }];
      }).sort((a, b) => a.meter - b.meter),
    [referanse]
  );
  const naerOppdrag =
    aktivSted && oppdragKlar
      ? oppdragMedPos.find(
          (o) =>
            o.meter <= 300 &&
            !oppdrag.gjort.includes(o.id) &&
            !lukkedeOppdrag.includes(o.id)
        )
      : undefined;

  const panel = (() => {
    if (!iTur) {
      return (
        <Stack spacing={1.25}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
          >
            <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
              Utforsk Trondheim
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
              {synlige.length} steder
            </Typography>
          </Stack>
          <Box className="filter-rad">
            <Chip
              label="Alle"
              onClick={() => setOppsett((o) => ({ ...o, skjult: [] }))}
              color={oppsett.skjult.length === 0 ? 'primary' : 'default'}
              variant={oppsett.skjult.length === 0 ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />
            {TILGJENGELIGE.map((k) => {
              const av = oppsett.skjult.includes(k.id);
              return (
                <Chip
                  key={k.id}
                  label={`${k.navn} ${ANTALL_PER_KATEGORI[k.id]}`}
                  onClick={() =>
                    setOppsett((o) => ({
                      ...o,
                      skjult: av
                        ? o.skjult.filter((x) => x !== k.id)
                        : [...o.skjult, k.id],
                    }))
                  }
                  variant={av ? 'outlined' : 'filled'}
                  sx={{
                    fontWeight: 600,
                    bgcolor: av ? 'transparent' : k.farge,
                    color: av ? 'text.secondary' : '#fff',
                    borderColor: k.farge,
                    '&:hover': { bgcolor: av ? '#f0f3f5' : k.farge },
                  }}
                />
              );
            })}
          </Box>
          {valgtSted && (
            <StedKort sted={valgtSted} onLukk={() => setValgtSted(undefined)} />
          )}
          <Button
            fullWidth
            variant="contained"
            onClick={planlegg}
            disabled={synlige.length === 0}
            sx={{ height: 50, fontSize: 17 }}
          >
            Planlegg tur
          </Button>
        </Stack>
      );
    }
    if (intro === 'gaar' && hull[0]) {
      const kat = kategoriById(hull[0].kategori);
      return (
        <Stack spacing={1}>
          <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
            På vei fra Studentersamfundet til {hull[0].sted.properties.navn}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            Første stopp: {kat.navn.toLowerCase()}.
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
      style={{ height: `calc(100dvh - var(--header-height))` }}
      onClick={() => setValgtSted(undefined)}
    >
      <KartModus er3d={er3d} />
      {!iTur && (
        <AktivitetMarkers
          steder={synlige}
          valgtId={valgtSted?.properties.id}
          onVelg={(s) => {
            setValgtSted(s);
            setFlyTil({ pos: s.geometry.coordinates as Punkt, zoom: 15.5 });
          }}
        />
      )}
      {visOppdrag &&
        oppdragMedPos.map((o, i) => (
          <RMarker key={o.id} longitude={o.pos[0]} latitude={o.pos[1]}>
            <div className="oppdrag-pin" title={o.tittel}>
              {i + 1}
            </div>
          </RMarker>
        ))}
      {iTur && hull.length > 0 && (
        <BaneLayer
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
              'line-color': '#0f8ad6',
              'line-width': 5,
              'line-opacity': 0.9,
            }}
          />
          <GaaMarker linje={leg} varighetMs={8000} klasse="gruppe" loop />
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
      {naerOppdrag && (
        <div className="oppdragskort">
          <Typography sx={{ fontSize: 12, color: '#e07a1f', fontWeight: 700 }}>
            OPPDRAG I NÆRHETEN
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: 17 }}>
            {naerOppdrag.tittel}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            {naerOppdrag.tekst}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => oppdrag.veksle(naerOppdrag.id)}
            >
              Gjort
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={() => setLukkedeOppdrag((l) => [...l, naerOppdrag.id])}
            >
              Lukk
            </Button>
          </Stack>
        </div>
      )}
      {revealHull !== undefined && hull[revealHull] && (
        <Reveal
          hull={hull[revealHull]}
          antall={hull.length}
          onLukk={() => setRevealHull(undefined)}
        />
      )}
      {visOppdrag && (
        <OppdragPanel
          oppdrag={oppdragMedPos}
          gjort={oppdrag.gjort}
          onVeksle={oppdrag.veksle}
          onVis={(pos) => {
            setFlyTil({ pos, zoom: 16 });
            setVisOppdrag(false);
          }}
          onLukk={() => setVisOppdrag(false)}
        />
      )}

      <Stack
        spacing={0.75}
        alignItems="flex-end"
        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}
      >
        <ToggleButtonGroup
          size="small"
          exclusive
          value={er3d ? '3d' : '2d'}
          onChange={(_, v) => v && setEr3d(v === '3d')}
          sx={{ bgcolor: '#fff', boxShadow: 2 }}
        >
          <ToggleButton value="2d" sx={{ px: 1.5, fontWeight: 700 }}>
            2D
          </ToggleButton>
          <ToggleButton value="3d" sx={{ px: 1.5, fontWeight: 700 }}>
            3D
          </ToggleButton>
        </ToggleButtonGroup>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => setVisOppdrag((v) => !v)}
          sx={{ boxShadow: 2 }}
        >
          Oppdrag ({oppdrag.gjort.length}/{OPPDRAG.length})
        </Button>
        <Button
          size="small"
          variant="contained"
          color="inherit"
          onClick={nyTur}
          sx={{ bgcolor: '#fff', boxShadow: 2 }}
        >
          Start på nytt
        </Button>
      </Stack>

      <Overlay
        className="panel panel-bunn"
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 1,
          width: 'min(380px, calc(100vw - 32px))',
          maxHeight: 'calc(100% - 16px)',
          overflowY: 'auto',
        }}
      >
        {panel}
        {!iTur && (
          <Typography
            variant="caption"
            component="p"
            sx={{ mt: 1, color: 'text.secondary', fontSize: 10 }}
          >
            Steder og kart: © OpenStreetMap-bidragsytere. Satellitt: Esri.
            Bilder: Wikimedia Commons.
          </Typography>
        )}
      </Overlay>
    </RMap>
  );
};

function StedKort({ sted, onLukk }: { sted: Sted; onLukk: () => void }) {
  const kat = kategoriById(sted.properties.kategori);
  const foto = sted.properties.foto;
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.25,
        p: 1,
        border: '1px solid #dde4e9',
        borderRadius: 2,
      }}
    >
      {foto && (
        <Box
          sx={{
            width: 84,
            height: 84,
            flexShrink: 0,
            borderRadius: 1.5,
            background: `url("${foto.url}") center / cover`,
          }}
        />
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>
              {sted.properties.navn}
            </Typography>
            <Typography
              sx={{ fontSize: 12, color: kat.farge, fontWeight: 700 }}
            >
              {kat.navn}
            </Typography>
          </Box>
          <Button
            size="small"
            color="inherit"
            onClick={onLukk}
            sx={{ minWidth: 0 }}
          >
            Lukk
          </Button>
        </Stack>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.25 }}>
          {sted.properties.fakta ?? kat.fakta}
        </Typography>
        {foto && (
          <Typography
            component="a"
            href={foto.side}
            target="_blank"
            rel="noreferrer"
            sx={{ fontSize: 10, color: 'text.secondary' }}
          >
            Foto: {foto.forfatter} ({foto.lisens})
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/** Bytter mellom 2D (flatt kart) og 3D (vinklet kart med bygninger og terreng). */
function KartModus({ er3d }: { er3d: boolean }) {
  const map = useMap();

  useEffect(() => {
    const bruk = () => {
      if (map.getLayer('bygg-3d'))
        map.setLayoutProperty(
          'bygg-3d',
          'visibility',
          er3d ? 'visible' : 'none'
        );
      map.setTerrain(er3d ? { source: 'terreng', exaggeration: 1.3 } : null);
      map.easeTo({ pitch: er3d ? 50 : 0, bearing: 0, duration: 600 });
    };
    if (map.isStyleLoaded()) bruk();
    else map.once('load', bruk);
  }, [er3d, map]);

  return null;
}

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
      padding: { top: 0, left: 0, right: 0, bottom: mobil ? 300 : 0 },
    });
  }, [lng, lat, zoom, map]);

  return null;
}
