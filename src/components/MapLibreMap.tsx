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
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { GaaMarker, IntroGange } from './Gaa';
import { KARTSTIL } from '../utils/kartstil';
import { hentGangLinje, type Punkt } from '../utils/gange';
import { Reveal } from './HullPerson';
import { BaneLayer } from './BaneLayer';
import { AktivitetMarkers } from './AktivitetMarkers';
import { StoppKort } from './StoppKort';
import { Oppsummering } from './Oppsummering';
import { OppdragPanel, type OppdragMedPos } from './OppdragPanel';
import { Faner, type Fane } from './Faner';
import { StedKarusell } from './StedKarusell';
import { TurVeiviser, type Interesse } from './TurVeiviser';
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

const OPPSETT_KEY = 'byvandring-oppsett-v4';

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

/** Valgene i tur-veiviseren, med et typisk bilde for hver. */
const INTERESSER: Interesse[] = (
  [
    { id: 'se', navn: 'Se byen', kategorier: ['se'] },
    { id: 'natur', navn: 'Natur og parker', kategorier: ['park', 'tur'] },
    { id: 'kultur', navn: 'Kunst og kultur', kategorier: ['museum', 'scene'] },
    { id: 'lek', navn: 'Lek', kategorier: ['lekeplass'] },
    {
      id: 'film',
      navn: 'Film og moro',
      kategorier: ['kino', 'bowling', 'spill'],
    },
    { id: 'bad', navn: 'Bad og badstue', kategorier: ['badstue', 'bading'] },
  ] as Interesse[]
)
  .filter((i) => i.kategorier.some((k) => ANTALL_PER_KATEGORI[k]))
  .map((i) => ({
    ...i,
    foto: STEDER.find((s) => i.kategorier.includes(s.properties.kategori))
      ?.properties.foto?.url,
  }));

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

const minutter = (s: Sted) =>
  Math.max(
    1,
    Math.round(
      haversineMeter(TRONDHEIM_COORDS, s.geometry.coordinates as Punkt) / 80
    )
  );

