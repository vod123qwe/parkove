import { useEffect, useRef } from 'react'
import { Map as MapGL } from 'maplibre-gl'
import type { MapLayerMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import parksData from './data/parks.json'
import bordersData from './data/borders.json'
import { circlePolygon, trackSegments } from './geo'
import { buildParkPinImages, buildPhotoImage, buildPinImages, pinColors, pinImageId } from './pins'
import type { ParkPinState } from './pins'
import { asset } from './assets'
import type { ResolvedStyle } from './data/mapstyles'

const KRAKOW: [number, number] = [19.9445, 50.0555]

export type MapFocus = {
  center: [number, number]
  /** fit this box instead of centring, used for a whole recorded route */
  bounds?: [[number, number], [number, number]]
  /** zoom derived from park size; ignored when zoom is set */
  areaHa?: number
  /** explicit zoom, wins over areaHa */
  zoom?: number
  ts: number
  /** keep the target visible above a bottom sheet */
  bottomPadding?: number
}

export type QuestOverlay = {
  pois: Array<{
    id: string
    name: string
    category: string
    coords: [number, number]
    collected: boolean
    active?: boolean
  }>
}

/** collected parks, drawn as stamp pins once the map is zoomed in */
export type StampPin = { parkId: string; coords: [number, number] }

/** something you left on a walk: a picture, a voice note or a written one */
export type MarkPin = {
  id: string
  kind: 'photo' | 'audio' | 'note' | 'car'
  coords: [number, number]
  /** the picture, for the thumbnail pin; absent for notes */
  blob?: Blob
}

/** practical spots around a park: coffee and playgrounds */
export type AmenityPin = {
  id: string
  kind: 'food' | 'playground'
  coords: [number, number]
}

const parkPinFC = (pins: ParkPin[], hideId: string | null, show: boolean) => ({
  type: 'FeatureCollection',
  features: !show
    ? []
    : pins
        .filter((p) => p.id !== hideId)
        .map((p) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: p.coords },
          properties: { id: p.id, state: p.state, icon: parkPinImageIdFor(p) },
        })),
})
const parkPinImageIdFor = (p: ParkPin) => `ppin-${p.kind}-${p.state}`

/** pin parku na głównej mapie: ikona rodzaju + kolor stanu (grill 2026-08-24) */
export type ParkPin = {
  id: string
  kind: string
  state: ParkPinState
  coords: [number, number]
}

type Props = {
  visited: Set<string>
  onSelect: (id: string) => void
  onSelectPoi: (poiId: string) => void
  /**
   * Parkingi wybranego miejsca. Tablica, nie jeden: filtr „Parkingi" pokazuje
   * wszystkie, ktore sa w danych, a nie tylko sugerowany. Pusta = zadnych.
   */
  parking: Array<{ id: string; coords: [number, number]; active?: boolean }>
  onSelectParking: (id: string) => void
  /** tap on empty map: close peeks and selection */
  onClearSelection: () => void
  /**
   * Piny wszystkich miejsc. Pin wybranego parku znika na czas zaznaczenia
   * (obrys + karta go zastępują), na wyprawie znikają wszystkie: mapa jest
   * wtedy operacyjna. Oba przypadki załatwia builder kolekcji niżej.
   */
  parkPins: ParkPin[]
  hideParkPinId: string | null
  showParkPins: boolean
  focus: MapFocus | null
  /** quest points of the selected or walked park, null otherwise */
  quest: QuestOverlay | null
  /**
   * Wybrany szlak tego miejsca. Rysowany pod sladem GPS i pod pinami: to
   * podpowiedz, gdzie isc, a nie zapis tego, gdzie byles.
   */
  trail: { line: Array<[number, number]>; ink?: string } | null
  /** active expedition GPS track */
  track: Array<[number, number]> | null
  /** live position during a walk: dot, accuracy halo and heading */
  me: { coords: [number, number]; accuracy: number; course: number | null } | null
  /** camera rides along with the dot until the map is touched */
  followMe: boolean
  /** a pan, zoom or rotate made by hand hands the camera back to the walker */
  onUserPan: () => void
  /** resolved style; key changes re-add the app layers on top of the new style */
  mapStyle: ResolvedStyle
  /** stamp pins for collected parks, shown when zoomed in */
  stampPins: StampPin[]
  onSelectStamp: (parkId: string) => void
  /** food and playground spots of the selected park */
  amenityPins: AmenityPin[]
  onSelectAmenity: (kind: 'food' | 'playground', id: string) => void
  /** zaznaczona kawiarnia albo plac zabaw: rośnie i dostaje obwódkę */
  activeAmenityId: string | null
  /** stamp of this park steps aside so its quest pins stay readable */
  hideStampFor: string | null
  /** park w reflektorze: reszta mapy dostaje ciemną zasłonę z dziurą w jego kształcie */
  focusId?: string | null
  /** what the current walk left behind, drawn as thumbnails and small pins */
  photoPins: MarkPin[]
  onSelectPhoto: (id: string) => void
  /** while moving a pin, the next tap on the map is its new home */
  placingPhoto: boolean
  onPlacePhoto: (coords: [number, number]) => void
}

function readMapColors() {
  const cs = getComputedStyle(document.documentElement)
  const v = (name: string) => cs.getPropertyValue(name).trim()
  return {
    visitedFill: v('--map-visited-fill'),
    visitedStroke: v('--map-visited-stroke'),
    unvisitedFill: v('--map-unvisited-fill'),
    unvisitedStroke: v('--map-unvisited-stroke'),
    track: v('--map-track'),
    // szlak: jasny limonkowy jak w mini mapach, żeby nie mieszał się z twoim
    // śladem GPS, który jest ciemną oliwką i na zdjęciu satelitarnym ginie
    trail: v('--bg-lime'),
    poiDone: v('--bg-gold'),
    poiOpen: v('--bg-surface'),
    poiStroke: v('--map-visited-stroke'),
    me: v('--content-info'),
    meRing: v('--bg-surface'),
  }
}

