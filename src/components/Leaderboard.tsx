import { Box, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
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

  return (
    <Box sx={{ p: 2, width: '100%', maxWidth: 360 }}>
      <Typography variant="h6" gutterBottom>
        Klubbhusets fasit
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="flex-end" sx={{ my: 2 }}>
        {pallen.map((r, i) => (
          <Box key={r.navn} sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: i === 0 ? 40 : 30 }}>{medaljer[Math.min(r.plass - 1, 2)]}</Typography>
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
      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={onNyRunde}>
        Ny runde
      </Button>
    </Box>
  );
}
