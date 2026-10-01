import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { KATEGORIER } from '../data/kategorier';
import type { KategoriId } from '../types/pubgolf';

/** Startskjermen: velg hva dere har lyst til å gjøre. Ingen kart her. */
export function Kategorivelger({
  antall,
  onFerdig,
}: {
  /** Antall steder per kategori */
  antall: Partial<Record<KategoriId, number>>;
  onFerdig: (valgte: KategoriId[]) => void;
}) {
  const [valgte, setValgte] = useState<KategoriId[]>([]);
  const tilgjengelige = KATEGORIER.filter((k) => (antall[k.id] ?? 0) > 0);

  const veksle = (id: KategoriId) =>
    setValgte((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  return (
    <Box sx={{ width: '100%', maxWidth: 380, mx: 'auto', textAlign: 'center' }}>
      <Typography sx={{ fontSize: 26, fontWeight: 900, lineHeight: 1.1 }}>
        Hva har dere lyst til å gjøre?
      </Typography>
      <Typography sx={{ fontSize: 14, opacity: 0.8, mt: 0.5, mb: 1.5 }}>
        Velg så mange du vil. Vi lager en tur i Trondheim sentrum.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1,
          maxHeight: '52dvh',
          overflowY: 'auto',
          p: 0.5,
        }}
      >
        {tilgjengelige.map((k) => {
          const pa = valgte.includes(k.id);
          return (
            <Box
              key={k.id}
              component="button"
              onClick={() => veksle(k.id)}
              aria-pressed={pa}
              className="kat-flis"
              sx={{
                border: `3px solid ${pa ? k.farge : 'rgba(255,255,255,0.18)'}`,
                background: pa ? `${k.farge}33` : 'rgba(255,255,255,0.06)',
                boxShadow: pa ? `0 0 16px ${k.farge}` : 'none',
              }}
            >
              <span className="kat-emoji">{k.emoji}</span>
              <span className="kat-navn">{k.navn}</span>
              <span className="kat-antall">{antall[k.id]} steder</span>
              {pa && <span className="kat-hake">✓</span>}
            </Box>
          );
        })}
      </Box>
      <Button
        fullWidth
        variant="contained"
        size="large"
        disabled={valgte.length === 0}
        onClick={() => onFerdig(valgte)}
        sx={{ mt: 1.5, height: 60, fontSize: 20, fontWeight: 900 }}
      >
        Se kartet 🗺️ ({valgte.length} valgt)
      </Button>
    </Box>
  );
}
