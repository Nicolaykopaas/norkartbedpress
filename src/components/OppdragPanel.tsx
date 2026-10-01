import { Box, Button, Stack, Typography } from '@mui/material';
import { OPPDRAG, type Oppdrag } from '../data/oppdrag';

export type OppdragMedPos = Oppdrag & { pos: [number, number]; meter: number };

/** Liste over alle oppdrag, med avstand og mulighet til å markere dem som gjort. */
export function OppdragPanel({
  oppdrag,
  gjort,
  onVeksle,
  onVis,
  onLukk,
}: {
  oppdrag: OppdragMedPos[];
  gjort: string[];
  onVeksle: (id: string) => void;
  onVis: (pos: [number, number]) => void;
  onLukk: () => void;
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 56,
        right: 12,
        zIndex: 4,
        width: 'min(340px, calc(100vw - 24px))',
        maxHeight: 'calc(100% - 140px)',
        overflowY: 'auto',
        bgcolor: '#fff',
        borderRadius: 2,
        p: 1.5,
        boxShadow: '0 8px 28px rgba(15, 59, 87, 0.3)',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
          Oppdrag ({gjort.length} av {OPPDRAG.length})
        </Typography>
        <Button size="small" color="inherit" onClick={onLukk}>
          Lukk
        </Button>
      </Stack>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>
        Små oppgaver knyttet til kjente steder. Sortert etter avstand.
      </Typography>
      <Stack spacing={1}>
        {oppdrag.map((o, i) => {
          const ferdig = gjort.includes(o.id);
          return (
            <Box
              key={o.id}
              sx={{
                border: '1px solid #dde4e9',
                borderLeft: `4px solid ${ferdig ? '#2e7d32' : '#e07a1f'}`,
                borderRadius: 1.5,
                p: 1,
                opacity: ferdig ? 0.7 : 1,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                {i + 1}. {o.tittel}
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                {o.tekst}
              </Typography>
              <Typography sx={{ fontSize: 12, mt: 0.5 }}>
                {o.meter < 1000
                  ? `${Math.round(o.meter / 10) * 10} m unna`
                  : `${(o.meter / 1000).toFixed(1)} km unna`}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Button size="small" onClick={() => onVis(o.pos)}>
                  Vis på kart
                </Button>
                <Button
                  size="small"
                  color={ferdig ? 'inherit' : 'success'}
                  onClick={() => onVeksle(o.id)}
                >
                  {ferdig ? 'Angre' : 'Marker som gjort'}
                </Button>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
