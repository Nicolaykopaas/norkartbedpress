import { RMarker, useMap } from 'maplibre-react-components';
import { useEffect, useState } from 'react';
import { haversineMeter } from '../utils/bane';
import { hentGangLinje, type Punkt } from '../utils/gange';

function posisjon(linje: Punkt[], lengder: number[], t: number): Punkt {
  const total = lengder[lengder.length - 1];
  const mål = total * Math.min(Math.max(t, 0), 1);
  let i = 1;
  while (i < lengder.length - 1 && lengder[i] < mål) i++;
  const seg = lengder[i] - lengder[i - 1] || 1;
  const f = (mål - lengder[i - 1]) / seg;
  const a = linje[i - 1];
  const b = linje[i];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
}

/** Et ikon som går langs en linje. */
export function GaaMarker({
  linje,
  varighetMs,
  loop,
  folg,
  klasse,
  onFerdig,
}: {
  linje: Punkt[];
  varighetMs: number;
  loop?: boolean;
  folg?: boolean;
  klasse?: string;
  onFerdig?: () => void;
}) {
  const map = useMap();
  const [pos, setPos] = useState<Punkt>(linje[0]);

  useEffect(() => {
    const lengder = [0];
    for (let i = 1; i < linje.length; i++)
      lengder.push(lengder[i - 1] + haversineMeter(linje[i - 1], linje[i]));
    if (folg)
      map.easeTo({ center: linje[0], zoom: 16.5, pitch: 60, duration: 800 });
    let start: number | undefined;
    let raf = 0;
    let ferdig = false;
    const steg = (nå: number) => {
      start ??= nå;
      let t = (nå - start) / varighetMs;
      if (t >= 1 && loop) {
        start = nå;
        t = 0;
      }
      const p = posisjon(linje, lengder, t);
      setPos(p);
      if (folg) map.setCenter(p);
      if (t >= 1) {
        if (!ferdig) {
          ferdig = true;
          onFerdig?.();
        }
        return;
      }
      raf = requestAnimationFrame(steg);
    };
    raf = requestAnimationFrame(steg);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linje, varighetMs, loop, folg]);

  return (
    <RMarker longitude={pos[0]} latitude={pos[1]}>
      <div className={`gaa-prikk ${klasse ?? ''}`} />
    </RMarker>
  );
}

/** Personen går fra startpunktet (Samfundet) til første bar. */
export function IntroGange({
  fra,
  til,
  onFerdig,
}: {
  fra: Punkt;
  til: Punkt;
  onFerdig: () => void;
}) {
  const [linje, setLinje] = useState<Punkt[]>();
  useEffect(() => {
    let avbrutt = false;
    hentGangLinje(fra, til).then((l) => {
      if (!avbrutt) setLinje(l);
    });
    return () => {
      avbrutt = true;
    };
  }, [fra, til]);
  if (!linje) return null;
  return <GaaMarker linje={linje} varighetMs={9000} folg onFerdig={onFerdig} />;
}
