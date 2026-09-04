// Three maps for the walking screen and nothing else: the photograph, our grey
// drawing, and the photograph standing up on raised ground. All keyless.

import type { StyleSpecification } from 'maplibre-gl'

export type MapStyleId = 'satellite' | 'minimal' | 'satellite-3d'

export type MapStyleDef = {
  id: MapStyleId
  label: string
  /** two colors for the preview swatch */
  swatch: [string, string]
}

export const MAP_STYLES: MapStyleDef[] = [
  { id: 'satellite', label: 'Satelita', swatch: ['#2c4a2f', '#1a2e3f'] },
  { id: 'minimal', label: 'Minimal', swatch: ['#f4f4f0', '#d9dcd4'] },
  // same name as the replay look, because it is the same thing: the photograph
  // draped over raised ground, seen from an angle
  { id: 'satellite-3d', label: 'Rzeźba terenu', swatch: ['#43604a', '#243a2a'] },
]

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

const MINIMAL = 'https://tiles.openfreemap.org/styles/positron'

const IMAGERY = {
  type: 'raster' as const,
  tiles: [
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  ],
  tileSize: 256,
  maxzoom: 19,
  attribution: 'Esri, Maxar, Earthstar Geographics',
}

/*
 * Ta sama satelita, poproszona o jeden poziom glebiej: MapLibre wybiera kafle
 * ze wzoru zoom + log2(512 / tileSize), wiec tileSize 128 daje zoom + 2.
 * Zwykly supersampling, dwa razy wiecej pikseli na os. Odtwarzanie wspomnienia
 * lata nisko i skosnie, tam kazdy nieostry piksel widac dwa razy; zywa mapa
 * zostaje na 256, bo przesuwa sie bez konca i kafli poszloby cztery razy tyle.
 * (GUGiK, ktory kiedys tu byl, wylecial na zyczenie Jarka 2026-08-24.)
 */
const IMAGERY_SHARP = { ...IMAGERY, tileSize: 128 }

// glyphs so symbol layers (the parking P) render on imagery too
const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf'

/** te same kafle wektorowe, z ktorych bierzemy budynki 3D */
const OFM_VECTOR = {
  type: 'vector' as const,
  url: 'https://tiles.openfreemap.org/planet',
  attribution: 'OpenFreeMap, OpenMapTiles, OpenStreetMap',
}

/*
 * SCIEZKI I NAZWY SKAL NA ZDJECIU (Jarek 2026-08-29: „czy nasza mapa bierze
 * pod uwage wszystkie sciezki, jak np. ta mapa?").
 *
 * Nie braly. Satelita to samo zdjecie: sciezke widac tylko wtedy, gdy jest
 * wydeptana na tyle, ze rzuca sie w oczy z powietrza, a nazwy skal nie
 * istnialy w ogole. W dolinkach to jest roznica miedzy mapa a tapeta: Turnia
 * Pilcha i Zabi Kon sa w OSM, tylko nikt ich nie rysowal.
 *
 * Zrodlo jest to samo, ktore juz wozimy dla budynkow 3D, wiec nie dochodzi
 * zadna zaleznosc ani klucz. Sprawdzone na Jurze: w jednym kadrze 15 odcinkow
 * sciezek i piec nazwanych skal.
 *
 * Styl: biala linia przerywana, jak na mapach turystycznych, bo na zdjeciu
 * lasu kazdy ciemny kolor ginie. Nazwy skal maja obwodke, nie tlo, zeby nie
 * zaslanialy terenu.
 */
const PATH_LAYERS = [
  {
    id: 'osm-track',
    type: 'line' as const,
    source: 'ofm',
    'source-layer': 'transportation',
    minzoom: 13,
    filter: ['match', ['get', 'class'], ['track', 'service'], true, false],
    paint: {
      'line-color': 'rgba(255,255,255,0.62)',
      'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.8, 17, 2.4],
    },
  },
  {
    id: 'osm-path',
    type: 'line' as const,
    source: 'ofm',
    'source-layer': 'transportation',
    minzoom: 13,
    filter: ['==', ['get', 'class'], 'path'],
    paint: {
      'line-color': 'rgba(255,255,255,0.78)',
      'line-width': ['interpolate', ['linear'], ['zoom'], 13, 0.9, 17, 2.2],
      'line-dasharray': [2.4, 1.6],
    },
  },
  {
    id: 'osm-peak',
    type: 'symbol' as const,
    source: 'ofm',
    'source-layer': 'mountain_peak',
    minzoom: 13,
    layout: {
      'text-field': ['get', 'name'],
      'text-font': ['Noto Sans Regular'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 13, 10, 17, 13],
      'text-offset': [0, 0.7],
      'text-anchor': 'top',
      'text-max-width': 8,
    },
    paint: {
      'text-color': '#f4f7ef',
      'text-halo-color': 'rgba(12,20,12,0.85)',
      'text-halo-width': 1.6,
    },
  },
] as never[]

