import { Box, Button, Stack, Typography } from '@mui/material';
import type { Hull } from '../types/pubgolf';
import type { Tur } from '../hooks/useTur';
import { kategoriById } from '../data/kategorier';

/** Sluttskjermen: hva dere fikk gjort, og deling. */
export function Oppsummering({
  hull,
  tur,
  totalSekunder,
  onNyTur,
}: {
  hull: Hull[];
  tur: Tur;
  totalSekunder?: number;
  onNyTur: () => void;
}) {
  const antallGjort = hull.filter((_, i) => tur.gjort[i]).length;

  const tekst = [
    `Byvandring i Trondheim: ${antallGjort} av ${hull.length} stopp`,
    ...hull.map(
      (h, i) =>
        `${tur.gjort[i] ? 'Gjort' : 'Hoppet over'}: ${h.sted.properties.navn}`
    ),
  ].join('\n');

  const del = async () => {
    try {
      if (navigator.share) await navigator.share({ text: tekst });
      else await navigator.clipboard.writeText(tekst);
    } catch {
      /* avbrutt */
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 380 }}>
      <Typography sx={{ fontSize: 22, fontWeight: 800 }}>
        Turen er ferdig
      </Typography>
      <Typography sx={{ fontSize: 15, mb: 1, color: 'text.secondary' }}>
        {antallGjort} av {hull.length} stopp gjennomført
        {totalSekunder
          ? ` · ca. ${Math.round(totalSekunder / 60)} min gange`
          : ''}
      </Typography>
      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
        {hull.map((h, i) => (
          <Typography key={h.sted.properties.id} sx={{ fontSize: 15 }} noWrap>
            {tur.gjort[i] ? 'Gjort' : 'Hoppet over'} ·{' '}
            {kategoriById(h.kategori).navn}: {h.sted.properties.navn}
          </Typography>
        ))}
      </Stack>
      <Button fullWidth variant="contained" onClick={del} sx={{ height: 48 }}>
        Del turen
      </Button>
      <Button fullWidth color="inherit" onClick={onNyTur} sx={{ mt: 0.5 }}>
        Ny tur
      </Button>
    </Box>
  );
}
