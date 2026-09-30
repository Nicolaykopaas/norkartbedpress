import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import type { DrinkId } from '../types/pubgolf';
import { DRINKS } from '../data/drinks';

const TERSKEL = 100;

export function DrinkSwipe({ onFerdig }: { onFerdig: (valgte: DrinkId[]) => void }) {
  const [indeks, setIndeks] = useState(0);
  const [valgte, setValgte] = useState<DrinkId[]>([]);
  const [dx, setDx] = useState(0);
  const [drar, setDrar] = useState(false);
  const startX = useRef<number | null>(null);
  const ferdigKalt = useRef(false);

  const avgjor = useCallback(
    (ja: boolean) => {
      if (ferdigKalt.current) return;
      const drink = DRINKS[indeks];
      const nyeValgte = ja ? [...valgte, drink.id] : valgte;
      setDx(0);
      setDrar(false);
      startX.current = null;
      if (indeks + 1 >= DRINKS.length) {
        ferdigKalt.current = true;
        onFerdig(nyeValgte.length > 0 ? nyeValgte : ['pils']);
      } else {
        setValgte(nyeValgte);
        setIndeks(indeks + 1);
      }
    },
    [indeks, valgte, onFerdig],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') avgjor(false);
      else if (e.key === 'ArrowRight') avgjor(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [avgjor]);

  const drink = DRINKS[indeks];

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    setDrar(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (startX.current === null) return;
    setDx(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (startX.current === null) return;
    if (dx > TERSKEL) avgjor(true);
    else if (dx < -TERSKEL) avgjor(false);
    else {
      setDx(0);
      setDrar(false);
      startX.current = null;
    }
  };

  const stempelOpacity = Math.min(Math.abs(dx) / TERSKEL, 1);

  return (
    <Box sx={{ width: '100%', maxWidth: 360, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Swipe drinkene til pubgolf-runden din
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {indeks + 1}/{DRINKS.length}
      </Typography>
      <Box sx={{ position: 'relative', touchAction: 'pan-y', userSelect: 'none' }}>
        <Card
          key={drink.id}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          sx={{
            cursor: drar ? 'grabbing' : 'grab',
            transform: `translateX(${dx}px) rotate(${dx / 20}deg)`,
            transition: drar ? 'none' : 'transform 0.25s ease',
            touchAction: 'pan-y',
          }}
        >
          {dx !== 0 && (
            <Typography
              sx={{
                position: 'absolute',
                top: 16,
                [dx > 0 ? 'left' : 'right']: 16,
                zIndex: 1,
                px: 1,
                fontWeight: 900,
                fontSize: 28,
                border: '4px solid',
                borderRadius: 1,
                color: dx > 0 ? 'success.main' : 'error.main',
                opacity: stempelOpacity,
                transform: `rotate(${dx > 0 ? -15 : 15}deg)`,
                pointerEvents: 'none',
              }}
            >
              {dx > 0 ? 'LIKER' : 'NOPE'}
            </Typography>
          )}
          <CardContent sx={{ py: 4 }}>
            <Typography sx={{ fontSize: 96, lineHeight: 1.1 }}>{drink.emoji}</Typography>
            <Typography variant="h4" component="h3">
              {drink.navn}
            </Typography>
            <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
              Par: {drink.par} slurker
            </Typography>
            <Typography variant="body1">{drink.beskrivelse}</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3 }}>
        <Button variant="outlined" color="error" size="large" onClick={() => avgjor(false)} aria-label="Nei">
          ❌
        </Button>
        <Button variant="outlined" color="success" size="large" onClick={() => avgjor(true)} aria-label="Ja">
          💚
        </Button>
      </Box>
    </Box>
  );
}
