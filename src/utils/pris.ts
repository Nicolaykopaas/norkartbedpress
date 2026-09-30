import type { Bar } from '../types/pubgolf';

export type PrisSkala = { min: number; median: number; max: number };

export const PRIS_FARGER = {
  billig: '#1a9850',
  middels: '#fee08b',
  dyr: '#d73027',
};

export function prisSkala(barer: Bar[]): PrisSkala {
  const priser = barer.map((b) => b.properties.pris).sort((a, b) => a - b);
  if (priser.length === 0) return { min: 0, median: 0, max: 0 };
  const midt = Math.floor(priser.length / 2);
  const median =
    priser.length % 2 ? priser[midt] : (priser[midt - 1] + priser[midt]) / 2;
  return { min: priser[0], median, max: priser[priser.length - 1] };
}
