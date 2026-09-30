import { useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { Hull, Spiller } from '../types/pubgolf';
import { leaderboard } from '../utils/score';

type Props = { hull: Hull[]; spillere: Spiller[]; onNyRunde: () => void };

const medaljer = ['🥇', '🥈', '🥉'];

function motParTekst(n: number) {
  return n === 0 ? 'E' : n > 0 ? `+${n}` : `−${Math.abs(n)}`;
}

export function Leaderboard({ hull, spillere, onNyRunde }: Props) {
  const rader = leaderboard(spillere, hull);
  const pallen = rader.slice(0, 3);
  const [delt, setDelt] = useState<string | undefined>(undefined);

  const resultatTekst = [
    `⛳ Pubgolf Trondheim – ${hull.length} hull, par ${hull.reduce((s, h) => s + h.par, 0)}`,
    ...rader.map(
      (r) =>
        `${medaljer[r.plass - 1] ?? `${r.plass}.`} ${r.navn}: ${r.slag} slag (${motParTekst(r.motPar)})${r.splitTheG ? `, ${r.splitTheG}× Split the G` : ''}`
    ),
  ].join('\n');

  const del = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: resultatTekst });
        setDelt('Delt!');
        return;
      }
      await navigator.clipboard.writeText(resultatTekst);
      setDelt('Kopiert – lim inn i gruppechatten');
    } catch {
      setDelt('Kunne ikke kopiere – merk teksten under og kopier');
    }
  };

  return (
    <Box sx={{ p: 2, width: '100%', maxWidth: 360 }}>
      <Typography variant="h6" gutterBottom>
        Klubbhusets fasit
      </Typography>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="flex-end"
        sx={{ my: 2 }}
      >
        {pallen.map((r, i) => (
          <Box key={r.navn} sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: i === 0 ? 40 : 30 }}>
              {medaljer[Math.min(r.plass - 1, 2)]}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {r.navn}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {motParTekst(r.motPar)}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Navn</TableCell>
            <TableCell align="right">Slag</TableCell>
            <TableCell align="right">Mot par</TableCell>
            <TableCell align="right">G 🥇</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rader.map((r) => (
            <TableRow key={r.navn}>
              <TableCell>{r.plass}</TableCell>
              <TableCell>{r.navn}</TableCell>
              <TableCell align="right">{r.slag}</TableCell>
              <TableCell align="right">{motParTekst(r.motPar)}</TableCell>
              <TableCell align="right">{r.splitTheG}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={del}>
        Del resultatet 📣
      </Button>
      {delt && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption">{delt}</Typography>
          <Box
            component="pre"
            sx={{
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              userSelect: 'all',
              m: 0,
            }}
          >
            {resultatTekst}
          </Box>
        </Box>
      )}
      <Button variant="contained" fullWidth sx={{ mt: 1 }} onClick={onNyRunde}>
        Ny runde
      </Button>
    </Box>
  );
}
