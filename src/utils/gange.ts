export type Punkt = [number, number];

export type GangRute = {
  linje: Punkt[];
  sekunder?: number;
  /** true hvis ruteberegningen feilet og vi tegner rett linje */
  rett?: boolean;
};

const OSRM_FOT = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';

/**
 * Gangrute gjennom en liste punkter (lng, lat) fra OSRM med fotgjenger-profil
 * og OpenStreetMap-data. Faller tilbake til rett linje hvis kallet feiler.
 */
export async function hentGangRute(punkter: Punkt[]): Promise<GangRute> {
  if (punkter.length < 2) return { linje: punkter, rett: true };
  try {
    const koord = punkter.map(([x, y]) => `${x},${y}`).join(';');
    const svar = await fetch(
      `${OSRM_FOT}/${koord}?overview=full&geometries=geojson`
    );
    if (svar.ok) {
      const data = await svar.json();
      const rute = data?.routes?.[0];
      const linje = rute?.geometry?.coordinates as Punkt[] | undefined;
      if (linje && linje.length > 1) {
        return {
          linje,
          sekunder:
            typeof rute.duration === 'number' ? rute.duration : undefined,
        };
      }
    }
  } catch {
    /* faller tilbake til rett linje */
  }
  return { linje: punkter, rett: true };
}

/** Gangrute mellom to punkter. */
export async function hentGangLinje(a: Punkt, b: Punkt): Promise<Punkt[]> {
  return (await hentGangRute([a, b])).linje;
}
