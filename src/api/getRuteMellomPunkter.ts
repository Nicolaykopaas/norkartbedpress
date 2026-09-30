export const getRuteMellomPunkter = async (
  startX: number,
  startY: number,
  stoppX: number,
  stoppY: number,
  via: [number, number][] = []
) => {
  const apiKey = (import.meta.env.VITE_API_KEY ?? '').trim();
  const query = `https://ruteberegner.api.norkart.no/Route/Expanded`;

  const postData = {
    Start: {
      X: startX,
      Y: startY,
      FeatureSnapRestriction: ['Road', 'Motorway'],
    },
    Stop: {
      X: stoppX,
      Y: stoppY,
      FeatureSnapRestriction: ['Road', 'Motorway'],
    },
    ViaPoints: via.map(([X, Y]) => ({
      X,
      Y,
      FeatureSnapRestriction: ['Road', 'Motorway'],
    })),
    SrsId: 4326,
    GraphName: 'ta-norden-dynamic',
    CostFunction: 'time',
    RouteFeatures: [
      'TerminalInfo',
      'JunctionInfo',
      'RoundaboutInfo',
      'RoadInfo',
      'UTurnInfo',
      'FerryInfo',
      'TollInfo',
    ],
    ZoomLevel: 14,
  };

  try {
    const apiResult = await fetch(query, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-WAAPI-TOKEN': `${apiKey}`,
      },
      body: JSON.stringify(postData),
    });

    if (apiResult.ok) {
      // Inneholder bl.a. RouteGeometry (MultiLineString) og CostList
      return await apiResult.json();
    }
    console.error('Rute-kall feilet med status:', apiResult.status);
    return undefined;
  } catch (error) {
    console.error('Feil ved henting av rute:', error);
    return undefined;
  }
};
