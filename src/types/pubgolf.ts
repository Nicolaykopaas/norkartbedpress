import type { Feature, FeatureCollection, Point } from 'geojson';

export type KategoriId =
  | 'se'
  | 'tur'
  | 'park'
  | 'lekeplass'
  | 'museum'
  | 'scene'
  | 'kino'
  | 'is'
  | 'bowling'
  | 'badstue'
  | 'bading'
  | 'utsikt'
  | 'spill';

export type Kategori = {
  id: KategoriId;
  navn: string;
  /** Farge på ikonet i kartet */
  farge: string;
  /** Hva du gjør her, brukt i «Her skal du …» */
  gjor: string;
  /** Standardtekst når stedet ikke har egen fakta */
  fakta: string;
};

/** Ekte foto fra Wikimedia Commons med kreditering */
export type Foto = {
  url: string;
  side: string;
  forfatter: string;
  lisens: string;
};

export type StedProps = {
  id: string;
  navn: string;
  kategori: KategoriId;
  /** Kort morsom fakta om stedet */
  fakta?: string;
  foto?: Foto;
};

export type Sted = Feature<Point, StedProps>;
export type StedCollection = FeatureCollection<Point, StedProps>;

/** Ett stopp på turen */
export type Hull = {
  nr: number;
  sted: Sted;
  kategori: KategoriId;
};
