import { useEffect, useRef } from 'react';
import type { Sted } from '../types/pubgolf';
import { kategoriById } from '../data/kategorier';

/** Bildekort å bla i nederst på kartet. Valgt kort er uthevet. */
export function StedKarusell({
  steder,
  valgtId,
  onVelg,
  minutter,
}: {
  steder: Sted[];
  valgtId?: string;
  onVelg: (sted: Sted) => void;
  /** Gangminutter fra Torvet */
  minutter: (sted: Sted) => number;
}) {
  const valgtRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    valgtRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [valgtId]);

  if (steder.length === 0) {
    return (
      <div className="karusell">
        <div className="kort tom">
          Ingen steder passer. Prøv et annet filter.
        </div>
      </div>
    );
  }

  return (
    <div className="karusell">
      {steder.map((s) => {
        const kat = kategoriById(s.properties.kategori);
        const valgt = valgtId === s.properties.id;
        const foto = s.properties.foto;
        return (
          <button
            key={s.properties.id}
            ref={valgt ? valgtRef : undefined}
            className={`kort${valgt ? ' valgt' : ''}`}
            onClick={() => onVelg(s)}
          >
            <span
              className="kort-bilde"
              style={{
                backgroundImage: foto ? `url("${foto.url}")` : undefined,
              }}
            />
            <span className="kort-tekst">
              <b>{s.properties.navn}</b>
              <span style={{ color: kat.farge }}>{kat.navn}</span>
              <em>{minutter(s)} min gange fra Torvet</em>
              {valgt && <small>{s.properties.fakta ?? kat.fakta}</small>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
