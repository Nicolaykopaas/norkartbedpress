import type { Kategori, KategoriId } from '../types/pubgolf';

/** Aktiviteter du kan velge mellom. Alle passer for hele familien. */
export const KATEGORIER: Kategori[] = [
  {
    id: 'se',
    navn: 'Se byen',
    emoji: '🏛️',
    farge: '#ff9800',
    gjor: 'se et av byens kjente steder',
    fakta: 'Et av Trondheims mest kjente steder.',
  },
  {
    id: 'tur',
    navn: 'Gå en tur',
    emoji: '🥾',
    farge: '#4caf50',
    gjor: 'gå en tur i frisk luft',
    fakta: 'Ta på gode sko og nyt turen.',
  },
  {
    id: 'park',
    navn: 'Park',
    emoji: '🌳',
    farge: '#2e7d32',
    gjor: 'slappe av i en park',
    fakta: 'Perfekt for en pause, en lek eller en piknik.',
  },
  {
    id: 'lekeplass',
    navn: 'Lekeplass',
    emoji: '🛝',
    farge: '#ff5722',
    gjor: 'leke og tøyse på en lekeplass',
    fakta: 'Rutsjebane, huske og klatrenett. Alle er barn en stund.',
  },
  {
    id: 'museum',
    navn: 'Museum og galleri',
    emoji: '🖼️',
    farge: '#9c27b0',
    gjor: 'utforske et museum eller galleri',
    fakta: 'Finn det rareste du ser og vis det til de andre.',
  },
  {
    id: 'scene',
    navn: 'Teater og scene',
    emoji: '🎭',
    farge: '#e91e63',
    gjor: 'sjekke hva som skjer på scenen',
    fakta: 'Se hva som står på programmet, og hvem som spiller.',
  },
  {
    id: 'kino',
    navn: 'Kino',
    emoji: '🎬',
    farge: '#3f51b5',
    gjor: 'se en film',
    fakta: 'Popcorn er et eget fag.',
  },
  {
    id: 'is',
    navn: 'Is',
    emoji: '🍦',
    farge: '#f48fb1',
    gjor: 'spise is',
    fakta: 'Velg en smak du ikke har prøvd før.',
  },
  {
    id: 'bowling',
    navn: 'Bowling',
    emoji: '🎳',
    farge: '#00bcd4',
    gjor: 'bowle',
    fakta: 'Strike gir ekstra jubel.',
  },
  {
    id: 'badstue',
    navn: 'Badstue',
    emoji: '🧖',
    farge: '#ff7043',
    gjor: 'slappe av i badstuen',
    fakta: 'Varme, damp og fred. Husk å drikke vann.',
  },
  {
    id: 'bading',
    navn: 'Bade',
    emoji: '🏊',
    farge: '#039be5',
    gjor: 'ta en dukkert',
    fakta: 'Svøm, plask eller bare stikk tærne i.',
  },
  {
    id: 'utsikt',
    navn: 'Utsikt',
    emoji: '🌄',
    farge: '#ffb300',
    gjor: 'nyte utsikten',
    fakta: 'Ta et bilde og se om du finner hjemme.',
  },
  {
    id: 'spill',
    navn: 'Spill og klatring',
    emoji: '🧩',
    farge: '#7e57c2',
    gjor: 'løse oppdrag eller spille',
    fakta: 'Samarbeid og tenk fort.',
  },
];

export const kategoriById = (id: KategoriId): Kategori => {
  const k = KATEGORIER.find((x) => x.id === id);
  if (!k) throw new Error(`Ukjent kategori: ${id}`);
  return k;
};
