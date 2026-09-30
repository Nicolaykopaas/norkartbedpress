import { Box, Button, Stack, Typography } from '@mui/material';
import type { DrinkId } from '../types/pubgolf';
import { drinkById } from '../data/drinks';
import { drinkPlan } from '../utils/bane';

export function MatchSkjerm({
  drinks,
  antallHull,
  onVidere,
  onSwipePaNytt,
}: {
  drinks: DrinkId[];
  antallHull: number;
  onVidere: () => void;
  onSwipePaNytt: () => void;
}) {
  const plan = drinkPlan(drinks, antallHull);
  const totalPar = plan.reduce((s, d) => s + drinkById(d).par, 0);
  const antall = drinks.length;

  return (
    <Stack spacing={1.5} alignItems="center" textAlign="center">
      <Typography variant="h5" fontWeight={700}>
        It's a match! 🍻
      </Typography>
      <Typography variant="body2">
        Du matchet med {antall} {antall === 1 ? 'drink' : 'drinker'}.
        {antall === 1 &&
          drinks[0] === 'pils' &&
          ' Klassisk. Trygt. Litt kjedelig.'}
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        justifyContent="center"
      >
        {drinks.map((d) => (
          <Box key={d} sx={{ fontSize: 36 }} title={drinkById(d).navn}>
            {drinkById(d).emoji}
          </Box>
        ))}
      </Stack>
      <Box sx={{ width: '100%', textAlign: 'left' }}>
        <Typography variant="subtitle2">
          Banen din ({antallHull} hull)
        </Typography>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {plan.map((d, i) => (
            <Box
              key={i}
              sx={{
                border: '1px solid #ccc',
                borderRadius: 1,
                px: 0.75,
                py: 0.25,
                fontSize: 13,
              }}
            >
              {i + 1}. {drinkById(d).emoji} par {drinkById(d).par}
            </Box>
          ))}
        </Stack>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Totalt par: <b>{totalPar}</b>
        </Typography>
      </Box>
      <Button variant="contained" fullWidth onClick={onVidere}>
        Finn banen ⛳
      </Button>
      <Button size="small" onClick={onSwipePaNytt}>
        Swipe på nytt
      </Button>
    </Stack>
  );
}
