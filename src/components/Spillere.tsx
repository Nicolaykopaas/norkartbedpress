import { useState } from 'react';
import { Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import type { Spiller } from '../types/pubgolf';

type Props = {
  spillere: Spiller[];
  onLeggTil: (navn: string) => void;
  onFjern: (navn: string) => void;
  onStart: () => void;
};

export function Spillere({ spillere, onLeggTil, onFjern, onStart }: Props) {
  const [navn, setNavn] = useState('');

  const leggTil = () => {
    if (!navn.trim()) return;
    onLeggTil(navn.trim());
    setNavn('');
  };

  return (
    <Box sx={{ p: 2, width: '100%', maxWidth: 360 }}>
      <Typography sx={{ fontSize: 26, fontWeight: 900 }} gutterBottom>
        Hvem er med? 🚶
      </Typography>
      <Stack direction="row" spacing={1}>
        <TextField
          slotProps={{ htmlInput: { style: { fontSize: 22, padding: 14 } } }}
          fullWidth
          placeholder="Navn"
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              leggTil();
            }
          }}
        />
        <Button
          variant="outlined"
          onClick={leggTil}
          disabled={!navn.trim()}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Legg til
        </Button>
      </Stack>
      <Box
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 2, minHeight: 32 }}
      >
        {spillere.map((s) => (
          <Chip
            key={s.navn}
            label={s.navn}
            onDelete={() => onFjern(s.navn)}
            sx={{ fontSize: 20, height: 44 }}
          />
        ))}
      </Box>
      <Button
        variant="contained"
        fullWidth
        size="large"
        disabled={spillere.length < 1}
        onClick={onStart}
      >
        Tee off! ⛳
      </Button>
    </Box>
  );
}
