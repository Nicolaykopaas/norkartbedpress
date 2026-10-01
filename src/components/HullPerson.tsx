import { createPortal } from 'react-dom';
import { Button } from '@mui/material';
import { kategoriById } from '../data/kategorier';
import type { Hull } from '../types/pubgolf';

/** Rolig kort som vises når man kommer frem til et nytt stopp. */
export function Reveal({
  hull,
  antall,
  onLukk,
}: {
  hull: Hull;
  antall: number;
  onLukk: () => void;
}) {
  const kat = kategoriById(hull.kategori);
  const foto = hull.sted.properties.foto;

  return createPortal(
    <div className="reveal" onClick={onLukk}>
      <div className="reveal-kort" onClick={(e) => e.stopPropagation()}>
        <div
          className="reveal-bilde"
          style={{
            backgroundImage: foto ? `url("${foto.url}")` : undefined,
            backgroundColor: foto ? undefined : kat.farge,
          }}
        >
          {foto && (
            <a
              className="reveal-kreditt"
              href={foto.side}
              target="_blank"
              rel="noreferrer"
            >
              Foto: {foto.forfatter} ({foto.lisens})
            </a>
          )}
        </div>
        <div className="reveal-tekst">
          <div className="reveal-topp">
            Stopp {hull.nr} av {antall} · {kat.navn}
          </div>
          <div className="reveal-navn">{hull.sted.properties.navn}</div>
          <div className="reveal-sted">Her skal dere {kat.gjor}.</div>
          <Button
            fullWidth
            variant="contained"
            onClick={onLukk}
            sx={{ mt: 2, height: 48, fontWeight: 700 }}
          >
            Start
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
