import type { Feature, FeatureCollection, Point } from 'geojson';

export type BarProps = {
  id: string;
  navn: string;
  /** Ubrukt i familieversjonen (alltid 0) */
  pris: number;
  happyHour: boolean;
  bydel: string;
  emoji?: string;
  /** Kort morsom fakta om stedet */
  fakta?: string;
};

export type Bar = Feature<Point, BarProps>;
export type BarCollection = FeatureCollection<Point, BarProps>;

export type DrinkId =
  | 'kakao'
  | 'eplejuice'
  | 'smoothie'
  | 'limonade'
  | 'appelsinbrus'
  | 'iste'
  | 'melk'
  | 'saft'
  | 'mineralvann'
  | 'mocktail'
  | 'sjokolade'
  | 'cola';

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
