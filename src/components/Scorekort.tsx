import { Box, Button, Chip, IconButton, Stack, Typography } from '@mui/material';
import type { Hull } from '../types/pubgolf';
import type { PubgolfSpill } from '../hooks/usePubgolf';
import { drinkById } from '../data/drinks';
import { golfNavn, scoreMotPar } from '../utils/score';

type Props = {
  hull: Hull[];
  spill: PubgolfSpill;
  totalSekunder?: number;
  onVisHull: (hullIdx: number) => void;
};

function motParTekst(n: number) {
  return n === 0 ? 'E' : n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

export function Scorekort({ hull, spill, totalSekunder, onVisHull }: Props) {
  const { spillere, aktivtHull } = spill;
  const h = hull[aktivtHull];
  if (!h) return null;
  const drink = drinkById(h.drink);
  const siste = aktivtHull === hull.length - 1;
  const totalPris = hull.reduce((s, x) => s + x.bar.properties.pris, 0);

  return (
    <Box sx={{ p: 2, width: '100%', maxWidth: 360 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Hull {aktivtHull + 1}/{hull.length} · {h.bar.properties.navn} · {h.bar.properties.pris},-
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.5 }}>
        {drink.emoji} {drink.navn}
      </Typography>
      <Chip size="small" label={`Par ${h.par}`} sx={{ mb: 1 }} />

      <Stack spacing={1.5} sx={{ my: 1 }}>
        {spillere.map((p, si) => {
          const v = p.slurker[aktivtHull];
          const diff = scoreMotPar(p, hull);
          const spilt = p.slurker.some((x) => x !== undefined);
          return (
            <Box key={p.navn} sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ flex: 1, fontWeight: 600 }} noWrap>
                  {p.navn}
                </Typography>
                <IconButton
                  size="small"
                  aria-label="Færre slurker"
                  disabled={v === undefined}
                  onClick={() => spill.settSlurker(si, aktivtHull, v !== undefined && v > 1 ? v - 1 : undefined)}
                >
                  −
                </IconButton>
                <Typography sx={{ minWidth: 28, textAlign: 'center', fontSize: 20 }}>{v ?? '–'}</Typography>
                <IconButton
                  size="small"
                  aria-label="Flere slurker"
                  onClick={() => spill.settSlurker(si, aktivtHull, v === undefined ? h.par : v + 1)}
                >
                  +
                </IconButton>
              </Stack>
              {h.drink === 'guinness' && (
                <Chip
                  size="small"
                  sx={{ mt: 0.5 }}
                  label="Split the G 🥇 (−1)"
                  color={p.splitTheG[aktivtHull] ? 'warning' : 'default'}
                  variant={p.splitTheG[aktivtHull] ? 'filled' : 'outlined'}
                  onClick={() => spill.toggleSplitTheG(si, aktivtHull)}
                />
              )}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Totalt: {motParTekst(diff)}
                </Typography>
                {spilt && (
                  <Chip
                    size="small"
                    label={golfNavn(diff)}
                    color={diff < 0 ? 'success' : diff > 0 ? 'error' : 'default'}
                  />
                )}
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                  {totalPris},- runden
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Stack>

      <Stack direction="row" spacing={0.5} justifyContent="center" sx={{ my: 1 }}>
        {hull.map((x, i) => (
          <Chip
            key={x.nr}
            size="small"
            label={i + 1}
            color={i === aktivtHull ? 'primary' : 'default'}
            variant={i === aktivtHull ? 'filled' : 'outlined'}
            onClick={() => spill.settHull(i)}
            sx={{ minWidth: 0, '& .MuiChip-label': { px: 0.75 } }}
          />
        ))}
      </Stack>

      <Stack direction="row" spacing={1}>
        <Button size="small" disabled={aktivtHull === 0} onClick={spill.forrigeHull}>
          ← Forrige
        </Button>
        <Button size="small" onClick={() => onVisHull(aktivtHull)}>
          Vis på kart
        </Button>
        {siste ? (
          <Button size="small" variant="contained" onClick={spill.avslutt} sx={{ ml: 'auto' }}>
            Avslutt runden 🏁
          </Button>
        ) : (
          <Button size="small" variant="contained" onClick={spill.nesteHull} sx={{ ml: 'auto' }}>
            Neste hull →
          </Button>
        )}
      </Stack>

      <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1.5 }}>
        Pris for runden: {totalPris},- per spiller
        {totalSekunder ? ` · Rute: ca. ${Math.round(totalSekunder / 60)} min` : ''}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="div">
        Drikk vann mellom hullene 💧
      </Typography>
    </Box>
  );
}
