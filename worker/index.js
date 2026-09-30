// Proxy som holder Norkart-nøkkelen hemmelig. Nøkkelen ligger som secret
// (NORKART_API_KEY) i Cloudflare og havner aldri i nettleseren eller repoet.

const TILLATTE_ORIGINER = [
  'https://nicolaykopaas.github.io',
  'http://localhost:5173',
];

const cors = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
});

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    if (!TILLATTE_ORIGINER.includes(origin ?? '')) {
      return new Response('Forbidden', { status: 403 });
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    const url = new URL(request.url);
    let mål;
    let init = { method: request.method, headers: {} };

    if (request.method === 'GET' && url.pathname.startsWith('/mvt/')) {
      // Kartfliser og stil: legg på nøkkelen som query-parameter
      mål = new URL('https://kvp.maps.norkart.no' + url.pathname);
      url.searchParams.forEach((v, k) => {
        if (k !== 'api_key') mål.searchParams.set(k, v);
      });
      mål.searchParams.set('api_key', env.NORKART_API_KEY);
    } else if (request.method === 'POST' && url.pathname === '/route') {
      mål = new URL('https://ruteberegner.api.norkart.no/Route/Expanded');
      init = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-WAAPI-TOKEN': env.NORKART_API_KEY,
        },
        body: await request.text(),
      };
    } else {
      return new Response('Not found', { status: 404, headers: cors(origin) });
    }

    const svar = await fetch(mål, init);
    const headers = new Headers(svar.headers);
    Object.entries(cors(origin)).forEach(([k, v]) => headers.set(k, v));
    // Fliser kan caches i nettleseren og hos Cloudflare
    if (request.method === 'GET' && svar.ok) {
      headers.set('Cache-Control', 'public, max-age=86400');
    }
    return new Response(svar.body, { status: svar.status, headers });
  },
};
