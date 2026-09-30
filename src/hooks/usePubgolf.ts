import { useCallback, useEffect, useState } from 'react';
import type { Spiller } from '../types/pubgolf';

const KEY = 'pubgolf-v1';

export type PubgolfState = {
  spillere: Spiller[];
  aktivtHull: number;
  ferdig: boolean;
};

const tom: PubgolfState = { spillere: [], aktivtHull: 0, ferdig: false };

function fit<T>(arr: unknown, n: number, fill: T): T[] {
  const a = Array.isArray(arr) ? (arr as T[]) : [];
  return Array.from({ length: n }, (_, i) => (a[i] === null ? fill : (a[i] ?? fill)));
}

function load(antallHull: number): PubgolfState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return tom;
    const p = JSON.parse(raw) as Partial<PubgolfState>;
    const spillere = (Array.isArray(p.spillere) ? p.spillere : []).map((s) => ({
      navn: String(s.navn),
      slurker: fit<number | undefined>(s.slurker, antallHull, undefined),
      splitTheG: fit<boolean>(s.splitTheG, antallHull, false),
    }));
    const akt = typeof p.aktivtHull === 'number' ? p.aktivtHull : 0;
    return {
      spillere,
      aktivtHull: Math.min(Math.max(0, akt), Math.max(0, antallHull - 1)),
      ferdig: !!p.ferdig,
    };
  } catch {
    return tom;
  }
}

export function usePubgolf(antallHull: number) {
  const [state, setState] = useState<PubgolfState>(() => load(antallHull));

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const leggTilSpiller = useCallback(
    (navn: string) => {
      const n = navn.trim();
      if (!n) return;
      setState((s) =>
        s.spillere.some((x) => x.navn.toLowerCase() === n.toLowerCase())
          ? s
          : {
              ...s,
              spillere: [
                ...s.spillere,
                {
                  navn: n,
                  slurker: Array<number | undefined>(antallHull).fill(undefined),
                  splitTheG: Array<boolean>(antallHull).fill(false),
                },
              ],
            },
      );
    },
    [antallHull],
  );

  const fjernSpiller = useCallback((navn: string) => {
    setState((s) => ({ ...s, spillere: s.spillere.filter((x) => x.navn !== navn) }));
  }, []);

  const settSlurker = useCallback((spillerIdx: number, hullIdx: number, n: number | undefined) => {
    setState((s) => ({
      ...s,
      spillere: s.spillere.map((p, i) =>
        i === spillerIdx
          ? {
              ...p,
              slurker: p.slurker.map((v, h) =>
                h === hullIdx ? (n === undefined ? undefined : Math.max(0, n)) : v,
              ),
            }
          : p,
      ),
    }));
  }, []);

  const toggleSplitTheG = useCallback((spillerIdx: number, hullIdx: number) => {
    setState((s) => ({
      ...s,
      spillere: s.spillere.map((p, i) =>
        i === spillerIdx
          ? { ...p, splitTheG: p.splitTheG.map((v, h) => (h === hullIdx ? !v : v)) }
          : p,
      ),
    }));
  }, []);

  const nesteHull = useCallback(() => {
    setState((s) => ({ ...s, aktivtHull: Math.min(antallHull - 1, s.aktivtHull + 1) }));
  }, [antallHull]);

  const forrigeHull = useCallback(() => {
    setState((s) => ({ ...s, aktivtHull: Math.max(0, s.aktivtHull - 1) }));
  }, []);

  const settHull = useCallback(
    (idx: number) => {
      setState((s) => ({ ...s, aktivtHull: Math.min(antallHull - 1, Math.max(0, idx)) }));
    },
    [antallHull],
  );

  const avslutt = useCallback(() => setState((s) => ({ ...s, ferdig: true })), []);
  const nullstill = useCallback(() => setState(tom), []);

  return {
    ...state,
    leggTilSpiller,
    fjernSpiller,
    settSlurker,
    toggleSplitTheG,
    nesteHull,
    forrigeHull,
    settHull,
    avslutt,
    nullstill,
  };
}

export type PubgolfSpill = ReturnType<typeof usePubgolf>;