/*
 * Kolor granicy. Linie nie leza na zrodle parkow, wiec nie moga czytac
 * feature-state: odwiedzone rozpoznajemy dopasowaniem po wlasnosci `park`.
 * Wyrazenie match wymaga niepustej listy etykiet, dlatego przy zerowej liczbie
 * odwiedzonych wracamy do zwyklego koloru.
 */
function borderColor(visited: Set<string>, c: ReturnType<typeof readMapColors>) {
  if (!visited.size) return c.unvisitedStroke
  return ['match', ['get', 'park'], [...visited], c.visitedStroke, c.unvisitedStroke]
}

/** grubosc granicy: park w reflektorze dostaje najgrubsza linie */
const borderWidth = (focus: string | null, base: number, wide: number) =>
  focus ? ['case', ['==', ['get', 'park'], focus], wide, base] : base

const questFC = (quest: QuestOverlay | null) => ({
  type: 'FeatureCollection' as const,
  features: (quest?.pois ?? []).map((p) => ({
    type: 'Feature' as const,
    properties: {
      collected: p.collected,
      name: p.name,
      poiId: p.id,
      active: !!p.active,
      icon: pinImageId(p.category, p.active ? 'active' : p.collected ? 'done' : 'open'),
    },
    geometry: { type: 'Point' as const, coordinates: p.coords },
  })),
})

const amenityFC = (pins: AmenityPin[], activeId?: string | null) => ({
  type: 'FeatureCollection' as const,
  features: pins.map((p) => ({
    type: 'Feature' as const,
    // id i flaga jadą w danych, żeby dało się kliknąć w KONKRETNĄ kawiarnię,
    // a nie tylko w kategorię, i żeby zaznaczona urosła
    properties: { id: p.id, kind: p.kind, active: p.id === activeId, icon: pinImageId(p.kind, p.kind) },
    geometry: { type: 'Point' as const, coordinates: p.coords },
  })),
})

const stampFC = (pins: StampPin[]) => ({
  type: 'FeatureCollection' as const,
  features: pins.map((p) => ({
    type: 'Feature' as const,
    properties: { parkId: p.parkId, icon: `stamp-${p.parkId}` },
    geometry: { type: 'Point' as const, coordinates: p.coords },
  })),
})

const parkingFC = (parking: Array<{ id: string; coords: [number, number]; active?: boolean }>) => ({
  type: 'FeatureCollection' as const,
  features: parking.map((p) => ({
    type: 'Feature' as const,
    properties: { id: p.id, label: 'P', active: !!p.active },
    geometry: { type: 'Point' as const, coordinates: p.coords },
  })),
})

const trailFC = (trail: { line: Array<[number, number]> } | null) => ({
  type: 'FeatureCollection',
  features: trail?.line?.length
    ? [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: trail.line } }]
    : [],
})

const trackFC = (track: Array<[number, number]> | null) => {
  const segments = trackSegments(track ?? [])
  const walked = segments
    .filter((seg) => seg.length >= 2)
    .map((seg) => ({
      type: 'Feature' as const,
      properties: { kind: 'walk' },
      geometry: { type: 'LineString' as const, coordinates: seg },
    }))
  // a jump between two segments means the phone stopped reporting: draw it dashed
  const gaps = segments.slice(1).map((seg, i) => ({
    type: 'Feature' as const,
    properties: { kind: 'gap' },
    geometry: {
      type: 'LineString' as const,
      coordinates: [segments[i][segments[i].length - 1], seg[0]],
    },
  }))
  return { type: 'FeatureCollection' as const, features: [...walked, ...gaps] }
}

const meFC = (me: Props['me']) => ({
  type: 'FeatureCollection' as const,
  features: me
    ? [
        {
          type: 'Feature' as const,
          properties: { course: me.course ?? 0, moving: me.course != null },
          geometry: { type: 'Point' as const, coordinates: me.coords },
        },
      ]
    : [],
})

const meHaloFC = (me: Props['me']) => ({
  type: 'FeatureCollection' as const,
  features:
    me && me.accuracy > 8
      ? [
          {
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'Polygon' as const,
              coordinates: circlePolygon(me.coords, Math.min(me.accuracy, 120)),
            },
          },
        ]
      : [],
})

const photoFC = (pins: MarkPin[]) => ({
  type: 'FeatureCollection' as const,
  features: pins.map((p) => ({
    type: 'Feature' as const,
    properties: {
      photoId: p.id,
      // a photo is its own thumbnail; a note or a recording gets a drawn pin
      icon: p.kind === 'photo' ? `photo-${p.id}` : pinImageId(p.kind, p.kind),
    },
    geometry: { type: 'Point' as const, coordinates: p.coords },
  })),
})

const zoomForArea = (ha: number) => (ha > 150 ? 12.4 : ha > 40 ? 13.2 : ha > 8 ? 14 : 14.8)

/**
 * Zasłona reflektora: jeden wielokąt na cały świat z dziurą w kształcie
 * wybranego parku. Dzięki temu przyciemnienie jest dokładnie po granicy parku,
 * a środek zostaje w naturalnych kolorach zdjęcia satelitarnego. Bez parku
 * zwraca pustą kolekcję, czyli zasłony nie ma.
 */
function focusFC(parkId: string | null) {
  const empty = { type: 'FeatureCollection' as const, features: [] as never[] }
  if (!parkId) return empty
  const f = (parksData as { features: Array<{ id: string; geometry: { type: string; coordinates: unknown } }> }).features.find(
    (x) => x.id === parkId,
  )
  if (!f) return empty
  const world = [
    [-180, -85],
    [180, -85],
    [180, 85],
    [-180, 85],
    [-180, -85],
  ]
  const holes =
    f.geometry.type === 'Polygon'
      ? (f.geometry.coordinates as number[][][])
      : (f.geometry.coordinates as number[][][][]).flat()
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'Polygon' as const, coordinates: [world, ...holes] },
      },
    ],
  }
}

