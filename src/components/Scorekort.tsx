import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Effekt } from './Effekt';
import { snakk, spillLyd, type EffektType } from '../utils/lyd';
import type { Hull } from '../types/pubgolf';
import type { PubgolfSpill } from '../hooks/usePubgolf';
import { drinkById } from '../data/drinks';
import {
  SPLIT_THE_G_BONUS,
  golfLinje,
  golfNavn,
  scoreMotPar,
} from '../utils/score';

type Props = {
  hull: Hull[];
  spill: PubgolfSpill;
  totalSekunder?: number;
  onVisHull?: (hullIdx: number) => void;
};

function motParTekst(n: number) {
  return n === 0 ? 'E' : n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

export function Scorekort({ hull, spill, totalSekunder }: Props) {
  const { spillere, aktivtHull } = spill;
  const [effekt, setEffekt] = useState<{
    type: EffektType;
    id: number;
    tekst: string;
  }>();
  useEffect(() => {
    if (!effekt) return;
    const t = setTimeout(() => setEffekt(undefined), 1600);
    return () => clearTimeout(t);
  }, [effekt]);
  const h = hull[aktivtHull];
  if (!h) return null;
  const drink = drinkById(h.drink);
  const siste = aktivtHull === hull.length - 1;
  const visEffekt = (slag: number | undefined) => {
    if (slag === undefined) return;
    const diff = slag - h.par;
    const type: EffektType =
      diff < 0 ? 'strike' : diff === 0 ? 'par' : 'gutter';
    spillLyd(type);
    snakk(golfLinje(diff));
    setEffekt({ type, id: Date.now(), tekst: golfNavn(diff) });
  };
  const settSlurker = (si: number, n: number | undefined) => {
    spill.settSlurker(si, aktivtHull, n);
    visEffekt(
      n === undefined
        ? undefined
        : n + (spillere[si].splitTheG[aktivtHull] ? SPLIT_THE_G_BONUS : 0)
    );
  };

  const stor = {
    minWidth: 64,
    height: 64,
    fontSize: 36,
    fontWeight: 900,
    borderRadius: 3,
    lineHeight: 1,
  } as const;

  return (
    <Box sx={{ p: 1, width: '100%', maxWidth: 360 }}>
      {effekt && (
        <Effekt key={effekt.id} type={effekt.type} tekst={effekt.tekst} />
      )}
      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
        Hull {aktivtHull + 1} av {hull.length}
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1 }}>
        {h.bar.properties.navn}
      </Typography>
      <Typography sx={{ fontSize: 22, mt: 0.5 }}>
        {drink.emoji} {drink.navn} · Par {h.par} · {h.bar.properties.pris},-
      </Typography>

      <Stack spacing={1.5} sx={{ my: 1.5 }}>
        {spillere.map((p, si) => {
          const v = p.slurker[aktivtHull];
          const diff = scoreMotPar(p, hull);
          const spilt = p.slurker.some((x) => x !== undefined);
          return (
            <Box
              key={p.navn}
              sx={{
                bgcolor: 'rgba(255,255,255,0.08)',
                borderRadius: 3,
                p: 1.5,
              }}
            >
              <Typography sx={{ fontSize: 20, fontWeight: 800 }} noWrap>
                {p.navn}{' '}
                <Typography component="span" sx={{ fontSize: 16 }}>
                  {spilt ? `${motParTekst(diff)} · ${golfNavn(diff)}` : ''}
                </Typography>
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 0.5 }}
              >
                <Button
                  variant="contained"
                  color="inherit"
                  aria-label="Færre slurker"
                  disabled={v === undefined}
                  sx={stor}
                  onClick={() =>
                    settSlurker(
                      si,
                      v !== undefined && v > 1 ? v - 1 : undefined
                    )
                  }
                >
                  −
                </Button>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    sx={{ fontSize: 48, fontWeight: 900, lineHeight: 1 }}
                  >
                    {v ?? '–'}
                  </Typography>
                  <Typography sx={{ fontSize: 12 }}>slurker</Typography>
                </Box>
                <Button
                  variant="contained"
                  color="success"
                  aria-label="Flere slurker"
                  sx={stor}
                  onClick={() =>
                    settSlurker(si, v === undefined ? h.par : v + 1)
                  }
                >
                  +
                </Button>
              </Stack>
              {h.drink === 'guinness' && (
                <Button
                  fullWidth
                  sx={{ mt: 1, height: 48, fontSize: 16, fontWeight: 800 }}
                  variant={p.splitTheG[aktivtHull] ? 'contained' : 'outlined'}
                  color="warning"
                  onClick={() => {
                    spill.toggleSplitTheG(si, aktivtHull);
                    if (v !== undefined)
                      visEffekt(
                        v + (p.splitTheG[aktivtHull] ? 0 : SPLIT_THE_G_BONUS)
                      );
                  }}
                >
                  🥇 Split the G (−1)
                </Button>
              )}
            </Box>
          );
        })}
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          disabled={aktivtHull === 0}
          onClick={spill.forrigeHull}
          sx={{ height: 56, fontSize: 22, minWidth: 64 }}
        >
          ←
        </Button>
        {siste ? (
          <Button
            fullWidth
            variant="contained"
            onClick={spill.avslutt}
            sx={{ height: 56, fontSize: 20, fontWeight: 800 }}
          >
            Ferdig! 🏁
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            onClick={spill.nesteHull}
            sx={{ height: 56, fontSize: 20, fontWeight: 800 }}
          >
            Neste bar 🍻
          </Button>
        )}
      </Stack>
      <Typography sx={{ fontSize: 14, mt: 1, textAlign: 'center' }}>
        💧 Ta et glass vann
        {totalSekunder ? ` · ${Math.round(totalSekunder / 60)} min gange` : ''}
      </Typography>
    </Box>
  );
}
