import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { spillLyd, snakk } from '../utils/lyd';
import { Box, Typography } from '@mui/material';
import { PROFILER } from '../data/profiler';
import { drinkById } from '../data/drinks';
import type { DrinkId } from '../types/pubgolf';

const bildeUrl = (id: DrinkId) => `${import.meta.env.BASE_URL}drinks/${id}.png`;

/** «Her lurer …»: tinder-matchen som venter på baren. */
export function PersonKort({ drink }: { drink: DrinkId }) {
  const p = PROFILER[drink];
  const d = drinkById(drink);
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 200 }}>
      <img
        src={bildeUrl(drink)}
        alt={p.profilnavn}
        style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
      <Box>
        <Typography sx={{ fontSize: 12, opacity: 0.8 }}>Her lurer</Typography>
        <Typography sx={{ fontWeight: 900, lineHeight: 1.1 }}>
          {p.profilnavn}, {p.alder}
        </Typography>
        <Typography sx={{ fontSize: 12 }}>
          {d.emoji} {d.navn}
        </Typography>
      </Box>
    </Box>
  );
}

/** Stor avsløring når man kommer frem til baren. */
export function Reveal({
  drink,
  hullNr,
  onLukk,
}: {
  drink: DrinkId;
  hullNr: number;
  onLukk: () => void;
}) {
  const p = PROFILER[drink];
  const d = drinkById(drink);
  useEffect(() => {
    // Trommevirvel først, så smell og navn på stemmen
    spillLyd('par');
    const t1 = setTimeout(() => spillLyd('strike'), 1600);
    const t2 = setTimeout(
      () => snakk(`Møt ${p.profilnavn}! Han drikker ${d.navn}.`),
      1900
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [p.profilnavn, d.navn]);
  return createPortal(
    <div className="reveal" onClick={onLukk}>
      <div className="reveal-kort">
        <div className="reveal-topp">
          Hull {hullNr}: møt {p.profilnavn} her!
        </div>
        <img
          src={bildeUrl(drink)}
          alt={p.profilnavn}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="reveal-navn">
          {p.profilnavn}, {p.alder}
        </div>
        <div className="reveal-drink">
          og {d.emoji} {d.navn} · Par {d.par}
        </div>
        <div className="reveal-trykk">Trykk for å starte 🍻</div>
      </div>
    </div>,
    document.body
  );
}
