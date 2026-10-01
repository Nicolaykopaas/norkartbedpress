import type { DrinkId } from '../types/pubgolf';

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

/** Tegnede kompiser (ingen bilder). Alle drikkene er alkoholfrie. */
export const PROFILER: Record<DrinkId, Profil> = {
  kakao: {
    profilnavn: 'Kakao-Kari',
    alder: 34,
    bakgrunn: '#fde68a',
    hud: '#f1c7a1',
    har: '#6b4f2a',
    harStil: 'bolle',
    genser: '#b45309',
    glass: 'pint',
    drikke: '#7b4a2a',
    skum: '#fff4e0',
  },
  eplejuice: {
    profilnavn: 'Eple-Erik',
    alder: 29,
    bakgrunn: '#bbf7d0',
    hud: '#f3d2b3',
    har: '#92400e',
    harStil: 'kort',
    genser: '#16a34a',
    glass: 'highball',
    drikke: '#d9f99d',
  },
  smoothie: {
    profilnavn: 'Smoothie-Silje',
    alder: 27,
    bakgrunn: '#fecdd3',
    hud: '#c68b5e',
    har: '#1f2937',
    harStil: 'langt',
    genser: '#db2777',
    glass: 'highball',
    drikke: '#fb7185',
  },
  limonade: {
    profilnavn: 'Limonade-Lars',
    alder: 31,
    bakgrunn: '#fef9c3',
    hud: '#f1c7a1',
    har: '#ca8a04',
    harStil: 'caps',
    genser: '#eab308',
    glass: 'highball',
    drikke: '#fde047',
  },
  appelsinbrus: {
    profilnavn: 'Brus-Bente',
    alder: 40,
    bakgrunn: '#fed7aa',
    hud: '#f3d2b3',
    har: '#7c2d12',
    harStil: 'bolle',
    genser: '#ea580c',
    glass: 'boks',
    drikke: '#fb923c',
  },
  iste: {
    profilnavn: 'Iste-Ingrid',
    alder: 36,
    bakgrunn: '#e0f2fe',
    hud: '#f1c7a1',
    har: '#374151',
    harStil: 'langt',
    genser: '#0284c7',
    glass: 'highball',
    drikke: '#d97706',
  },
  melk: {
    profilnavn: 'Melk-Magnus',
    alder: 45,
    bakgrunn: '#e2e8f0',
    hud: '#f3d2b3',
    har: '#6b7280',
    harStil: 'skallet',
    genser: '#475569',
    glass: 'flaske',
    drikke: '#f8fafc',
    skjegg: true,
  },
  saft: {
    profilnavn: 'Saft-Sara',
    alder: 25,
    bakgrunn: '#fbcfe8',
    hud: '#8d5a3b',
    har: '#111827',
    harStil: 'bolle',
    genser: '#be123c',
    glass: 'highball',
    drikke: '#f43f5e',
  },
  mineralvann: {
    profilnavn: 'Mineral-Morten',
    alder: 52,
    bakgrunn: '#cffafe',
    hud: '#f1c7a1',
    har: '#4b5563',
    harStil: 'kort',
    genser: '#0e7490',
    glass: 'flaske',
    drikke: '#7dd3fc',
  },
  mocktail: {
    profilnavn: 'Mocktail-Mia',
    alder: 28,
    bakgrunn: '#f5d0fe',
    hud: '#c68b5e',
    har: '#7e22ce',
    harStil: 'langt',
    genser: '#a21caf',
    glass: 'vin',
    drikke: '#f472b6',
  },
  sjokolade: {
    profilnavn: 'Sjokolade-Sigurd',
    alder: 33,
    bakgrunn: '#e7d5c3',
    hud: '#f3d2b3',
    har: '#451a03',
    harStil: 'kort',
    genser: '#78350f',
    glass: 'pint',
    drikke: '#4a2c17',
    skum: '#fffaf0',
  },
  cola: {
    profilnavn: 'Cola-Camilla',
    alder: 38,
    bakgrunn: '#fecaca',
    hud: '#f1c7a1',
    har: '#1f2937',
    harStil: 'bolle',
    genser: '#b91c1c',
    glass: 'boks',
    drikke: '#7f1d1d',
  },
};
