// Three maps for the walking screen and nothing else: the photograph, our grey
// drawing, and the photograph standing up on raised ground. All keyless.

import type { StyleSpecification } from 'maplibre-gl'

export type MapStyleId = 'ortho' | 'satellite' | 'minimal' | 'satellite-3d'

export type MapStyleDef = {
  id: MapStyleId
  label: string
  /** two colors for the preview swatch */
  swatch: [string, string]
}

export const MAP_STYLES: MapStyleDef[] = [
  // polska ortofotomapa: ostrzejsza i w lepszym swietle niz globalne zdjecia
  { id: 'ortho', label: 'Ortofoto', swatch: ['#3c5a35', '#22402c'] },
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
 * Polska ortofotomapa z Geoportalu (GUGiK), i to jest widoczna zmiana jakosci.
 *
 * Porownanie na Rynku Glownym, ten sam kafel z 22 sierpnia 2026: Esri dal zdjecie
 * zimowe, ciemne, z cieniem przez pol placu i bezlistnym drzewem. Geoportal dal
 * letnie, ostre, z drzewem w lisciach i widocznymi ludzmi. W dolinkach pokrycie
 * jest, czas odpowiedzi 137 do 171 ms.
 *
 * Uklad kafli EPSG:3857 (zgodny z Google), wiec wchodzi jako zwykle zrodlo raster.
 * Maksymalne przyblizenie to 19: na 20 serwis zwraca blad, wiec nie prosimy.
 * Nie ma automatycznego zapasu, gdy serwis nie odpowiada, dlatego satelita Esri
 * zostaje osobnym stylem do przelaczenia.
 */
const ORTHO_URL =
  'https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMTS/StandardResolution' +
  '?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTOFOTOMAPA&STYLE=default' +
  '&FORMAT=image/jpeg&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'

const ORTHO = {
  type: 'raster' as const,
  tiles: [ORTHO_URL],
  tileSize: 256,
  maxzoom: 19,
  attribution: 'Ortofotomapa: GUGiK, Geoportal',
}

/*
 * Ta sama ortofotomapa, tylko poproszona o jeden poziom glebiej, i to jest
 * druga polowa odpowiedzi na "chcialbym lepsza jakosc".
 *
 * MapLibre wybiera poziom kafli ze wzoru zoom + log2(512 / tileSize), wiec przy
 * tileSize 256 dostajemy zoom + 1, a przy 128 zoom + 2. Zdjecie nadal ma 256
 * pikseli, tylko wchodzi w mniejsze pole: to zwykly supersampling, dwa razy
 * wiecej pikseli na kazda os. Ma znaczenie na telefonie, bo iPhone ma trzy
 * piksele urzadzenia na jeden piksel CSS, a MapLibre tego nie wlicza, wiec
 * zdjecie bylo dotad rozciagane.
 *
 * Odtwarzanie stoi na zoomie 16.6, czyli tu wypada dokladnie poziom 19, a to
 * jest maksimum Geoportalu. Idealnie sie spina: najostrzej jak mozna i ani
 * jednego kafla ponad to, co serwis ma. Kosztuje cztery razy wiecej kafli,
 * dlatego zywa mapa zostaje na 256: tam sie przesuwa i przybliza bez konca,
 * a tutaj kamera leci po jednej trasie i kafle zostaja w pamieci.
 */
const ORTHO_SHARP = { ...ORTHO, tileSize: 128 }

// glyphs so symbol layers (the parking P) render on imagery too
const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf'

const SATELLITE: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS,
  sources: { sat: IMAGERY },
  layers: [{ id: 'sat', type: 'raster', source: 'sat' }],
}

const ORTHO_STYLE: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS,
  sources: { sat: ORTHO },
  layers: [{ id: 'sat', type: 'raster', source: 'sat' }],
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
    sat: ORTHO,
    dem: DEM,
    ofm: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
      attribution: 'OpenFreeMap, OpenMapTiles, OpenStreetMap',
    },
  },
  // no terrain here on purpose: declared in a style it comes out blank when the
  // style is swapped in with setStyle, and only works when the map is built
  // with it. The replay can do that, this map cannot, so it is set separately
  layers: [
    { id: 'sat', type: 'raster', source: 'sat' },
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
   * Anything else, including a style we used to have, lands on the photograph,
   * and od teraz na polskiej: ta apka chodzi tylko po Polsce, a tam ortofotomapa
   * jest ostrzejsza i swiezsza niz zdjecie globalne. Kto juz wybral styl, ten
   * zostaje przy swoim, bo wybor siedzi w pamieci telefonu.
   */
  return MAP_STYLES.some((s) => s.id === v) ? (v as MapStyleId) : 'ortho'
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
   */
  if (id === 'ortho') return { key: 'satellite-ortho', spec: ORTHO_STYLE, pitch: 0, terrain: null }
  return { key: 'satellite', spec: SATELLITE, pitch: 0, terrain: null }
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
  sat: ORTHO_SHARP,
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
