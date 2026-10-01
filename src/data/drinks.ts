import type { Drink, DrinkId } from '../types/pubgolf';
import { EKSTRA_DRINKS } from './ekstra';

const GRUNN_DRINKS: Drink[] = [
  {
    id: 'pils',
    navn: 'Pils',
    emoji: '🍺',
    par: 3,
    beskrivelse:
      'Enkel, billig og alltid tilgjengelig. Mamma liker meg ikke, men det gjør ingen andres mødre heller.',
  },
  {
    id: 'guinness',
    navn: 'Guinness',
    emoji: '🖤',
    par: 4,
    beskrivelse:
      'Mørk, kald og dyp. Bruker 119 sekunder på å bli skjenket og forventer at du venter. Split the G, eller swipe videre.',
  },
  {
    id: 'ipa',
    navn: 'IPA',
    emoji: '🍻',
    par: 3,
    beskrivelse:
      'Sier jeg er «humlete» og «kompleks», men er egentlig bare bitter. Har en bryggeri-tatovering og snakker om det på første date.',
  },
  {
    id: 'cider',
    navn: 'Cider',
    emoji: '🍏',
    par: 3,
    beskrivelse:
      'Søt, frisk og litt for lett å få med seg hjem. Sier jeg ikke er som de andre, men er egentlig akkurat som eplejuice med dårlig dømmekraft.',
  },
  {
    id: 'seltzer',
    navn: 'Seltzer',
    emoji: '🫧',
    par: 2,
    beskrivelse:
      'Smaker litt av ingenting, men ser bra ut på Instagram. Perfekt hvis du vil ha følelsen av å drikke uten smaken.',
  },
  {
    id: 'shot',
    navn: 'Shot',
    emoji: '🥃',
    par: 1,
    beskrivelse:
      'Kort og brutal. Ingen forspill, ingen samtale, bare en dårlig idé som varer i to sekunder. Angrer sammen i morgen?',
  },
  {
    id: 'rodvin',
    navn: 'Rødvin',
    emoji: '🍷',
    par: 4,
    beskrivelse:
      'Elsker å snurre glasset og late som jeg kan noe om druer. Farger tennene dine lilla og hemmelighetene dine røde.',
  },
  {
    id: 'alkoholfri',
    navn: 'Alkoholfri',
    emoji: '🧃',
    par: 3,
    beskrivelse:
      'Jeg er den som husker kvelden og sender vann til alle andre. Ingen dømming, bare bedre morgener og null angrende meldinger.',
  },
];

export const DRINKS: Drink[] = [...GRUNN_DRINKS, ...EKSTRA_DRINKS];

export const drinkById = (id: DrinkId): Drink => {
  const drink = DRINKS.find((d) => d.id === id);
  if (!drink) throw new Error(`Ukjent drink: ${id}`);
  return drink;
};

export const parFor = (id: DrinkId): number => drinkById(id).par;
