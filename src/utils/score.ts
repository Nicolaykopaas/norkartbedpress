import type { Hull, Spiller } from '../types/pubgolf';

export const SPLIT_THE_G_BONUS = -1;

export function slagForHull(
  spiller: Spiller,
  hullIndex: number
): number | undefined {
  const s = spiller.slurker[hullIndex];
  if (s === undefined) return undefined;
  return s + (spiller.splitTheG[hullIndex] ? SPLIT_THE_G_BONUS : 0);
}

export function scoreMotPar(spiller: Spiller, hull: Hull[]): number {
  let sum = 0;
  hull.forEach((h, i) => {
    const slag = slagForHull(spiller, i);
    if (slag !== undefined) sum += slag - h.par;
  });
  return sum;
}

export function totalSlag(spiller: Spiller, hull: Hull[]): number {
  let sum = 0;
  hull.forEach((_, i) => {
    sum += slagForHull(spiller, i) ?? 0;
  });
  return sum;
}

export function antallSplitTheG(spiller: Spiller): number {
  return spiller.splitTheG.filter(Boolean).length;
}

/** Golf- og discgolf-begreper for score mot par (per hull eller totalt). */
export function golfNavn(diff: number): string {
  if (diff <= -4) return 'Ace! Hole in one!';
  switch (diff) {
    case -3:
      return 'Albatross';
    case -2:
      return 'Eagle';
    case -1:
      return 'Birdie';
    case 0:
      return 'Par';
    case 1:
      return 'Bogey';
    case 2:
      return 'Dobbel bogey';
    case 3:
      return 'Trippel bogey';
    default:
      return 'OB, out of bounds';
  }
}

/** Kort kommentar som leses opp og vises ved siden av begrepet. */
export function golfLinje(diff: number): string {
  const linjer: Record<string, string> = {
    ace: 'Ace! Chains! Rett i kjedene!',
    '-3': 'Albatross! Det er sjeldnere enn en ledig benk på Torvet.',
    '-2': 'Eagle! Ørnen har landet.',
    '-1': 'Birdie! Tweet tweet.',
    '0': 'Par. Solid, som en ren hyzer.',
    '1': 'Bogey. Litt anhyzer på den.',
    '2': 'Dobbel bogey. Disken traff et tre.',
    '3': 'Trippel bogey. Fore! Se opp!',
    ob: 'Out of bounds! Hent disken i bekken.',
  };
  if (diff <= -4) return linjer.ace;
  if (diff >= 4) return linjer.ob;
  return linjer[String(diff)];
}

export type LeaderboardRad = {
  navn: string;
  motPar: number;
  slag: number;
  splitTheG: number;
  plass: number;
};

export function leaderboard(
  spillere: Spiller[],
  hull: Hull[]
): LeaderboardRad[] {
  const rader = spillere
    .map((s) => ({
      navn: s.navn,
      motPar: scoreMotPar(s, hull),
      slag: totalSlag(s, hull),
      splitTheG: antallSplitTheG(s),
    }))
    .sort((a, b) => a.motPar - b.motPar || a.slag - b.slag);
  let plass = 0;
  return rader.map((r, i) => {
    const prev = rader[i - 1];
    if (!prev || prev.motPar !== r.motPar || prev.slag !== r.slag)
      plass = i + 1;
    return { ...r, plass };
  });
}
