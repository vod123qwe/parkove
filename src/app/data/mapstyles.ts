// Map style variants, switchable in the profile.
// 'auto' follows the app theme: Minimal in light, Ciemna in dark.
// Free hosted styles: OpenFreeMap (no key), Carto dark-matter, Esri imagery (raster).

import type { StyleSpecification } from 'maplibre-gl'

export type MapStyleId =
  | 'auto'
  | 'minimal'
  | 'classic'
  | 'vivid'
  | 'dark'
  | 'satellite'
  | 'topo'
  | 'natgeo'

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
  { id: 'topo', label: 'Topograficzna', swatch: ['#eee9dc', '#8a9c74'] },
  { id: 'natgeo', label: 'National Geographic', swatch: ['#f2e8d5', '#c2a163'] },
]

/**
 * Esri publishes a handful of basemaps without a key. Only two of them go deep
 * enough for a walk through a park: the imagery and the topographic map. The
 * shaded relief ones stop at zoom 13, which is a whole city in one tile, so
 * they are no use here and the raised ground does that job better anyway.
 */
const esri = (service: string, maxzoom: number) => ({
  type: 'raster' as const,
  tiles: [
    `https://services.arcgisonline.com/ArcGIS/rest/services/${service}/MapServer/tile/{z}/{y}/{x}`,
  ],
  tileSize: 256,
  maxzoom,
  attribution: 'Esri',
})

/** free global elevation, no key, and it does send CORS headers */
const DEM = {
  type: 'raster-dem' as const,
  tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
  encoding: 'terrarium' as const,
  tileSize: 256,
  maxzoom: 15,
  attribution: 'Elevation: Mapzen, AWS Open Data',
}

/**
 * Hills, drawn from the elevation tiles rather than baked into a picture, so
 * they stay sharp at any zoom. Kept translucent: this is a coat of shadow over
 * a map that already has contour lines, not a replacement for it.
 */
const hillshade = (strength: number) => ({
  id: 'shade',
  type: 'hillshade' as const,
  source: 'dem',
  paint: {
    'hillshade-exaggeration': strength,
    'hillshade-shadow-color': 'rgba(44, 54, 38, 0.55)',
    'hillshade-highlight-color': 'rgba(255, 253, 244, 0.4)',
    'hillshade-accent-color': 'rgba(70, 82, 58, 0.3)',
  } as never,
})

const TOPO: StyleSpecification = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sources: { topo: esri('World_Topo_Map', 23) },
  layers: [
    {
      id: 'topo',
      type: 'raster',
      source: 'topo',
      // a touch of the colour taken out and a touch more contrast: the contour
      // lines and the paths come forward, the labels stay readable
      paint: { 'raster-saturation': -0.14, 'raster-contrast': 0.14 } as never,
    },
  ],
}

const NATGEO: StyleSpecification = {
  version: 8,
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  // this one is a painting and stops at zoom 16, so a park fills the screen
  // softly rather than sharply. No shading on top: it already has its own
  sources: { natgeo: esri('NatGeo_World_Map', 16) },
  layers: [{ id: 'natgeo', type: 'raster', source: 'natgeo' }],
}

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
const KEY_3D = 'pk-map3d'

/**
 * 3D is a coat on top of the chosen map rather than a map of its own: raised
 * ground, shading, extruded buildings and a camera that stays tilted. That way
 * it composes with every base, imagery and topographic alike, and picking a new
 * base does not throw the tilt away.
 */
export const OVERLAY_3D = {
  pitch: 52,
  exaggeration: 1.5,
  sources: {
    'dem-3d': DEM,
    'ofm-3d': {
      type: 'vector' as const,
      url: 'https://tiles.openfreemap.org/planet',
      attribution: 'OpenFreeMap, OpenMapTiles, OpenStreetMap',
    },
  },
  /** painted under the app's own layers, so pins and parks stay on top */
  layers: [
    { ...hillshade(0.8), id: 'shade-3d', source: 'dem-3d' },
    {
      id: 'buildings-3d',
      type: 'fill-extrusion' as const,
      source: 'ofm-3d',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#d7dccf',
        'fill-extrusion-opacity': 0.7,
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 9],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      } as never,
    },
  ],
}

