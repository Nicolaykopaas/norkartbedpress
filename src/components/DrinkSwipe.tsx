import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DrinkAvatar } from './DrinkAvatar';
import { PROFILER } from '../data/profiler';
import type { DrinkId } from '../types/pubgolf';
import { DRINKS } from '../data/drinks';

const TERSKEL = 100;
/** Man sveiper til man har så mange matcher */
export const MAL_MATCHER = 7;

function stokk<T>(liste: T[]): T[] {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function DrinkSwipe({
  onFerdig,
}: {
  onFerdig: (valgte: DrinkId[]) => void;
}) {
  // Ny rekkefølge hver runde
  const [kort] = useState(() => stokk(DRINKS));
  const [indeks, setIndeks] = useState(0);
  const [valgte, setValgte] = useState<DrinkId[]>([]);
  const [dx, setDx] = useState(0);
  const [drar, setDrar] = useState(false);
  const [flyr, setFlyr] = useState<1 | -1 | 0>(0);
  const startX = useRef<number | null>(null);
  const ferdigKalt = useRef(false);

  const avgjor = useCallback(
    (ja: boolean) => {
      if (ferdigKalt.current || flyr !== 0) return;
      const drink = kort[indeks];
      const nyeValgte = ja ? [...valgte, drink.id] : valgte;
      startX.current = null;
      setDrar(false);
      // Kortet flyr ut til siden, så kommer neste
      setFlyr(ja ? 1 : -1);
      setTimeout(() => {
        setFlyr(0);
        setDx(0);
        if (nyeValgte.length >= MAL_MATCHER || indeks + 1 >= kort.length) {
          ferdigKalt.current = true;
          onFerdig(nyeValgte.length > 0 ? nyeValgte : ['pils']);
        } else {
          setValgte(nyeValgte);
          setIndeks(indeks + 1);
        }
      }, 280);
    },
    [indeks, valgte, onFerdig, flyr]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') avgjor(false);
      else if (e.key === 'ArrowRight') avgjor(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [avgjor]);

  const drink = kort[indeks];
  const neste = kort[indeks + 1];

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (flyr !== 0) return;
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

  const x = flyr !== 0 ? flyr * 600 : dx;
  const retning = flyr !== 0 ? flyr : dx > 0 ? 1 : -1;
  const stempelOpacity = Math.min(Math.abs(x) / TERSKEL, 1);
  const profil = PROFILER[drink.id];

  const rundKnapp = (
    farge: string,
    tekst: string,
    label: string,
    ja: boolean
  ) => (
    <Box
      component="button"
      aria-label={label}
      onClick={() => avgjor(ja)}
      sx={{
        width: 76,
        height: 76,
        borderRadius: '50%',
        border: `4px solid ${farge}`,
        bgcolor: 'rgba(255,255,255,0.06)',
        color: farge,
        fontSize: 36,
        cursor: 'pointer',
        boxShadow: `0 0 18px ${farge}`,
        transition: 'transform 0.1s',
        '&:active': { transform: 'scale(0.88)' },
      }}
    >
      {tekst}
    </Box>
  );

  return (
    <Box sx={{ width: '100%', maxWidth: 360, mx: 'auto', textAlign: 'center' }}>
      <Typography sx={{ fontSize: 14, mb: 1, opacity: 0.8 }}>
        💚 {valgte.length}/{MAL_MATCHER} matcher · sveip høyre = 💚, venstre =
        ❌
      </Typography>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 4',
          maxHeight: '58dvh',
          mx: 'auto',
          touchAction: 'none',
          userSelect: 'none',
        }}
      >
        {neste && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: 4,
              overflow: 'hidden',
              transform: `scale(${0.94 + 0.06 * stempelOpacity})`,
              opacity: 0.7 + 0.3 * stempelOpacity,
              filter: 'brightness(0.6)',
            }}
          >
            <DrinkAvatar id={neste.id} fyll />
          </Box>
        )}
        <Box
          key={drink.id}
          className="swipe-kort"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          sx={{
            position: 'absolute',
            inset: 0,
            borderRadius: 4,
            overflow: 'hidden',
            cursor: drar ? 'grabbing' : 'grab',
            transform: `translateX(${x}px) rotate(${x / 18}deg)`,
            transition: drar ? 'none' : 'transform 0.28s ease-out',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            touchAction: 'none',
          }}
        >
          <DrinkAvatar id={drink.id} fyll />
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              p: 2,
              textAlign: 'left',
              color: '#fff',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
              pointerEvents: 'none',
            }}
          >
            <Typography sx={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1 }}>
              {profil.profilnavn}{' '}
              <span style={{ fontWeight: 400 }}>{profil.alder}</span>
            </Typography>
            <Typography sx={{ fontSize: 16, opacity: 0.95 }}>
              {drink.emoji} {drink.navn} · Par {drink.par}
            </Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.85, mt: 0.5 }}>
              {drink.beskrivelse}
            </Typography>
          </Box>
          {x !== 0 && (
            <Typography
              sx={{
                position: 'absolute',
                top: 24,
                [retning > 0 ? 'left' : 'right']: 20,
                px: 1.5,
                fontWeight: 900,
                fontSize: 34,
                border: '5px solid',
                borderRadius: 2,
                color: retning > 0 ? '#39ff14' : '#ff3b5c',
                opacity: stempelOpacity,
                transform: `rotate(${retning > 0 ? -15 : 15}deg)`,
                pointerEvents: 'none',
              }}
            >
              {retning > 0 ? 'LIKER' : 'NOPE'}
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
        {rundKnapp('#ff3b5c', '✕', 'Nei', false)}
        {rundKnapp('#39ff14', '♥', 'Ja', true)}
      </Box>
    </Box>
  );
}
