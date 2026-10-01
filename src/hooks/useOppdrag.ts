import { useCallback, useEffect, useState } from 'react';

const KEY = 'byvandring-oppdrag-v1';

/** Hvilke oppdrag som er gjort. Lagres i nettleseren. */
export function useOppdrag() {
  const [gjort, setGjort] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const p = raw ? (JSON.parse(raw) as unknown) : [];
      return Array.isArray(p) ? (p as string[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(gjort));
    } catch {
      /* ignorer */
    }
  }, [gjort]);

  const veksle = useCallback(
    (id: string) =>
      setGjort((g) =>
        g.includes(id) ? g.filter((x) => x !== id) : [...g, id]
      ),
    []
  );

  return { gjort, veksle };
}
