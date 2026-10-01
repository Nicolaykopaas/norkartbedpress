import type { Drink, DrinkId } from '../types/pubgolf';

/** Alkoholfrie drikker du «matcher» med. Par = antall slurker. */
export const DRINKS: Drink[] = [
  {
    id: 'kakao',
    navn: 'Varm kakao',
    emoji: '☕',
    par: 2,
    beskrivelse:
      'Varm, søt og alltid klar for en klem. Har aldri hatt en dårlig dag, bare for lite krem.',
  },
  {
    id: 'eplejuice',
    navn: 'Eplejuice',
    emoji: '🍏',
    par: 2,
    beskrivelse:
      'Sprek og frisk. Går alltid på tur før frokost og vil gjerne ha deg med.',
  },
  {
    id: 'smoothie',
    navn: 'Smoothie',
    emoji: '🍓',
    par: 3,
    beskrivelse:
      'Har fått i seg fem grønnsaker før klokka ni og forteller deg det. Snilt, men tydelig.',
  },
  {
    id: 'limonade',
    navn: 'Limonade',
    emoji: '🍋',
    par: 2,
    beskrivelse:
      'Syrlig og morsom. Sier «livet ga meg sitroner» og mener det som en kompliment.',
  },
  {
    id: 'appelsinbrus',
    navn: 'Appelsinbrus',
    emoji: '🍊',
    par: 3,
    beskrivelse:
      'Bobler over av entusiasme. Kan ikke sitte stille, og rister litt hvis du åpner for fort.',
  },
  {
    id: 'iste',
    navn: 'Iste',
    emoji: '🧊',
    par: 2,
    beskrivelse: 'Kul som en bris. Tar alt med ro, og alltid med isbiter.',
  },
  {
    id: 'melk',
    navn: 'Melk',
    emoji: '🥛',
    par: 2,
    beskrivelse:
      'Stødig og pålitelig. Gjør deg sterk, og ingen har noen gang angret på ham.',
  },
  {
    id: 'saft',
    navn: 'Solbærsaft',
    emoji: '🧃',
    par: 2,
    beskrivelse:
      'Konsentrert og søt. Må blandes med vann, men er alltid hovedpersonen.',
  },
  {
    id: 'mineralvann',
    navn: 'Mineralvann',
    emoji: '💧',
    par: 2,
    beskrivelse:
      'Klar, rolig og litt boblete. Forstår deg uten å si et eneste ord.',
  },
  {
    id: 'mocktail',
    navn: 'Mocktail',
    emoji: '🍹',
    par: 3,
    beskrivelse:
      'Paraply, frukt og null alkohol. Alle ser på henne, og hun elsker det.',
  },
  {
    id: 'sjokolade',
    navn: 'Sjokolademelk',
    emoji: '🍫',
    par: 3,
    beskrivelse:
      'Kakaoens glade fetter. Gjør alt bedre, spesielt etter en lang gåtur.',
  },
  {
    id: 'cola',
    navn: 'Cola',
    emoji: '🥤',
    par: 3,
    beskrivelse:
      'Svart, søt og full av bobler. Hopper først ut på dansegulvet, sies det.',
  },
];

export const drinkById = (id: DrinkId): Drink => {
  const drink = DRINKS.find((d) => d.id === id);
  if (!drink) throw new Error(`Ukjent drink: ${id}`);
  return drink;
};

export const parFor = (id: DrinkId): number => drinkById(id).par;
