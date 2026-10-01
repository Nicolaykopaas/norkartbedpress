import type { StyleSpecification } from 'maplibre-gl';

/**
 * Kartstil uten API-nøkkel: satellittbilder fra Esri, bygninger og navn fra
 * OpenFreeMap (OpenStreetMap-data) og terreng fra AWS Terrain Tiles.
 */
export const KARTSTIL: StyleSpecification = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    satellitt: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Bilder © Esri, Maxar, Earthstar Geographics',
    },
    omt: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
      attribution: '© OpenFreeMap, data © OpenStreetMap-bidragsytere',
    },
    terreng: {
      type: 'raster-dem',
      tiles: [
        'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      maxzoom: 14,
      encoding: 'terrarium',
      attribution: 'Terreng: Mapzen / AWS Terrain Tiles',
    },
  },
  terrain: { source: 'terreng', exaggeration: 1.3 },
  layers: [
    {
      id: 'bakgrunn',
      type: 'background',
      paint: { 'background-color': '#0b0618' },
    },
    { id: 'satellitt', type: 'raster', source: 'satellitt' },
    {
      id: 'bygg-3d',
      type: 'fill-extrusion',
      source: 'omt',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#e8e0d0',
        'fill-extrusion-opacity': 0.8,
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 8],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      },
    },
    {
      id: 'gatenavn',
      type: 'symbol',
      source: 'omt',
      'source-layer': 'transportation_name',
      minzoom: 15,
      layout: {
        'symbol-placement': 'line',
        'text-field': ['coalesce', ['get', 'name:nb'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(0,0,0,0.8)',
        'text-halo-width': 1.5,
      },
    },
    {
      id: 'stedsnavn',
      type: 'symbol',
      source: 'omt',
      'source-layer': 'place',
      layout: {
        'text-field': ['coalesce', ['get', 'name:nb'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 14,
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(0,0,0,0.85)',
        'text-halo-width': 1.5,
      },
    },
  ],
};