export function get3D() {
  return localStorage.getItem(KEY_3D) === 'on'
}

export function set3D(on: boolean) {
  localStorage.setItem(KEY_3D, on ? 'on' : 'off')
}

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
  if (resolved === 'topo') return { key: 'topo', spec: TOPO }
  if (resolved === 'natgeo') return { key: 'natgeo', spec: NATGEO }
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
export type ReplayLook = 'topo' | 'day' | 'night' | 'mono' | 'sepia' | 'relief' | 'graphite' | 'mint'

export const REPLAY_LOOKS: Array<{ id: ReplayLook; label: string }> = [
  { id: 'topo', label: 'Topograficzna' },
  { id: 'day', label: 'Satelita' },
  { id: 'night', label: 'Noc' },
  { id: 'mono', label: 'Czarno-biała' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'relief', label: 'Rzeźba terenu' },
  { id: 'graphite', label: 'Grafit 3D' },
  { id: 'mint', label: 'Mięta 3D' },
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
  topo: esri('World_Topo_Map', 23),
  ofm: {
    type: 'vector' as const,
    url: 'https://tiles.openfreemap.org/planet',
    attribution: 'OpenFreeMap, OpenMapTiles, OpenStreetMap',
  },
  dem: DEM,
}

export function replayStyle(look: ReplayLook): StyleSpecification {
  const base = {
    version: 8 as const,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: SOURCES,
  }
  if (look === 'topo') {
    return {
      ...base,
      // pushed harder than the imagery look: a topographic map is a drawing of
      // the ground, so the ground may as well be a model of itself
      terrain: { source: 'dem', exaggeration: 3 },
      layers: [
        {
          id: 'topo',
          type: 'raster' as const,
          source: 'topo',
          paint: { 'raster-saturation': -0.1, 'raster-contrast': 0.16 } as never,
        },
        hillshade(0.7),
        buildings('#cfc7b2', 0.8),
      ],
    }
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
  if (look === 'mono') {
    return {
      ...base,
      layers: [
        // all the colour taken out: nothing on screen is green except the walk
        sat({ 'raster-saturation': -1, 'raster-contrast': 0.28, 'raster-brightness-min': 0.04 }),
        buildings('#f2f2f2', 0.5),
      ],
    }
  }
  if (look === 'sepia') {
    return {
      ...base,
      layers: [
        // an old postcard: warm, soft, a little faded
        sat({
          'raster-saturation': -0.4,
          'raster-hue-rotate': -28,
          'raster-contrast': 0.08,
          'raster-brightness-max': 0.93,
        }),
        buildings('#e8dcc4', 0.6),
      ],
    }
  }
  if (look === 'relief') {
    return {
      ...base,
      // real elevation, pushed a little: Kraków is flat, so the mounds and the
      // river valley only read once the height is exaggerated
      terrain: { source: 'dem', exaggeration: 2.2 },
      layers: [
        sat({ 'raster-saturation': -0.1 }),
        hillshade(0.55),
        buildings('#dfe4d8', 0.5),
      ],
    }
  }
  if (look === 'mint') {
    return {
      ...base,
      layers: [
        { id: 'bg', type: 'background', paint: { 'background-color': '#0b1a10' } },
        {
          id: 'water',
          type: 'fill',
          source: 'ofm',
          'source-layer': 'water',
          paint: { 'fill-color': '#123027' },
        },
        {
          id: 'green',
          type: 'fill',
          source: 'ofm',
          'source-layer': 'landcover',
          paint: { 'fill-color': '#16311c', 'fill-opacity': 0.95 },
        },
        {
          id: 'roads',
          type: 'line',
          source: 'ofm',
          'source-layer': 'transportation',
          paint: {
            'line-color': '#2a4a32',
            'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.4, 17, 2.4] as never,
          },
        },
        // the city in the colour of the app, so the trail belongs to it
        buildings('#3c6b45', 0.95),
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
