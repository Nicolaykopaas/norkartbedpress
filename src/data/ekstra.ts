import type { Drink } from '../types/pubgolf';
import type { Profil } from './profiler';

/** Flere profiler til swipe-feeden. Bildene ligger i public/drinks/<id>.png */
type Ekstra = {
  id: string;
  profilnavn: string;
  alder: number;
  navn: string;
  emoji: string;
  par: number;
  beskrivelse: string;
};

export const EKSTRA = [
  {
    id: 'bajer',
    profilnavn: 'Bajer-Bjørn',
    alder: 28,
    navn: 'Bajer',
    emoji: '🍺',
    par: 3,
    beskrivelse:
      'Vikinghjelm og store armer. Sier «skål» som om det er en krigserklæring.',
  },
  {
    id: 'fyllesvin',
    profilnavn: 'Fyllesvin-Fredrik',
    alder: 23,
    navn: 'Fyllesvin',
    emoji: '🍷',
    par: 4,
    beskrivelse:
      'Flaska er billig og samtalene er dyre. Lover at han bare tar ett glass.',
  },
  {
    id: 'olola',
    profilnavn: 'Øl-Ola',
    alder: 31,
    navn: 'Øl',
    emoji: '🍺',
    par: 3,
    beskrivelse:
      'Cowboyhatt og rosa fjærboa. Stiller aldri spørsmål, bestiller bare en til.',
  },
  {
    id: 'torst',
    profilnavn: 'Tørst-Thomas',
    alder: 26,
    navn: 'Vann',
    emoji: '💧',
    par: 2,
    beskrivelse:
      'Kaster seg over vann som om det er en bragd. Noen må tross alt holde hodet kaldt.',
  },
  {
    id: 'champis',
    profilnavn: 'Champis-Charlie',
    alder: 33,
    navn: 'Champagne',
    emoji: '🍾',
    par: 4,
    beskrivelse: 'Spruter for ingenting og ser likevel ut som han eier stedet.',
  },
  {
    id: 'jager',
    profilnavn: 'Jäger-Janne',
    alder: 25,
    navn: 'Jägermeister',
    emoji: '🦌',
    par: 2,
    beskrivelse:
      'Kommer med cowboyhatt og dårlig dømmekraft. Hjertet sier nei, hodet sier ja.',
  },
  {
    id: 'kaffe',
    profilnavn: 'Kaffe-Kasper',
    alder: 36,
    navn: 'Kaffe',
    emoji: '☕',
    par: 2,
    beskrivelse: 'Drikker kaffe klokka ett om natta og kaller det «nøkternt».',
  },
  {
    id: 'rusbrus',
    profilnavn: 'Rusbrus-Remi',
    alder: 21,
    navn: 'Rusbrus',
    emoji: '🥤',
    par: 2,
    beskrivelse: 'Smaker som barndommen og ender som en dårlig idé.',
  },
  {
    id: 'bobbis',
    profilnavn: 'Bobbis-Bente',
    alder: 37,
    navn: 'Vodka-brus',
    emoji: '🍹',
    par: 2,
    beskrivelse: 'Glitter, bobler og null planer. Alltid først på dansegulvet.',
  },
  {
    id: 'brennevin',
    profilnavn: 'Brennevin-Bjarne',
    alder: 49,
    navn: 'Brennevin',
    emoji: '🥃',
    par: 3,
    beskrivelse:
      'Pelsjakke og en historie om 1998 som blir lengre for hver gang.',
  },
  {
    id: 'whisky',
    profilnavn: 'Whisky-Wenche',
    alder: 42,
    navn: 'Whisky',
    emoji: '🥃',
    par: 4,
    beskrivelse:
      'Har peiling på fat og årganger. Dømmer deg stille mens du bestiller cola i den.',
  },
  {
    id: 'afterwork',
    profilnavn: 'Afterwork-Anders',
    alder: 32,
    navn: 'Aperol Spritz',
    emoji: '🍹',
    par: 3,
    beskrivelse:
      'Skjorta er åpen og klokka er fem. «Bare én» er en løgn han har sagt i åtte år.',
  },
  {
    id: 'punsj',
    profilnavn: 'Punsj-Petter',
    alder: 58,
    navn: 'Punsj',
    emoji: '🍹',
    par: 4,
    beskrivelse:
      'Serverer fra en bolle ingen vet innholdet i. Alle tar en kopp likevel.',
  },
  {
    id: 'blandet',
    profilnavn: 'Blandet-Bjørn',
    alder: 45,
    navn: 'Blanding',
    emoji: '🍹',
    par: 4,
    beskrivelse:
      'Har tømt halve baren i samme mugge. Ingen skal dømme, alle skal smake.',
  },
  {
    id: 'tvinne',
    profilnavn: 'Tvinne-Tore',
    alder: 39,
    navn: 'Energidrikk',
    emoji: '⚡',
    par: 2,
    beskrivelse: 'Gir deg vinger og hjertebank. Sover i 2027.',
  },
  {
    id: 'sot',
    profilnavn: 'Søt-Simone',
    alder: 27,
    navn: 'Cocktail',
    emoji: '🍸',
    par: 3,
    beskrivelse:
      'Rosa, søt og farligere enn den ser ut. Du merker det først i morgen.',
  },
  {
    id: 'bolla',
    profilnavn: 'Bolla-Bjarne',
    alder: 55,
    navn: 'Boblebad-øl',
    emoji: '🛁',
    par: 3,
    beskrivelse:
      'Drikker i badekaret og mener det er det beste stedet å ta viktige beslutninger.',
  },
  {
    id: 'fiskebas',
    profilnavn: 'Fiskebas-Frode',
    alder: 41,
    navn: 'Fiskeøl',
    emoji: '🎣',
    par: 3,
    beskrivelse: 'Har fått en kjempe på kroken. Det var en sko. Skål likevel.',
  },
  {
    id: 'sprit',
    profilnavn: 'Sprit-Svein',
    alder: 48,
    navn: 'Vodka',
    emoji: '🍸',
    par: 3,
    beskrivelse:
      'Leopardskjerf, vodka og en plan som ikke eksisterer. Stoler på deg.',
  },
  {
    id: 'limonade',
    profilnavn: 'Limonade-Lasse',
    alder: 30,
    navn: 'Limonade',
    emoji: '🍋',
    par: 2,
    beskrivelse:
      'Sitter i stranden i gule shorts og fyller glasset uansett innhold.',
  },
  {
    id: 'oystein',
    profilnavn: 'Øl-Øystein',
    alder: 44,
    navn: 'Solnedgangsøl',
    emoji: '🍻',
    par: 3,
    beskrivelse:
      'Venter på riktig lys. Drikker uansett før solen har gått ned.',
  },
] as const satisfies readonly Ekstra[];

export type EkstraId = (typeof EKSTRA)[number]['id'];

export const EKSTRA_DRINKS: Drink[] = EKSTRA.map((e) => ({
  id: e.id,
  navn: e.navn,
  emoji: e.emoji,
  par: e.par,
  beskrivelse: e.beskrivelse,
}));

// Reserve-tegning hvis bildet mangler
export const EKSTRA_PROFILER = Object.fromEntries(
  EKSTRA.map((e) => [
    e.id,
    {
      profilnavn: e.profilnavn,
      alder: e.alder,
      bakgrunn: '#e9d5ff',
      hud: '#f1c7a1',
      har: '#4b5563',
      harStil: 'kort',
      genser: '#6b7280',
      glass: 'pint',
      drikke: '#f5b301',
      skum: '#fffaf0',
    } satisfies Profil,
  ])
) as Record<EkstraId, Profil>;
