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
    `🗺️ Byvandring i Trondheim: ${antallGjort} av ${hull.length} stopp`,
    ...hull.map((h, i) => {
      const k = kategoriById(h.kategori);
      return `${tur.gjort[i] ? '✅' : '⏭'} ${k.emoji} ${h.sted.properties.navn}`;
    }),
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
    <Box sx={{ p: 1, width: '100%', maxWidth: 360 }}>
      <Typography sx={{ fontSize: 26, fontWeight: 900 }}>
        Turen er ferdig! 🎉
      </Typography>
      <Typography sx={{ fontSize: 16, mb: 1 }}>
        {antallGjort} av {hull.length} stopp gjennomført
        {totalSekunder
          ? ` · ca. ${Math.round(totalSekunder / 60)} min gange`
          : ''}
      </Typography>
      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
        {hull.map((h, i) => {
          const k = kategoriById(h.kategori);
          return (
            <Typography key={h.sted.properties.id} sx={{ fontSize: 16 }} noWrap>
              {tur.gjort[i] ? '✅' : '⏭'} {k.emoji} {h.sted.properties.navn}
            </Typography>
          );
        })}
      </Stack>
      <Button
        fullWidth
        variant="contained"
        onClick={del}
        sx={{ height: 56, fontSize: 18, fontWeight: 800 }}
      >
        Del turen 📤
      </Button>
      <Button
        fullWidth
        color="secondary"
        onClick={onNyTur}
        sx={{ mt: 0.5, height: 48, fontWeight: 800 }}
      >
        Ny tur ↺
      </Button>
    </Box>
  );
}
