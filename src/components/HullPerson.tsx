import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { kategoriById } from '../data/kategorier';
import type { Hull } from '../types/pubgolf';
import { snakk, spillLyd } from '../utils/lyd';

/** Stor avsløring når man kommer frem til et nytt stopp. */
export function Reveal({ hull, onLukk }: { hull: Hull; onLukk: () => void }) {
  const kat = kategoriById(hull.kategori);
  const navn = hull.sted.properties.navn;

  useEffect(() => {
    // Trommevirvel først, så smell og tekst på stemmen
    spillLyd('par');
    const t1 = setTimeout(() => spillLyd('strike'), 1600);
    const t2 = setTimeout(
      () => snakk(`Neste stopp: ${navn}! Her skal du ${kat.gjor}.`),
      1900
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [navn, kat.gjor]);

  return createPortal(
    <div className="reveal" onClick={onLukk}>
      <div className="reveal-kort">
        <div className="reveal-topp">Stopp {hull.nr}: her skal du…</div>
        <div
          className="reveal-bilde reveal-emoji"
          style={{ background: kat.farge }}
        >
          {kat.emoji}
        </div>
        <div className="reveal-navn">{kat.navn}</div>
        <div className="reveal-drink">{navn}</div>
        <div className="reveal-trykk">Trykk for å starte 🎉</div>
      </div>
    </div>,
    document.body
  );
}
