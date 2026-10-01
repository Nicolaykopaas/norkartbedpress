import type { EkstraId } from '../data/ekstra';
import type { Feature, FeatureCollection, Point } from 'geojson';

export type BarProps = {
  id: string;
  navn: string;
  /** Pris i kr for 0,5 l pils */
  pris: number;
  happyHour: boolean;
  bydel: string;
  guinness?: boolean;
};

export type Bar = Feature<Point, BarProps>;
export type BarCollection = FeatureCollection<Point, BarProps>;

export type GrunnDrinkId =
  | 'pils'
  | 'guinness'
  | 'ipa'
  | 'cider'
  | 'seltzer'
  | 'shot'
  | 'gintonic'
  | 'rodvin'
  | 'alkoholfri';

export type DrinkId = GrunnDrinkId | EkstraId;

export type Drink = {
  id: DrinkId;
  navn: string;
  emoji: string;
  /** Anbefalt antall slurker */
  par: number;
  beskrivelse: string;
};

export type Hull = {
  nr: number;
  bar: Bar;
  drink: DrinkId;
  par: number;
};

export type Spiller = {
  navn: string;
  /** slurker per hull (indeks = hull nr - 1), undefined = ikke spilt */
  slurker: (number | undefined)[];
  /** split the G per hull */
  splitTheG: boolean[];
};
