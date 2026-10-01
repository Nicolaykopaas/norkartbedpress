export type SpecialEvent = {
  id: string;
  /** Hvem som «ringer» */
  fra: string;
  navn: string;
  tittel: string;
  tekst: string;
  emoji: string;
  lng: number;
  lat: number;
};

/** Bonusoppdrag som dukker opp når man er i nærheten. */
export const EVENTER: SpecialEvent[] = [
  {
    id: 'olavsstatuen',
    fra: 'Kaptein Kart',
    navn: 'Statuen på Torvet',
    tittel: 'Nytt oppdrag!',
    tekst:
      'Finn Olav Tryggvason på toppen av søylen og stå i samme positur i 5 sekunder.',
    emoji: '🗿',
    lng: 10.39506,
    lat: 63.43049,
  },
  {
    id: 'bybro-onske',
    fra: 'Kaptein Kart',
    navn: 'Lykkens portal',
    tittel: 'Nytt oppdrag!',
    tekst: 'Gå gjennom portalen på Gamle Bybro og si et ønske høyt.',
    emoji: '🌉',
    lng: 10.4017,
    lat: 63.42846,
  },
  {
    id: 'domen-detektiv',
    fra: 'Kaptein Kart',
    navn: 'Domen-detektiven',
    tittel: 'Nytt oppdrag!',
    tekst:
      'Tell hvor mange tårn du ser på Nidarosdomen. Rop svaret til resten av gjengen.',
    emoji: '⛪',
    lng: 10.39693,
    lat: 63.4269,
  },
];
