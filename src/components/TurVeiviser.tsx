import { useState } from 'react';
import { Button } from '@mui/material';
import type { KategoriId } from '../types/pubgolf';

export type Interesse = {
  id: string;
  navn: string;
  kategorier: KategoriId[];
  /** Bilde av et typisk sted */
  foto?: string;
};

const TID = [
  { navn: '1 time', stopp: 4 },
  { navn: '2 timer', stopp: 6 },
  { navn: 'Halv dag', stopp: 9 },
];

/** To enkle valg, så lages turen: hvor lang tid, og hva dere har lyst til. */
export function TurVeiviser({
  interesser,
  onLag,
}: {
  interesser: Interesse[];
  onLag: (stopp: number, kategorier: KategoriId[]) => void;
}) {
  const [tid, setTid] = useState(1);
  const [valgte, setValgte] = useState<string[]>(
    interesser.slice(0, 2).map((i) => i.id)
  );

  const veksle = (id: string) =>
    setValgte((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  const kategorier = interesser
    .filter((i) => valgte.includes(i.id))
    .flatMap((i) => i.kategorier);

  return (
    <div className="veiviser">
      <h2>Lag en tur</h2>
      <p className="und">Svar på to spørsmål, så fikser vi resten.</p>

      <h3>Hvor lang tid har dere?</h3>
      <div className="seg" role="radiogroup">
        {TID.map((t, i) => (
          <button
            key={t.navn}
            role="radio"
            aria-checked={tid === i}
            className={tid === i ? 'on' : ''}
            onClick={() => setTid(i)}
          >
            {t.navn}
          </button>
        ))}
      </div>

      <h3>Hva har dere lyst til?</h3>
      <div className="rutenett">
        {interesser.map((i) => {
          const pa = valgte.includes(i.id);
          return (
            <button
              key={i.id}
              className={`flis${pa ? ' on' : ''}`}
              style={{
                backgroundImage: i.foto ? `url("${i.foto}")` : undefined,
              }}
              onClick={() => veksle(i.id)}
              aria-pressed={pa}
            >
              <i>{i.navn}</i>
              {pa && (
                <b>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </b>
              )}
            </button>
          );
        })}
      </div>

      <Button
        fullWidth
        variant="contained"
        disabled={kategorier.length === 0}
        onClick={() => onLag(TID[tid].stopp, kategorier)}
        sx={{
          mt: 2,
          height: 58,
          fontSize: 18,
          display: 'block',
          lineHeight: 1.2,
        }}
      >
        Lag tur
        <br />
        <small style={{ fontWeight: 500, opacity: 0.85 }}>
          {TID[tid].stopp} stopp
        </small>
      </Button>
    </div>
  );
}
