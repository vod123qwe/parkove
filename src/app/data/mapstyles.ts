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
const hillshade = (strength: number, tone?: { shadow: string; highlight: string }) => ({
  id: 'shade',
  type: 'hillshade' as const,
  source: 'dem',
  paint: {
    'hillshade-exaggeration': strength,
    'hillshade-shadow-color': tone ? tone.shadow : 'rgba(44, 54, 38, 0.55)',
    'hillshade-highlight-color': tone ? tone.highlight : 'rgba(255, 253, 244, 0.4)',
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
export type ReplayLook = 'relief' | 'relief-night' | 'graphite'

export const REPLAY_LOOKS: Array<{ id: ReplayLook; label: string }> = [
  { id: 'relief', label: 'Rzeźba terenu' },
  { id: 'relief-night', label: 'Rzeźba terenu w nocy' },
  { id: 'graphite', label: 'Grafit 3D' },
]

const raster = (extra: Record<string, unknown>) => ({
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
  dem: DEM,
}

export function replayStyle(look: ReplayLook): StyleSpecification {
  const base = {
    version: 8 as const,
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    sources: SOURCES,
  }
  if (look === 'relief') {
    return {
      ...base,
      // the ground at three times its height: in a flat city that is the only
      // way the mounds, the quarry and the river valley read at all
      terrain: { source: 'dem', exaggeration: 3 },
      // no synthetic shading here on purpose: the imagery already carries the
      // sun it was photographed under, and a second light fights the first
      layers: [raster({ 'raster-saturation': -0.05, 'raster-contrast': 0.06 }), buildings('#dfe4d8', 0.55)],
    }
  }
  if (look === 'relief-night') {
    return {
      ...base,
      terrain: { source: 'dem', exaggeration: 3 },
      layers: [
        // graded like film: cooler, darker, most of the colour taken out
        raster({
          'raster-saturation': -0.55,
          'raster-contrast': 0.12,
          'raster-brightness-max': 0.5,
          'raster-hue-rotate': 200,
        }),
        // once the picture is this dark its own shadows stop describing the
        // ground, so a cold synthetic light takes over
        hillshade(0.8, { shadow: 'rgba(4, 10, 20, 0.72)', highlight: 'rgba(150, 190, 235, 0.34)' }),
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
