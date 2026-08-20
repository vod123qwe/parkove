// Map style variants, switchable in the profile.
// 'auto' follows the app theme: Minimal in light, Ciemna in dark.
// Free hosted styles: OpenFreeMap (no key), Carto dark-matter, Esri imagery (raster).

import type { StyleSpecification } from 'maplibre-gl'

export type MapStyleId = 'auto' | 'minimal' | 'classic' | 'vivid' | 'dark' | 'satellite'

export type MapStyleDef = {
  id: MapStyleId
  label: string
  /** two colors for the preview swatch */
  swatch: [string, string]
}

export const MAP_STYLES: MapStyleDef[] = [
  { id: 'auto', label: 'Domyślny', swatch: ['#f4f4f0', '#14181c'] },
  { id: 'minimal', label: 'Minimal', swatch: ['#f4f4f0', '#d9dcd4'] },
  { id: 'classic', label: 'Klasyczna', swatch: ['#f6efe6', '#a8d5a2'] },
  { id: 'vivid', label: 'Żywa', swatch: ['#eaf4e0', '#7cc0f4'] },
  { id: 'dark', label: 'Ciemna', swatch: ['#14181c', '#3a4148'] },
  { id: 'satellite', label: 'Satelita', swatch: ['#2c4a2f', '#1a2e3f'] },
]

const URLS: Record<string, string> = {
  minimal: 'https://tiles.openfreemap.org/styles/positron',
  classic: 'https://tiles.openfreemap.org/styles/liberty',
  vivid: 'https://tiles.openfreemap.org/styles/bright',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
}

const SATELLITE: StyleSpecification = {
  version: 8,
  // glyphs so symbol layers (parking "P") render on imagery too
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    sat: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
  },
  layers: [{ id: 'sat', type: 'raster', source: 'sat' }],
}

const KEY = 'pk-mapstyle'

export function getMapStyle(): MapStyleId {
  const v = localStorage.getItem(KEY) as MapStyleId | null
  return MAP_STYLES.some((s) => s.id === v) ? (v as MapStyleId) : 'auto'
}

export function setMapStyle(id: MapStyleId) {
  localStorage.setItem(KEY, id)
}

/** resolve the chosen style (+ current theme darkness) to a concrete MapLibre style */
export function resolveMapStyle(id: MapStyleId, isDark: boolean): { key: string; spec: string | StyleSpecification } {
  const resolved = id === 'auto' ? (isDark ? 'dark' : 'minimal') : id
  if (resolved === 'satellite') return { key: 'satellite', spec: SATELLITE }
  return { key: resolved, spec: URLS[resolved] }
}

/**
 * The style for replaying a walk: imagery for the ground plus the vector
 * tiles we already load, used only to extrude buildings. In a flat city the
 * buildings are the relief, so a tilted camera has something to fly between.
 */
export const CINEMATIC: StyleSpecification = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: {
    sat: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Esri, Maxar, Earthstar Geographics',
    },
    ofm: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
      attribution: 'OpenFreeMap, OpenMapTiles, OpenStreetMap',
    },
  },
  layers: [
    { id: 'sat', type: 'raster', source: 'sat' },
    {
      id: 'buildings-3d',
      type: 'fill-extrusion',
      source: 'ofm',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#dfe4d8',
        'fill-extrusion-opacity': 0.55,
        // most buildings carry a height; the rest get a sensible storey guess
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 9],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      },
    },
  ],
}

/**
 * Looks for the replay screen. Three answers to the same question, and the
 * trade-off is the interesting part:
 *
 * - imagery cannot be repainted feature by feature, but it CAN be graded like
 *   film: MapLibre lets a raster layer be desaturated, darkened and hue
 *   shifted, which is how the night look is made;
 * - the vector look drops imagery entirely and paints the city from the same
 *   tiles we already load, so every colour is ours and the trail really pops;
 * - both extrude buildings, because in a flat city the buildings are the relief.
 */
export type ReplayLook = 'day' | 'night' | 'graphite'

export const REPLAY_LOOKS: Array<{ id: ReplayLook; label: string }> = [
  { id: 'day', label: 'Satelita' },
  { id: 'night', label: 'Noc' },
  { id: 'graphite', label: 'Grafit 3D' },
]

const sat = (extra: Record<string, unknown>) => ({
  id: 'sat',
  type: 'raster' as const,
  source: 'sat',
  paint: extra as never,
})

const buildings = (color: string, opacity: number) => ({
  id: 'buildings-3d',
  type: 'fill-extrusion' as const,
  source: 'ofm',
  'source-layer': 'building',
  minzoom: 14,
  paint: {
    'fill-extrusion-color': color,
    'fill-extrusion-opacity': opacity,
    'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 9],
    'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
  } as never,
})

const SOURCES = {
  sat: {
    type: 'raster' as const,
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    tileSize: 256,
    maxzoom: 19,
    attribution: 'Esri, Maxar, Earthstar Geographics',
  },
  ofm: {
    type: 'vector' as const,
    url: 'https://tiles.openfreemap.org/planet',
    attribution: 'OpenFreeMap, OpenMapTiles, OpenStreetMap',
  },
}

export function replayStyle(look: ReplayLook): StyleSpecification {
  const base = {
    version: 8 as const,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: SOURCES,
  }
  if (look === 'day') {
    return { ...base, layers: [sat({}), buildings('#dfe4d8', 0.55)] }
  }
  if (look === 'night') {
    return {
      ...base,
      layers: [
        // graded like film: cooler, darker, most of the colour taken out
        sat({
          'raster-saturation': -0.55,
          'raster-contrast': 0.12,
          'raster-brightness-max': 0.52,
          'raster-hue-rotate': 200,
        }),
        buildings('#1d2a3a', 0.7),
      ],
    }
  }
  // no imagery at all: the city painted from our own palette
  return {
    ...base,
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#0e1310' } },
      {
        id: 'water',
        type: 'fill',
        source: 'ofm',
        'source-layer': 'water',
        paint: { 'fill-color': '#16232b' },
      },
      {
        id: 'green',
        type: 'fill',
        source: 'ofm',
        'source-layer': 'landcover',
        paint: { 'fill-color': '#16251a', 'fill-opacity': 0.9 },
      },
      {
        id: 'roads',
        type: 'line',
        source: 'ofm',
        'source-layer': 'transportation',
        paint: {
          'line-color': '#2b332c',
          'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.4, 17, 2.4] as never,
        },
      },
      buildings('#24312a', 0.95),
    ],
  }
}
