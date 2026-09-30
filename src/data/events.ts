export type SpecialEvent = {
  id: string;
  navn: string;
  tittel: string;
  tekst: string;
  lng: number;
  lat: number;
  /** Profilbilde i public/ (vises hvis fila finnes) */
  bilde?: string;
  profil?: string;
};

/** Fiktive eksempel-arrangementer (annonser). Bytt ut med ekte avtaler. */
export const EVENTER: SpecialEvent[] = [
  {
    id: 'vodka-vinar',
    navn: 'Vodka-vinar',
    tittel: '🍸 Special event!',
    tekst: 'Vodka-vinar: shot-deal i kveld. Kom innom!',
    lng: 10.3962,
    lat: 63.4297,
    bilde: 'events/vodka-vinar.png',
    profil: 'Shot-Stian, 27',
  },
  {
    id: 'bakklandet-quiz',
    navn: 'Bakklandet Pubquiz',
    tittel: '🎤 Special event!',
    tekst: 'Pubquiz på Bakklandet. Vinneren får en pils.',
    lng: 10.4021,
    lat: 63.4284,
  },
];