const SATELLITE: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS,
  sources: { sat: IMAGERY, ofm: OFM_VECTOR },
  layers: [{ id: 'sat', type: 'raster', source: 'sat' }, ...PATH_LAYERS],
}

/**
 * The same photograph, standing up. The elevation is real and pushed a little,
 * because Kraków is flat enough that true scale reads as nothing, and the
 * buildings are extruded from the vector tiles so the city has volume too.
 * This one costs: elevation tiles, a second set of tiles for the buildings and
 * a perspective recomputed every frame. It is a choice, not the default.
 */
const SATELLITE_3D: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS,
  sources: {
    sat: IMAGERY,
    dem: DEM,
    ofm: OFM_VECTOR,
  },
  // no terrain here on purpose: declared in a style it comes out blank when the
  // style is swapped in with setStyle, and only works when the map is built
  // with it. The replay can do that, this map cannot, so it is set separately
  layers: [
    { id: 'sat', type: 'raster', source: 'sat' },
    ...PATH_LAYERS,
    {
      id: 'buildings-3d',
      type: 'fill-extrusion',
      source: 'ofm',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-extrusion-color': '#d7dccf',
        'fill-extrusion-opacity': 0.65,
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 9],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
      } as never,
    },
  ],
}

const KEY = 'pk-mapstyle'
export function getMapStyle(): MapStyleId {
  const v = localStorage.getItem(KEY) as MapStyleId | null
  /*
   * Anything else, including a style we used to have (jak Ortofoto z GUGiK),
   * lands on the satellite photograph. Kto juz wybral styl, ktory wciaz
   * istnieje, ten zostaje przy swoim, bo wybor siedzi w pamieci telefonu.
   */
  return MAP_STYLES.some((s) => s.id === v) ? (v as MapStyleId) : 'satellite'
}

export function setMapStyle(id: MapStyleId) {
  localStorage.setItem(KEY, id)
}

/**
 * The chosen style as something MapLibre can take, plus the angle it wants:
 * the raised one is always seen from the side, the flat ones from above.
 */
export type ResolvedStyle = {
  key: string
  spec: string | StyleSpecification
  pitch: number
  terrain: { source: string; exaggeration: number } | null
}

export function resolveMapStyle(id: MapStyleId): ResolvedStyle {
  if (id === 'satellite-3d') {
    return {
      key: 'satellite-3d',
      spec: SATELLITE_3D,
      pitch: 52,
      terrain: { source: 'dem', exaggeration: 2.2 },
    }
  }
  if (id === 'minimal') return { key: 'minimal', spec: MINIMAL, pitch: 0, terrain: null }
  /*
   * Klucz zaczyna sie od 'satellite', bo tak rozpoznajemy w MapView, ze pod
   * spodem jest zdjecie: od tego zaleza przezroczystosc parkow i kolory pinow.
   * Pitch 24: ekran glowny stoi odrobine pochylony (uwaga Jarka: "bardzo
   * lekko w dol"), na tyle malo, ze piny i etykiety nie klamia o pozycji.
   */
  return { key: 'satellite', spec: SATELLITE, pitch: 24, terrain: null }
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

/*
 * Kazda warstwa zdjecia w odtwarzaniu dostaje krotszy crossfade. Domyslne
 * 300 ms wyglada dobrze przy nieruchomej mapie, ale tutaj kamera leci bez
 * przerwy, wiec nowy kafel caly czas przenika z rozmytego kafla-rodzica i obraz
 * nigdy nie dochodzi do ostrosci. 100 ms wystarczy, zeby nie bylo skoku.
 */
const raster = (extra: Record<string, unknown>) => ({
  id: 'sat',
  type: 'raster' as const,
  source: 'sat',
  paint: { 'raster-fade-duration': 100, ...extra } as never,
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
  /*
   * Odtwarzanie wyprawy dostaje ortofotomape, nie globalne zdjecie, i to byla
   * uwaga Jarka: "traci feeling funkcja, gdzie mamy mape w 3D podczas
   * wspominania trasy". Tekstura jest tu wszystkim, bo kamera leci nisko i
   * skosnie, a wtedy kazdy nieostry piksel widac dwa razy.
   */
  sat: IMAGERY_SHARP,
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
