import type { DrinkId, GrunnDrinkId } from '../types/pubgolf';
import { EKSTRA_PROFILER } from './ekstra';

export type Glass =
  'pint' | 'stout' | 'boks' | 'shot' | 'highball' | 'vin' | 'flaske';

export type Profil = {
  profilnavn: string;
  alder: number;
  bakgrunn: string;
  hud: string;
  har: string;
  harStil: 'kort' | 'langt' | 'skallet' | 'bolle' | 'caps';
  genser: string;
  glass: Glass;
  drikke: string;
  skum?: string;
  skjegg?: boolean;
};

const GRUNN_PROFILER: Record<GrunnDrinkId, Profil> = {
  pils: {
    profilnavn: 'Pils-Per',
    alder: 34,
    bakgrunn: '#fde68a',
    hud: '#f1c7a1',
    har: '#6b4f2a',
    harStil: 'caps',
    genser: '#2563eb',
    glass: 'pint',
    drikke: '#f5b301',
    skum: '#fffaf0',
  },
  guinness: {
    profilnavn: 'Gunnar Guinness',
    alder: 52,
    bakgrunn: '#bbf7d0',
    hud: '#f3d2b3',
    har: '#b45309',
    harStil: 'kort',
    genser: '#166534',
    glass: 'stout',
    drikke: '#1c1917',
    skum: '#f5ecd7',
    skjegg: true,
  },
  ipa: {
    profilnavn: 'IPA-Ida',
    alder: 29,
    bakgrunn: '#fed7aa',
    hud: '#c68b5e',
    har: '#1f2937',
    harStil: 'bolle',
    genser: '#7c3aed',
    glass: 'pint',
    drikke: '#d97706',
    skum: '#fff7e6',
  },
  cider: {
    profilnavn: 'Cider-Cecilie',
    alder: 24,
    bakgrunn: '#fecdd3',
    hud: '#f6d5bd',
    har: '#facc15',
    harStil: 'langt',
    genser: '#db2777',
    glass: 'pint',
    drikke: '#eab308',
    skum: '#fefce8',
  },
  seltzer: {
    profilnavn: 'Seltzer-Selma',
    alder: 22,
    bakgrunn: '#bae6fd',
    hud: '#e8b48f',
    har: '#f472b6',
    harStil: 'langt',
    genser: '#0ea5e9',
    glass: 'boks',
    drikke: '#a5f3fc',
  },
  shot: {
    profilnavn: 'Shot-Stian',
    alder: 27,
    bakgrunn: '#fecaca',
    hud: '#f0c29b',
    har: '#111827',
    harStil: 'kort',
    genser: '#dc2626',
    glass: 'shot',
    drikke: '#e5e7eb',
  },
  rodvin: {
    profilnavn: 'Rødvin-Rolf',
    alder: 61,
    bakgrunn: '#e9d5ff',
    hud: '#f2cfb4',
    har: '#9ca3af',
    harStil: 'skallet',
    genser: '#7f1d1d',
    glass: 'vin',
    drikke: '#7f1d1d',
    skjegg: true,
  },
  alkoholfri: {
    profilnavn: 'Alf Alkoholfri',
    alder: 31,
    bakgrunn: '#ccfbf1',
    hud: '#dca47b',
    har: '#78350f',
    harStil: 'kort',
    genser: '#14b8a6',
    glass: 'flaske',
    drikke: '#65a30d',
  },
};

export const PROFILER: Record<DrinkId, Profil> = {
  ...GRUNN_PROFILER,
  ...EKSTRA_PROFILER,
};
