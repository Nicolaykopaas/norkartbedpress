import { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import type { Hull } from '../types/pubgolf';
import type { Tur } from '../hooks/useTur';
import { kategoriById } from '../data/kategorier';
import { snakk, spillLyd } from '../utils/lyd';
import { Effekt } from './Effekt';

const JUBEL = ['Bra jobba!', 'Fantastisk!', 'Der satt den!', 'Yes!', 'Supert!'];

type Props = {
  hull: Hull[];
  tur: Tur;
  totalSekunder?: number;
};

/** Kortet for stoppet du er på: hva du skal gjøre, og store knapper. */
export function StoppKort({ hull, tur, totalSekunder }: Props) {
  const [jubel, setJubel] = useState<{ id: number; tekst: string }>();
  useEffect(() => {
    if (!jubel) return;
    const t = setTimeout(() => setJubel(undefined), 1500);
    return () => clearTimeout(t);
  }, [jubel]);

  const h = hull[tur.aktivtHull];
  if (!h) return null;
  const kat = kategoriById(h.kategori);
  const siste = tur.aktivtHull === hull.length - 1;

  const gjort = () => {
    const tekst = JUBEL[Math.floor(Math.random() * JUBEL.length)];
    spillLyd('strike');
    snakk(tekst);
    setJubel({ id: Date.now(), tekst: 'Gjort!' });
    // La jubelen vises litt før vi går videre
    setTimeout(() => tur.fullfor(tur.aktivtHull, true), 900);
  };

  return (
    <Box sx={{ p: 1, width: '100%', maxWidth: 360 }}>
      {jubel && <Effekt key={jubel.id} type="strike" tekst={jubel.tekst} />}
      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
        Stopp {tur.aktivtHull + 1} av {hull.length}
        {totalSekunder
          ? ` · ca. ${Math.round(totalSekunder / 60)} min gange`
          : ''}
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
        <Box sx={{ fontSize: 52, lineHeight: 1 }}>{kat.emoji}</Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>
            {kat.navn}
          </Typography>
          <Typography sx={{ fontSize: 16 }} noWrap>
            {h.sted.properties.navn}
          </Typography>
        </Box>
      </Stack>
      <Typography sx={{ fontSize: 15, mt: 1, opacity: 0.9 }}>
        {h.sted.properties.fakta ?? kat.fakta}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <Button
          variant="outlined"
          disabled={tur.aktivtHull === 0}
          onClick={tur.forrige}
          sx={{ height: 60, fontSize: 22, minWidth: 64 }}
          aria-label="Forrige"
        >
          ←
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="success"
          onClick={gjort}
          sx={{ height: 60, fontSize: 22, fontWeight: 900 }}
        >
          {siste ? 'Gjort! Ferdig 🏁' : 'Gjort! ✅'}
        </Button>
      </Stack>
      <Button
        fullWidth
        color="inherit"
        onClick={() => tur.fullfor(tur.aktivtHull, false)}
        sx={{ mt: 0.5, opacity: 0.8 }}
      >
        Hopp over ⏭
      </Button>
    </Box>
  );
}
