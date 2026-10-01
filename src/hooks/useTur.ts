import { useCallback, useEffect, useState } from 'react';

const KEY = 'byvandring-tur-v1';

export type TurState = {
  aktivtHull: number;
  /** true = gjort, false = hoppet over */
  gjort: Record<number, boolean>;
  ferdig: boolean;
};

const tom: TurState = { aktivtHull: 0, gjort: {}, ferdig: false };

function last(): TurState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return tom;
    const p = JSON.parse(raw) as Partial<TurState>;
    return {
      aktivtHull: typeof p.aktivtHull === 'number' ? p.aktivtHull : 0,
      gjort: p.gjort && typeof p.gjort === 'object' ? p.gjort : {},
      ferdig: !!p.ferdig,
    };
  } catch {
    return tom;
  }
}

/** Holder styr på hvilket stopp man er på og hva som er gjort. */
export function useTur(antallHull: number) {
  const [state, setState] = useState<TurState>(last);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignorer */
    }
  }, [state]);

  const settHull = useCallback(
    (idx: number) =>
      setState((s) => ({
        ...s,
        aktivtHull: Math.min(Math.max(0, idx), Math.max(0, antallHull - 1)),
      })),
    [antallHull]
  );

  /** Marker stoppet som gjort (eller hoppet over) og gå videre. */
  const fullfor = useCallback(
    (idx: number, gjort: boolean) =>
      setState((s) => {
        const ny = { ...s, gjort: { ...s.gjort, [idx]: gjort } };
        return idx >= antallHull - 1
          ? { ...ny, ferdig: true }
          : { ...ny, aktivtHull: idx + 1 };
      }),
    [antallHull]
  );

  const forrige = useCallback(
    () =>
      setState((s) => ({ ...s, aktivtHull: Math.max(0, s.aktivtHull - 1) })),
    []
  );

  const nullstill = useCallback(() => setState(tom), []);

  return { ...state, settHull, fullfor, forrige, nullstill };
}

export type Tur = ReturnType<typeof useTur>;
