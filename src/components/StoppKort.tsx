import { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { Hull } from '../types/pubgolf';
import type { Tur } from '../hooks/useTur';
import { kategoriById } from '../data/kategorier';

type Props = {
  hull: Hull[];
  tur: Tur;
  totalSekunder?: number;
};

/** Kortet for stoppet du er på, med store knapper. */
export function StoppKort({ hull, tur, totalSekunder }: Props) {
  const [gjortId, setGjortId] = useState<number>();
  useEffect(() => {
    if (!gjortId) return;
    const t = setTimeout(() => setGjortId(undefined), 1400);
    return () => clearTimeout(t);
  }, [gjortId]);

  const h = hull[tur.aktivtHull];
  if (!h) return null;
  const kat = kategoriById(h.kategori);
  const siste = tur.aktivtHull === hull.length - 1;
  const foto = h.sted.properties.foto;

  const gjort = () => {
    setGjortId(Date.now());
    // La beskjeden vises litt før vi går videre
    setTimeout(() => tur.fullfor(tur.aktivtHull, true), 800);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 380 }}>
      {gjortId && <div className="gjort">Gjort!</div>}
      <Stack direction="row" spacing={1.5} alignItems="center">
        {foto && (
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: 2,
              flexShrink: 0,
              background: `url("${foto.url}") center / cover`,
            }}
          />
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            Stopp {tur.aktivtHull + 1} av {hull.length} · {kat.navn}
            {totalSekunder
              ? ` · ca. ${Math.round(totalSekunder / 60)} min gange totalt`
              : ''}
          </Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 800, lineHeight: 1.15 }}>
            {h.sted.properties.navn}
          </Typography>
        </Box>
      </Stack>
      <Typography sx={{ fontSize: 15, mt: 1, color: 'text.secondary' }}>
        {h.sted.properties.fakta ?? kat.fakta}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          variant="outlined"
          disabled={tur.aktivtHull === 0}
          onClick={tur.forrige}
          sx={{ height: 52, minWidth: 64 }}
        >
          Tilbake
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="success"
          onClick={gjort}
          sx={{ height: 52, fontSize: 18, fontWeight: 700 }}
        >
          {siste ? 'Gjort, avslutt' : 'Gjort'}
        </Button>
      </Stack>
      <Button
        fullWidth
        color="inherit"
        onClick={() => tur.fullfor(tur.aktivtHull, false)}
        sx={{ mt: 0.5, color: 'text.secondary' }}
      >
        Hopp over
      </Button>
    </Box>
  );
}