export function MapView({
  visited,
  onSelect,
  onSelectPoi,
  parking,
  onSelectParking,
  onClearSelection,
  parkPins,
  hideParkPinId,
  showParkPins,
  focus,
  quest,
  trail,
  track,
  me,
  followMe,
  onUserPan,
  mapStyle,
  stampPins,
  onSelectStamp,
  amenityPins,
  onSelectAmenity,
  activeAmenityId,
  hideStampFor,
  focusId,
  photoPins,
  onSelectPhoto,
  placingPhoto,
  onPlacePhoto,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapGL | null>(null)
  const loadedRef = useRef(false)
  const visitedRef = useRef(visited)
  const questRef = useRef(quest)
  const trailRef = useRef(trail)
  const trackRef = useRef(track)
  const meRef = useRef(me)
  const followRef = useRef(followMe)
  const parkingRef = useRef(parking)
  const parkPinsRef = useRef(parkPins)
  const hidePinRef = useRef(hideParkPinId)
  const showPinsRef = useRef(showParkPins)
  const stampPinsRef = useRef(stampPins)
  const focusRef = useRef(focusId ?? null)
  const amenityPinsRef = useRef(amenityPins)
  const photoPinsRef = useRef(photoPins)
  const placingRef = useRef(placingPhoto)
  // the map handler is registered once, so callbacks must be read fresh
  const cbRef = useRef({ onSelect, onSelectPoi, onSelectParking, onSelectStamp, onClearSelection, onSelectAmenity, onUserPan, onSelectPhoto, onPlacePhoto })
  cbRef.current = { onSelect, onSelectPoi, onSelectParking, onSelectStamp, onClearSelection, onSelectAmenity, onUserPan, onSelectPhoto, onPlacePhoto }
  /** bumped on every setStyle, so a half finished build knows to stand down */
  const styleEpoch = useRef(0)
  const initialStyle = useRef(mapStyle)
  const currentStyleKey = useRef(mapStyle.key)
  visitedRef.current = visited
  questRef.current = quest
  trailRef.current = trail
  trackRef.current = track
  meRef.current = me
  followRef.current = followMe
  parkingRef.current = parking
  parkPinsRef.current = parkPins
  hidePinRef.current = hideParkPinId
  showPinsRef.current = showParkPins
  stampPinsRef.current = stampPins
  focusRef.current = focusId ?? null
  amenityPinsRef.current = amenityPins
  photoPinsRef.current = photoPins
  placingRef.current = placingPhoto

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    ;(map.getSource('park-pins') as { setData: (d: unknown) => void } | undefined)?.setData(
      parkPinFC(parkPins, hideParkPinId, showParkPins),
    )
  }, [parkPins, hideParkPinId, showParkPins])

  useEffect(() => {
    if (!containerRef.current) return
    const map = new MapGL({
      container: containerRef.current,
      style: initialStyle.current.spec,
      center: KRAKOW,
      zoom: 11.4,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    if (import.meta.env.DEV) {
      // map errors are silent unless someone listens; surface them while developing
      ;(window as unknown as { __pkMap?: MapGL }).__pkMap = map
      map.on('error', (e) => {
        const err = (e as { error?: Error }).error
        console.error('[map error]', err?.message ?? e)
      })
    }

    /*
     * A style change throws away the style's image atlas, so every pin has to be
     * handed over again. Drawing them again is another matter: the artwork only
     * depends on the theme colours, so it is drawn once and kept.
     */
    let pinArt: { key: string; images: Array<[string, ImageData]> } | null = null
    const addPinImages = async () => {
      const colors = pinColors()
      const key = JSON.stringify(colors)
      const art =
        pinArt && pinArt.key === key
          ? pinArt
          : { key, images: [...(await buildPinImages(colors))] }
      pinArt = art
      for (const [id, bmp] of art.images) {
        if (map.hasImage(id)) map.removeImage(id)
        map.addImage(id, bmp)
      }
    }

    /**
     * Stamp artwork per collected park, fetched once and kept, misses included:
     * without that, every change of base map went back to the network for the
     * same pictures and the same 404s.
     */
    const stampArt = new Map<string, ImageBitmap | null>()
    const addStampImages = async (pins: StampPin[]) => {
      for (const pin of pins) {
        const id = `stamp-${pin.parkId}`
        if (map.hasImage(id)) continue
        if (stampArt.has(pin.parkId)) {
          const kept = stampArt.get(pin.parkId)
          if (kept) map.addImage(id, kept)
          continue
        }
        try {
          const res = await fetch(asset(`stamps/${pin.parkId}.png`))
          if (!res.ok) {
            stampArt.set(pin.parkId, null)
            continue
          }
          const bmp = await createImageBitmap(await res.blob())
          stampArt.set(pin.parkId, bmp)
          if (!map.hasImage(id)) map.addImage(id, bmp)
        } catch {
          // no artwork for this park yet: the pin simply does not render
          stampArt.set(pin.parkId, null)
        }
      }
    }
    ;(map as unknown as { __addStampImages: (p: StampPin[]) => void }).__addStampImages = addStampImages

    /** the same, for the thumbnails a walk left behind */
    const photoArt = new Map<string, ImageData | null>()
    const addPhotoImages = async (pins: MarkPin[]) => {
      const ring = readMapColors().meRing
      for (const pin of pins) {
        if (pin.kind !== 'photo' || !pin.blob) continue
        const id = `photo-${pin.id}`
        if (map.hasImage(id)) continue
        if (photoArt.has(pin.id)) {
          const kept = photoArt.get(pin.id)
          if (kept) map.addImage(id, kept)
          continue
        }
        try {
          const bmp = await buildPhotoImage(pin.blob, ring)
          photoArt.set(pin.id, bmp)
          map.addImage(id, bmp)
        } catch {
          // an unreadable picture simply gets no pin
          photoArt.set(pin.id, null)
        }
      }
    }
    ;(map as unknown as { __addPhotoImages: (p: MarkPin[]) => Promise<void> }).__addPhotoImages =
      addPhotoImages

    const syncVisited = () => {
      for (const f of parksData.features) {
        map.setFeatureState({ source: 'parks', id: f.id }, { visited: visitedRef.current.has(f.id) })
      }
      // granice nie maja feature-state, wiec kolor przeliczamy wyrazeniem
      if (map.getLayer('parks-line')) {
        const c = readMapColors()
        map.setPaintProperty('parks-line', 'line-color', borderColor(visitedRef.current, c) as never)
        if (map.getLayer('parks-line-shared'))
          map.setPaintProperty('parks-line-shared', 'line-color', borderColor(visitedRef.current, c) as never)
      }
    }

    /*
     * Everything Parkove draws on top of the base style; re-run after setStyle.
     * The latch matters: styledata fires many times while a style loads, and the
     * source check below only starts saying yes two awaits later, so without it
     * every one of those events kicked off its own full rebuild in parallel.
     */
    /** everything of ours on the map, so a failed attempt can be undone */
    const APP_LAYERS = [
      'parks-fill',
      'parks-line',
      'parks-line-shared',
      'park-dots',
      'park-pins-layer',
      'park-pins-done',
      'trail-casing',
      'trail-line',
      'track-casing',
      'track-line',
      'track-gap',
      'me-halo-fill',
      'me-dot',
      'walk-photo-hit',
      'walk-photo-pins',
      'stamp-pin-hit',
      'stamp-pins-layer',
      'focus-scrim',
      'amenity-pins',
      'parking-pin',
      'quest-poi-dots',
      'amenity-hit',
      'parking-hit',
      'quest-poi-hit',
    ]
    const APP_SOURCES = [
      'parks',
      'park-pins',
      'borders',
      'trail',
      'track',
      'me-halo',
      'me',
      'quest-pois',
      'parking',
      'amenities',
      'walk-photos',
      'stamp-pins',
      'focus',
    ]
    const wipeAppLayers = () => {
      for (const id of APP_LAYERS) {
        try {
          if (map.getLayer(id)) map.removeLayer(id)
        } catch {
          // gone with the style already
        }
      }
      for (const id of APP_SOURCES) {
        try {
          if (map.getSource(id)) map.removeSource(id)
        } catch {
          // gone with the style already
        }
      }
    }

    let building = false
    const addAppLayers = async () => {
      if (building || map.getSource('parks')) return // already on this style
      building = true
      const epoch = styleEpoch.current
      try {
        await buildAppLayers(epoch)
      } catch {
        // the style was not ready yet, or it changed mid build: half a map is
        // worse than none, so clear it and let the next attempt start clean
        wipeAppLayers()
      } finally {
        building = false
      }
    }

    const buildAppLayers = async (epoch: number) => {
      await addPinImages()
      for (const [id, img] of await buildParkPinImages()) {
        if (map.hasImage(id)) map.removeImage(id)
        map.addImage(id, img, { pixelRatio: 2 })
      }
      await addStampImages(stampPinsRef.current)
      // the base map changed under us: this style is on its way out anyway
      if (epoch !== styleEpoch.current || map.getSource('parks')) return
      const c = readMapColors()
      // promoteId: string feature ids only work through a promoted property
      map.addSource('parks', { type: 'geojson', data: parksData as never, promoteId: 'id' })
      map.addLayer({
        id: 'parks-fill',
        type: 'fill',
        source: 'parks',
        paint: {
          'fill-color': ['case', ['boolean', ['feature-state', 'visited'], false], c.visitedFill, c.unvisitedFill] as never,
          // imagery already shows the greenery: keep fills light there
          // podbite z 0.28: parki mają być widoczne z daleka, zdjęcie nadal przebija
          'fill-opacity': currentStyleKey.current.startsWith('satellite') ? 0.36 : 0.6,
        },
      })
      /*
       * Granice rysujemy z osobnego zrodla (scripts/build-borders.mjs), nie z
       * wielokatow. Powod: tam gdzie dwa miejsca stykaja sie bokiem, ten bok byl
       * rysowany dwa razy i czytal sie mocniej niz granica zewnetrzna, jakby
       * przecinal miejsce na pol. Teraz wspolny odcinek ma wlasna warstwe:
       * cienszy i przerywany, wiec widac, ze to styk, a nie brzeg.
       */
      map.addSource('borders', { type: 'geojson', data: bordersData as never })
      map.addLayer({
        id: 'parks-line',
        type: 'line',
        source: 'borders',
        filter: ['!=', ['get', 'shared'], 1] as never,
        paint: {
          'line-color': borderColor(visitedRef.current, c) as never,
          // grubiej niż 1.6, a park w reflektorze dostaje najgrubszą linię, bo to
          // ona jedna zostaje po zdjęciu wypełnienia
          'line-width': borderWidth(focusRef.current, 2.2, 3.4) as never,
        },
      })
      map.addLayer({
        id: 'parks-line-shared',
        type: 'line',
        source: 'borders',
        filter: ['==', ['get', 'shared'], 1] as never,
        layout: { 'line-cap': 'butt' },
        paint: {
          'line-color': borderColor(visitedRef.current, c) as never,
          'line-width': borderWidth(focusRef.current, 1.5, 2) as never,
          'line-opacity': 0.72,
          'line-dasharray': [2.4, 2.6],
        },
      })
      /*
       * Piny miejsc (grill 2026-08-24): z daleka kropki stanu, od zoomu 11,6
       * pełne piny z ikoną rodzaju. Domknięte miejsca oddają scenę pieczątkom
       * od zoomu 12,5, więc ich pin symbolowy ma na tym progu maxzoom.
       */
      map.addSource('park-pins', {
        type: 'geojson',
        data: parkPinFC(parkPinsRef.current, hidePinRef.current, showPinsRef.current) as never,
      })
      map.addLayer({
        id: 'park-dots',
        type: 'circle',
        source: 'park-pins',
        maxzoom: 11.6,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 2.6, 11.6, 5.5] as never,
          'circle-color': [
            'match',
            ['get', 'state'],
            'visited',
            '#2a4a24',
            'done',
            '#e0b43c',
            '#f4f5ec',
          ] as never,
          'circle-stroke-width': 1.2,
          'circle-stroke-color': [
            'match',
            ['get', 'state'],
            'fresh',
            '#8b937c',
            '#ffffff',
          ] as never,
        },
      })
      map.addLayer({
        id: 'park-pins-layer',
        type: 'symbol',
        source: 'park-pins',
        minzoom: 11.6,
        filter: ['!=', ['get', 'state'], 'done'] as never,
        layout: {
          'icon-image': ['get', 'icon'] as never,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 11.6, 0.72, 14, 1] as never,
          'icon-allow-overlap': true,
        },
      })
      map.addLayer({
        id: 'park-pins-done',
        type: 'symbol',
        source: 'park-pins',
        minzoom: 11.6,
        maxzoom: 12.5,
        filter: ['==', ['get', 'state'], 'done'] as never,
        layout: {
          'icon-image': ['get', 'icon'] as never,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 11.6, 0.72, 14, 1] as never,
          'icon-allow-overlap': true,
        },
      })

      /*
       * Szlak: dwie warstwy, bo jedna kolorowa linia na zdjeciu satelitarnym
       * gubi sie w lesie. Ciemna obwodka daje jej kontrast na kazdym tle.
       */
      map.addSource('trail', { type: 'geojson', data: trailFC(trailRef.current) as never })
      map.addLayer({
        id: 'trail-casing',
        type: 'line',
        source: 'trail',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#0b1207', 'line-width': 7, 'line-opacity': 0.55 },
      })
      map.addLayer({
        id: 'trail-line',
        type: 'line',
        source: 'trail',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': trailRef.current?.ink ?? c.trail,
          'line-width': 3.4,
          'line-opacity': 0.95,
        },
      })
      map.addSource('track', { type: 'geojson', data: trackFC(trackRef.current) as never })
      /*
       * Biała obwódka pod śladem. Ślad jest ciemną oliwką (--map-track) i na
       * zdjęciu satelitarnym lasu po prostu ginął: ciemna linia na ciemnym tle.
       * Jasna otoczka pod nią czyta się na każdym podłożu, a sam kolor śladu
       * zostaje, więc nie mieszamy go z limonkowym szlakiem, który jest
       * podpowiedzią, nie zapisem.
       */
      map.addLayer({
        id: 'track-casing',
        type: 'line',
        source: 'track',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 6.5, 'line-opacity': 0.7 },
      })
      map.addLayer({
        id: 'track-line',
        type: 'line',
        source: 'track',
        filter: ['==', ['get', 'kind'], 'walk'] as never,
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': c.track, 'line-width': 3.5, 'line-opacity': 0.85 },
      })
      // dashed = the phone was asleep or lost signal, we do not know this stretch
      map.addLayer({
        id: 'track-gap',
        type: 'line',
        source: 'track',
        filter: ['==', ['get', 'kind'], 'gap'] as never,
        layout: { 'line-cap': 'round' },
        paint: {
          'line-color': c.track,
          'line-width': 2,
          'line-opacity': 0.45,
          'line-dasharray': [1.5, 2.5],
        },
      })
      map.addSource('me-halo', { type: 'geojson', data: meHaloFC(meRef.current) as never })
      map.addLayer({
        id: 'me-halo-fill',
        type: 'fill',
        source: 'me-halo',
        paint: { 'fill-color': c.me, 'fill-opacity': 0.12 },
      })
      map.addSource('me', { type: 'geojson', data: meFC(meRef.current) as never })
      map.addLayer({
        id: 'me-dot',
        type: 'circle',
        source: 'me',
        paint: {
          'circle-radius': 7,
          'circle-color': c.me,
          'circle-stroke-width': 3,
          'circle-stroke-color': c.meRing,
        },
      })
      map.addSource('quest-pois', { type: 'geojson', data: questFC(questRef.current) as never })
      // generous invisible hit area: pins are small, fingers are not
      map.addLayer({
        id: 'quest-poi-hit',
        type: 'circle',
        source: 'quest-pois',
        paint: { 'circle-radius': 22, 'circle-color': 'transparent' },
      })
      map.addLayer({
        id: 'quest-poi-dots',
        type: 'symbol',
        source: 'quest-pois',
        layout: {
          'icon-image': ['get', 'icon'] as never,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 11, 0.2, 14, 0.3, 17, 0.42] as never,
          'icon-allow-overlap': true,
        },
      })
      map.addSource('parking', { type: 'geojson', data: parkingFC(parkingRef.current) as never })
      map.addLayer({
        id: 'parking-hit',
        type: 'circle',
        source: 'parking',
        paint: { 'circle-radius': 22, 'circle-color': 'transparent' },
      })
      map.addLayer({
        id: 'parking-pin',
        type: 'symbol',
        source: 'parking',
        layout: {
          'icon-image': pinImageId('parking', 'parking'),
          /*
           * Mniejszy od punktu wyprawy. Dotad parking byl najwieksza rzecza na
           * mapie, wieksza od celu, po ktory sie tu przyjechalo. Usluga ma sie
           * cofnac o krok: kwadrat mowi, czym jest, rozmiar mowi, ile znaczy.
           */
          'icon-size': ['interpolate', ['linear'], ['zoom'], 11, 0.18, 14, 0.27, 17, 0.36] as never,
          'icon-allow-overlap': true,
        },
      })
      map.addSource('amenities', { type: 'geojson', data: amenityFC(amenityPinsRef.current) as never })
      map.addLayer({
        id: 'amenity-hit',
        type: 'circle',
        source: 'amenities',
        paint: { 'circle-radius': 20, 'circle-color': 'transparent' },
      })
      map.addLayer({
        id: 'amenity-halo',
        type: 'circle',
        source: 'amenities',
        filter: ['==', ['get', 'active'], true] as never,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 13, 14, 17, 26] as never,
          'circle-color': c.poiOpen,
          'circle-opacity': 0.25,
          'circle-stroke-width': 2,
          'circle-stroke-color': c.poiOpen,
        },
      })
      map.addLayer({
        id: 'amenity-pins',
        type: 'symbol',
        source: 'amenities',
        layout: {
          'icon-image': ['get', 'icon'] as never,
          /*
           * MapLibre nie pozwala zagnieździć wyrażenia z 'zoom' w innym, więc
           * zaznaczenie nie może być mnożnikiem na zewnątrz: 'case' siedzi w
           * wartościach interpolacji. Inaczej cała warstwa symboli nie wstaje i
           * na mapie zostają same obwódki bez ikon.
           */
          'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            12,
            ['case', ['boolean', ['get', 'active'], false], 0.27, 0.17],
            15,
            ['case', ['boolean', ['get', 'active'], false], 0.42, 0.26],
            17,
            ['case', ['boolean', ['get', 'active'], false], 0.56, 0.34],
          ] as never,
          'icon-allow-overlap': true,
        },
      })
      // stamps for collected parks: only worth showing when zoomed in
      await addPhotoImages(photoPinsRef.current)
      if (epoch !== styleEpoch.current) return
      map.addSource('walk-photos', { type: 'geojson', data: photoFC(photoPinsRef.current) as never })
      map.addLayer({
        id: 'walk-photo-hit',
        type: 'circle',
        source: 'walk-photos',
        paint: { 'circle-radius': 24, 'circle-color': 'transparent' },
      })
      map.addLayer({
        id: 'walk-photo-pins',
        type: 'symbol',
        source: 'walk-photos',
        layout: {
          'icon-image': ['get', 'icon'] as never,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 13, 0.28, 16, 0.42, 18, 0.5] as never,
          'icon-allow-overlap': true,
        },
      })
      map.addSource('stamp-pins', { type: 'geojson', data: stampFC(stampPinsRef.current) as never })
      map.addLayer({
        id: 'stamp-pin-hit',
        type: 'circle',
        source: 'stamp-pins',
        minzoom: 12.5,
        paint: { 'circle-radius': 24, 'circle-color': 'transparent' },
      })
      map.addLayer({
        id: 'stamp-pins-layer',
        type: 'symbol',
        source: 'stamp-pins',
        minzoom: 12.5,
        layout: {
          'icon-image': ['get', 'icon'] as never,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 12.5, 0.13, 15, 0.22, 17, 0.3] as never,
          // stamps yield to each other and sit above the centroid, so quest
          // pins keep the middle of the park to themselves
          'icon-allow-overlap': false,
          'icon-padding': 10,
          'icon-anchor': 'bottom',
          'icon-offset': [0, -8],
        },
      })
      /*
       * Zasłona reflektora idzie NAD piny pieczątek, żeby cudze parki też gasły,
       * i POD wszystko, co dotyczy parku w reflektorze: jego punkty, udogodnienia,
       * twój ślad i twoja kropka zostają czyste. Kolejność robi pétla niżej.
       */
      map.addSource('focus', { type: 'geojson', data: focusFC(focusRef.current) as never })
      map.addLayer({
        id: 'focus-scrim',
        type: 'fill',
        source: 'focus',
        paint: { 'fill-color': '#05100a', 'fill-opacity': 0.46 },
      })

      // pins must never disappear behind a sticker, nor behind the scrim
      for (const layer of [
        'trail-casing',
        'trail-line',
        'track-casing',
        'track-line',
        'track-gap',
        'me-halo-fill',
        'me-dot',
        'amenity-halo',
        'amenity-pins',
        'parking-pin',
        'quest-poi-dots',
        'walk-photo-pins',
      ]) {
        if (map.getLayer(layer)) map.moveLayer(layer)
      }
      for (const layer of ['amenity-hit', 'parking-hit', 'quest-poi-hit', 'walk-photo-hit']) {
        if (map.getLayer(layer)) map.moveLayer(layer)
      }
      // po przebudowie warstw reflektor musi wrócić tam, gdzie był
      if (focusRef.current) {
        map.setFilter('parks-fill', ['!=', ['get', 'id'], focusRef.current] as never)
        map.setPaintProperty(
          'parks-line',
          'line-width',
          borderWidth(focusRef.current, 2.2, 3.4) as never,
        )
        map.setPaintProperty(
          'parks-line-shared',
          'line-width',
          borderWidth(focusRef.current, 1.5, 2) as never,
        )
      }
      loadedRef.current = true
      syncVisited()
    }

    const applyColors = () => {
      if (!map.getLayer('parks-fill')) return
      const c = readMapColors()
      const fill = ['case', ['boolean', ['feature-state', 'visited'], false], c.visitedFill, c.unvisitedFill]
      map.setPaintProperty('parks-fill', 'fill-color', fill as never)
      map.setPaintProperty('parks-line', 'line-color', borderColor(visitedRef.current, c) as never)
      if (map.getLayer('parks-line-shared'))
        map.setPaintProperty('parks-line-shared', 'line-color', borderColor(visitedRef.current, c) as never)
      map.setPaintProperty('track-line', 'line-color', c.track)
      map.setPaintProperty('track-gap', 'line-color', c.track)
      map.setPaintProperty('me-dot', 'circle-color', c.me)
      map.setPaintProperty('me-dot', 'circle-stroke-color', c.meRing)
      map.setPaintProperty('me-halo-fill', 'fill-color', c.me)
      map.setPaintProperty(
        'quest-poi-dots',
        'circle-color',
        ['case', ['get', 'collected'], c.poiDone, c.poiOpen] as never,
      )
      void addPinImages() // pin badges carry theme colours, so redraw them too
    }
    ;(map as unknown as { __addAppLayers: () => void }).__addAppLayers = addAppLayers

    map.on('load', () => {
      const first = initialStyle.current
      if (first.terrain) map.setTerrain(first.terrain)
      if (first.pitch) map.setPitch(first.pitch)
      void addAppLayers()
    })

    // a gesture made by hand stops the camera from chasing the walker: without
    // this the map keeps yanking itself back while you try to look around
    const handOnMap = (e: { originalEvent?: unknown }) => {
      if (e.originalEvent && followRef.current) cbRef.current.onUserPan()
    }
    map.on('dragstart', handOnMap)
    map.on('zoomstart', handOnMap)
    map.on('rotatestart', handOnMap)

    // one handler, explicit priority: pins beat the park polygon under them
    map.on('click', (e: MapLayerMouseEvent) => {
      const hit = (layer: string) =>
        map.getLayer(layer) ? map.queryRenderedFeatures(e.point, { layers: [layer] })[0] : undefined

      const cb = cbRef.current
      // moving a photo takes over the whole map: the next tap is its new place
      if (placingRef.current) {
        cb.onPlacePhoto([e.lngLat.lng, e.lngLat.lat])
        return
      }
      const photo = hit('walk-photo-hit')
      if (photo?.properties?.photoId) {
        cb.onSelectPhoto(String(photo.properties.photoId))
        return
      }
      const poi = hit('quest-poi-hit')
      if (poi?.properties?.poiId) {
        cb.onSelectPoi(String(poi.properties.poiId))
        return
      }
      const parkingHit = hit('parking-hit')
      if (parkingHit) {
        cb.onSelectParking(String(parkingHit.properties?.id ?? ''))
        return
      }
      const amenity = hit('amenity-hit')
      if (amenity?.properties?.kind) {
        cb.onSelectAmenity(
          amenity.properties.kind as 'food' | 'playground',
          String(amenity.properties.id ?? ''),
        )
        return
      }
      const stamp = hit('stamp-pin-hit')
      if (stamp?.properties?.parkId) {
        cb.onSelectStamp(String(stamp.properties.parkId))
        return
      }
      const ppin = hit('park-pins-layer') ?? hit('park-pins-done') ?? hit('park-dots')
      if (ppin?.properties?.id) {
        cb.onSelect(String(ppin.properties.id))
        return
      }
      const park = hit('parks-fill')
      const parkId =
        (park?.properties as { id?: string } | undefined)?.id ??
        (typeof park?.id === 'string' ? park.id : null)
      if (parkId) {
        cb.onSelect(parkId)
        return
      }
      cb.onClearSelection()
    })
    for (const layer of ['parks-fill', 'park-pins-layer', 'park-pins-done', 'park-dots', 'quest-poi-hit', 'parking-hit', 'amenity-hit', 'stamp-pin-hit', 'walk-photo-hit']) {
      map.on('mouseenter', layer, () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = ''
      })
    }

    const observer = new MutationObserver(applyColors)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', applyColors)

    return () => {
      observer.disconnect()
      mq.removeEventListener('change', applyColors)
      map.remove()
      mapRef.current = null
      loadedRef.current = false
    }
    // map lives for the component's whole life; callbacks reach fresh data via refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || mapStyle.key === currentStyleKey.current) return
    currentStyleKey.current = mapStyle.key
    loadedRef.current = false
    styleEpoch.current += 1
    // a style without terrain does not always clear the old one by itself
    try {
      map.setTerrain(null)
    } catch {
      // no raised ground to put down
    }
    map.setStyle(mapStyle.spec)
    // 'style.load' does not fire after setStyle in MapLibre 5. styledata can
    // even race the OLD style right after the call, so re-add on every
    // styledata-with-loaded-style AND on idle; addAppLayers is idempotent.
    /*
     * NOT gated on isStyleLoaded: that also waits for every tile in view, so on
     * a heavy base style the parks, the pins and the walk were missing for ten
     * seconds or more. Adding layers only needs the parsed style, and an
     * attempt that comes too early cleans up after itself.
     *
     * The ladder matters as much as the events: a style can settle without
     * sending another styledata, and 'idle' only arrives once every tile has
     * landed, so waiting for it put the walk back seconds late.
     */
    /**
     * The flag addSource itself checks before it throws. It goes true as soon as
     * the style is parsed, and unlike isStyleLoaded it does not wait for every
     * tile in view. Measured on the raised map: this is true a full second
     * before MapLibre's own style.load event. If a future version renames it,
     * the check falls back to attempting and letting the catch sort it out.
     */
    const styleReady = () => {
      const st = map.style as unknown as { _loaded?: boolean } | undefined
      return st ? st._loaded !== false : false
    }

    let attempt = 0
    let timer = 0
    let camera = false
    const readd = () => {
      // an attempt before the style is parsed throws, wipes and costs a full
      // set of image uploads for nothing, so wait rather than thrash
      if (styleReady()) {
        if (mapStyle.terrain && !map.getTerrain()) map.setTerrain(mapStyle.terrain)
        if (!camera) {
          camera = true
          // once, and only once: a tilt made by hand afterwards is the walker's
          if (Math.round(map.getPitch()) !== mapStyle.pitch) {
            map.easeTo({ pitch: mapStyle.pitch, duration: 600 })
          }
        }
        ;(map as unknown as { __addAppLayers?: () => void }).__addAppLayers?.()
      }
      if (map.getLayer('parks-fill')) {
        map.off('styledata', readd)
        return
      }
      if (attempt < 14) {
        attempt++
        timer = window.setTimeout(readd, Math.round(60 * Math.pow(1.35, attempt)))
      }
    }
    map.on('styledata', readd)
    map.once('style.load', readd)
    map.once('idle', readd)
    readd()
    return () => {
      window.clearTimeout(timer)
      map.off('styledata', readd)
      map.off('style.load', readd)
      map.off('idle', readd)
    }
  }, [mapStyle])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    for (const f of parksData.features) {
      map.setFeatureState({ source: 'parks', id: f.id }, { visited: visited.has(f.id) })
    }
  }, [visited])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !focus) return
    if (focus.bounds) {
      map.fitBounds(focus.bounds, {
        duration: 1200,
        maxZoom: 17,
        padding: {
          top: 120,
          left: 48,
          right: 48,
          bottom: (focus.bottomPadding ?? 0) + 48,
        },
      })
      return
    }
    map.flyTo({
      center: focus.center,
      zoom: focus.zoom ?? zoomForArea(focus.areaHa ?? 20),
      duration: 1200,
      padding: { top: 0, left: 0, right: 0, bottom: focus.bottomPadding ?? 0 },
    })
  }, [focus])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    ;(map.getSource('quest-pois') as { setData: (d: unknown) => void } | undefined)?.setData(questFC(quest))
  }, [quest])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    ;(map.getSource('trail') as { setData: (d: unknown) => void } | undefined)?.setData(trailFC(trail))
    // kolor czytamy tak samo jak przy budowie stylu: szlak znakowany ma swoj
    if (map.getLayer('trail-line'))
      map.setPaintProperty('trail-line', 'line-color', trail?.ink ?? readMapColors().trail)
  }, [trail])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    ;(map.getSource('track') as { setData: (d: unknown) => void } | undefined)?.setData(trackFC(track))
  }, [track])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    ;(map.getSource('me') as { setData: (d: unknown) => void } | undefined)?.setData(meFC(me))
    ;(map.getSource('me-halo') as { setData: (d: unknown) => void } | undefined)?.setData(meHaloFC(me))
    if (!me || !followMe) return
    // easeTo, not flyTo: a walk moves a few metres at a time and flying zooms out
    map.easeTo({
      center: me.coords,
      zoom: Math.max(map.getZoom(), 16.2),
      duration: 800,
      padding: { top: 0, left: 0, right: 0, bottom: 140 },
    })
  }, [me, followMe])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    ;(map.getSource('parking') as { setData: (d: unknown) => void } | undefined)?.setData(parkingFC(parking))
  }, [parking])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current || !map.getLayer('stamp-pins-layer')) return
    const filter = hideStampFor ? ['!=', ['get', 'parkId'], hideStampFor] : null
    map.setFilter('stamp-pins-layer', filter as never)
    map.setFilter('stamp-pin-hit', filter as never)
  }, [hideStampFor])

  /*
   * Reflektor: zasłona bierze kształt dziury z wybranego parku, park traci
   * wypełnienie (chodzi o to, żeby zobaczyć, co jest w środku) i dostaje
   * najgrubszą linię, bo po zdjęciu wypełnienia zostaje mu tylko granica.
   */
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current || !map.getSource('focus')) return
    ;(map.getSource('focus') as unknown as { setData: (d: unknown) => void }).setData(
      focusFC(focusId ?? null),
    )
    if (!map.getLayer('parks-fill')) return
    /*
     * ['get', 'id'], nie ['id']. Wyrazenie ['id'] czyta identyfikator kafla, a
     * promoteId dziala tam tylko dla feature-state, wiec filtr nigdy nie
     * wykluczal wybranego parku i jego biale wypelnienie zostawalo na mapie.
     * Wlasnosc `id` jest w kazdym obiekcie parks.json, wiec ta droga jest pewna.
     */
    map.setFilter('parks-fill', focusId ? (['!=', ['get', 'id'], focusId] as never) : null)
    map.setPaintProperty('parks-line', 'line-width', borderWidth(focusId ?? null, 2.2, 3.4) as never)
    if (map.getLayer('parks-line-shared'))
      map.setPaintProperty(
        'parks-line-shared',
        'line-width',
        borderWidth(focusId ?? null, 1.5, 2) as never,
      )
    /*
     * W reflektorze inne parki tracą wypełnienie prawie do zera. Zostawione
     * świeciło jasną plamą przez zasłonę i wyglądało jak brud na mapie, a
     * sąsiad z granicą i tak jest widoczny linią.
     */
    const sat = currentStyleKey.current.startsWith('satellite')
    map.setPaintProperty(
      'parks-fill',
      'fill-opacity',
      focusId ? (sat ? 0.1 : 0.18) : sat ? 0.36 : 0.6,
    )
  }, [focusId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    ;(map.getSource('amenities') as { setData: (d: unknown) => void } | undefined)?.setData(
      amenityFC(amenityPins, activeAmenityId),
    )
  }, [amenityPins, activeAmenityId])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    const withImages = map as unknown as { __addPhotoImages?: (p: MarkPin[]) => Promise<void> }
    void withImages.__addPhotoImages?.(photoPins).then(() => {
      ;(map.getSource('walk-photos') as { setData: (d: unknown) => void } | undefined)?.setData(
        photoFC(photoPins),
      )
    })
  }, [photoPins])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    const withImages = map as unknown as { __addStampImages?: (p: StampPin[]) => Promise<void> }
    void withImages.__addStampImages?.(stampPins).then(() => {
      ;(map.getSource('stamp-pins') as { setData: (d: unknown) => void } | undefined)?.setData(
        stampFC(stampPins),
      )
    })
  }, [stampPins])

  return <div ref={containerRef} className="app-map" />
}