export const MapLibreMap = () => {
  const [oppsett, setOppsett] = useState<Oppsett>(lesOppsett);
  const [fane, setFane] = useState<Fane>(() =>
    lesOppsett().fase === 'tur' ? 'tur' : 'utforsk'
  );
  const [rute, setRute] = useState<
    { geometri: FeatureCollection; totalSekunder?: number } | undefined
  >(undefined);
  const [flyTil, setFlyTil] = useState<{ pos: Punkt; zoom: number }>();
  const [valgtSted, setValgtSted] = useState<Sted>();
  const [sok, setSok] = useState('');
  const [er3d, setEr3d] = useState(true);
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
  const tur = useTur(Math.max(hull.length, 1));

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

  // Steder som passer filteret og søket, nærmest Torvet først
  const liste = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return STEDER.filter(
      (s) =>
        !oppsett.skjult.includes(s.properties.kategori) &&
        (!q || s.properties.navn.toLowerCase().includes(q))
    ).sort(
      (a, b) =>
        haversineMeter(TRONDHEIM_COORDS, a.geometry.coordinates as Punkt) -
        haversineMeter(TRONDHEIM_COORDS, b.geometry.coordinates as Punkt)
    );
  }, [oppsett.skjult, sok]);

  const [intro, setIntro] = useState<'gaar' | 'ferdig'>('ferdig');
  const [revealHull, setRevealHull] = useState<number>();
  const [leg, setLeg] = useState<Punkt[]>();
  const [lukkedeOppdrag, setLukkedeOppdrag] = useState<string[]>([]);
  const [oppdragKlar, setOppdragKlar] = useState(false);

  const lagTur = (stopp: number, kategorier: KategoriId[]) => {
    const unike = [...new Set(kategorier)];
    const bane = lagBesteTur(STEDER, unike, stopp, TRONDHEIM_COORDS);
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
    setFane('tur');
  };

  const nyTur = () => {
    tur.nullstill();
    setRute(undefined);
    setIntro('ferdig');
    setLeg(undefined);
    setOppsett((o) => ({ ...o, fase: 'oversikt', turIds: [] }));
  };

  const iTur = oppsett.fase === 'tur';
  const aktivtHullNr = tur.aktivtHull;
  const paaTurFane = iTur && fane === 'tur';
  const aktivSted = iTur && !tur.ferdig ? hull[aktivtHullNr]?.sted : undefined;

  // Følg aktivt stopp på kartet
  useEffect(() => {
    if (aktivSted && fane === 'tur')
      setFlyTil({ pos: aktivSted.geometry.coordinates as Punkt, zoom: 15.5 });
  }, [aktivSted, fane]);

  // Oppdrag i nærheten dukker opp litt ut i turen, ikke med en gang
  useEffect(() => {
    setOppdragKlar(false);
    if (!paaTurFane || intro !== 'ferdig' || tur.ferdig || aktivtHullNr < 1)
      return;
    const t = setTimeout(() => setOppdragKlar(true), 3500);
    return () => clearTimeout(t);
  }, [aktivtHullNr, paaTurFane, intro, tur.ferdig]);

  // Kort ved hvert nytt stopp
  useEffect(() => {
    if (paaTurFane && intro === 'ferdig' && !tur.ferdig)
      setRevealHull(aktivtHullNr);
    else setRevealHull(undefined);
  }, [aktivtHullNr, paaTurFane, intro, tur.ferdig]);

  // Kun etappen til neste stopp tegnes, ikke hele ruten på en gang
  useEffect(() => {
    setLeg(undefined);
    if (!paaTurFane || intro !== 'ferdig' || tur.ferdig || aktivtHullNr < 1)
      return;
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
  }, [aktivtHullNr, paaTurFane, intro, tur.ferdig, hull]);

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

  const synligeHull = tur.ferdig
    ? hull.length
    : intro === 'gaar'
      ? 0
      : tur.aktivtHull + 1;

  const velgSted = (s: Sted) => {
    setValgtSted(s);
    setFlyTil({ pos: s.geometry.coordinates as Punkt, zoom: 15.5 });
  };

  // Innholdet i arket på «Min tur»
  const turInnhold = (() => {
    if (!iTur) return <TurVeiviser interesser={INTERESSER} onLag={lagTur} />;
    if (intro === 'gaar' && hull[0]) {
      return (
        <Stack spacing={1}>
          <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
            På vei fra Studentersamfundet til {hull[0].sted.properties.navn}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            Første stopp: {kategoriById(hull[0].kategori).navn.toLowerCase()}.
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
      <>
        <StoppKort hull={hull} tur={tur} totalSekunder={rute?.totalSekunder} />
        <Box className="forhand">
          {hull.map((h, i) => (
            <button
              key={h.sted.properties.id}
              aria-label={`Stopp ${h.nr}: ${h.sted.properties.navn}`}
              className={i === tur.aktivtHull ? 'aktiv' : ''}
              onClick={() => tur.settHull(i)}
              style={{
                backgroundImage: h.sted.properties.foto
                  ? `url("${h.sted.properties.foto.url}")`
                  : undefined,
              }}
            />
          ))}
        </Box>
        <Button
          size="small"
          color="inherit"
          onClick={nyTur}
          sx={{ mt: 0.5, color: 'text.secondary' }}
        >
          Lag ny tur
        </Button>
      </>
    );
  })();

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
      <div className="sidebar-bg" />
      <KartModus er3d={er3d} />
      {fane === 'utforsk' && (
        <AktivitetMarkers
          steder={liste}
          valgtId={valgtSted?.properties.id}
          onVelg={velgSted}
        />
      )}
      {fane === 'oppdrag' &&
        oppdragMedPos.map((o, i) => (
          <RMarker key={o.id} longitude={o.pos[0]} latitude={o.pos[1]}>
            <div className="oppdrag-pin" title={o.tittel}>
              {i + 1}
            </div>
          </RMarker>
        ))}
      {iTur && fane === 'tur' && hull.length > 0 && (
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
      {paaTurFane && intro === 'gaar' && hull.length > 0 && (
        <IntroGange
          fra={SAMFUNDET}
          til={hull[0].sted.geometry.coordinates as Punkt}
          onFerdig={() => setIntro('ferdig')}
        />
      )}
      {flyTil && (
        <MapFlyTo lng={flyTil.pos[0]} lat={flyTil.pos[1]} zoom={flyTil.zoom} />
      )}

      {fane === 'utforsk' && (
        <div className="topp">
          <label className="sok">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#5b6b76"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              value={sok}
              onChange={(e) => setSok(e.target.value)}
              placeholder="Utforsk Trondheim"
              aria-label="Søk etter steder"
            />
          </label>
          <div className="chips-rad">
            <Chip
              label="Alle"
              onClick={() => setOppsett((o) => ({ ...o, skjult: [] }))}
              color={oppsett.skjult.length === 0 ? 'primary' : 'default'}
              sx={{
                fontWeight: 600,
                bgcolor: oppsett.skjult.length ? '#fff' : undefined,
              }}
            />
            {TILGJENGELIGE.map((k) => {
              const av = oppsett.skjult.includes(k.id);
              return (
                <Chip
                  key={k.id}
                  label={k.navn}
                  onClick={() =>
                    setOppsett((o) => ({
                      ...o,
                      skjult: av
                        ? o.skjult.filter((x) => x !== k.id)
                        : [...o.skjult, k.id],
                    }))
                  }
                  sx={{
                    fontWeight: 600,
                    bgcolor: av ? '#fff' : k.farge,
                    color: av ? '#1b2a35' : '#fff',
                    border: `2px solid ${k.farge}`,
                    '&:hover': { bgcolor: av ? '#f0f3f5' : k.farge },
                  }}
                />
              );
            })}
          </div>
        </div>
      )}

      {paaTurFane && iTur && !tur.ferdig && intro === 'ferdig' && (
        <div
          className="fremdrift"
          aria-label={`Stopp ${tur.aktivtHull + 1} av ${hull.length}`}
        >
          {hull.map((h, i) => (
            <span
              key={h.sted.properties.id}
              className={
                tur.gjort[i] ? 'g' : i === tur.aktivtHull ? 'n' : undefined
              }
            />
          ))}
          <em>
            Stopp {tur.aktivtHull + 1} av {hull.length}
          </em>
        </div>
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

      <div className={`side${fane === 'utforsk' ? ' lav' : ''}`}>
        <button
          className="rund"
          onClick={() => setEr3d((v) => !v)}
          aria-label={er3d ? 'Bytt til flatt kart' : 'Bytt til 3D-kart'}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0f3b57"
            strokeWidth="2"
            strokeLinejoin="round"
          >
            <path d="M12 3l9 5-9 5-9-5 9-5z" />
            <path d="M3 13l9 5 9-5" />
          </svg>
          <small>{er3d ? '3D' : '2D'}</small>
        </button>
        <button
          className="rund"
          onClick={() => setFlyTil({ pos: TRONDHEIM_COORDS, zoom: 14.5 })}
          aria-label="Vis sentrum"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0f3b57"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="7" />
            <circle cx="12" cy="12" r="2.5" fill="#0f3b57" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
        </button>
      </div>

      {fane === 'utforsk' && (
        <StedKarusell
          steder={liste}
          valgtId={valgtSted?.properties.id}
          onVelg={velgSted}
          minutter={minutter}
        />
      )}
      {fane === 'tur' && <div className="ark">{turInnhold}</div>}
      {fane === 'oppdrag' && (
        <div className="ark">
          <OppdragPanel
            oppdrag={oppdragMedPos}
            gjort={oppdrag.gjort}
            onVeksle={oppdrag.veksle}
            onVis={(pos) => setFlyTil({ pos, zoom: 16 })}
          />
        </div>
      )}

      {revealHull !== undefined && hull[revealHull] && (
        <Reveal
          hull={hull[revealHull]}
          antall={hull.length}
          onLukk={() => setRevealHull(undefined)}
        />
      )}

      <Faner
        aktiv={fane}
        onVelg={setFane}
        badge={{
          tur: iTur && !tur.ferdig ? hull.length - tur.aktivtHull : 0,
          oppdrag: OPPDRAG.length - oppdrag.gjort.length,
        }}
      />
    </RMap>
  );
};

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
    // PC: sidekolonnen dekker venstre side. Mobil: kort og ark ligger nederst.
    const pc = window.matchMedia('(min-width: 900px)').matches;
    const mobil = window.matchMedia('(max-width: 600px)').matches;
    map.flyTo({
      center: [lng, lat],
      zoom,
      speed: 1.5,
      padding: {
        top: 0,
        left: pc ? 420 : 0,
        right: 0,
        bottom: !pc && mobil ? 280 : 0,
      },
    });
  }, [lng, lat, zoom, map]);

  return null;
}
