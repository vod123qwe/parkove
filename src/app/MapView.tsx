import { useEffect, useRef } from 'react'
import { Map as MapGL } from 'maplibre-gl'
import type { MapLayerMouseEvent, StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import parksData from './data/parks.json'
import { circlePolygon, trackSegments } from './geo'
import { buildPhotoImage, buildPinImages, pinImageId } from './pins'
import { asset } from './assets'

const KRAKOW: [number, number] = [19.9445, 50.0555]

export type MapFocus = {
  center: [number, number]
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

/** a picture taken on a walk, pinned where the phone stood */
export type PhotoPin = { id: string; coords: [number, number]; blob: Blob }

/** practical spots around a park: coffee and playgrounds */
export type AmenityPin = {
  id: string
  kind: 'food' | 'playground'
  coords: [number, number]
}

type Props = {
  visited: Set<string>
  onSelect: (id: string) => void
  onSelectPoi: (poiId: string) => void
  /** suggested parking pin of the selected park */
  parking: { coords: [number, number]; active?: boolean } | null
  onSelectParking: () => void
  /** tap on empty map: close peeks and selection */
  onClearSelection: () => void
  focus: MapFocus | null
  /** quest points of the selected or walked park, null otherwise */
  quest: QuestOverlay | null
  /** active expedition GPS track */
  track: Array<[number, number]> | null
  /** live position during a walk: dot, accuracy halo and heading */
  me: { coords: [number, number]; accuracy: number; course: number | null } | null
  /** camera rides along with the dot until the map is touched */
  followMe: boolean
  /** a pan, zoom or rotate made by hand hands the camera back to the walker */
  onUserPan: () => void
  /** resolved style; key changes re-add the app layers on top of the new style */
  mapStyle: { key: string; spec: string | StyleSpecification }
  /** stamp pins for collected parks, shown when zoomed in */
  stampPins: StampPin[]
  onSelectStamp: (parkId: string) => void
  /** food and playground spots of the selected park */
  amenityPins: AmenityPin[]
  onSelectAmenity: (kind: 'food' | 'playground') => void
  /** stamp of this park steps aside so its quest pins stay readable */
  hideStampFor: string | null
  /** photos of the current walk, drawn as round thumbnails */
  photoPins: PhotoPin[]
  onSelectPhoto: (id: string) => void
  /** while moving a photo, the next tap on the map is its new home */
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
    poiDone: v('--bg-gold'),
    poiOpen: v('--bg-surface'),
    poiStroke: v('--map-visited-stroke'),
    me: v('--content-info'),
    meRing: v('--bg-surface'),
  }
}

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

const amenityFC = (pins: AmenityPin[]) => ({
  type: 'FeatureCollection' as const,
  features: pins.map((p) => ({
    type: 'Feature' as const,
    properties: { kind: p.kind, icon: pinImageId(p.kind, p.kind) },
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

const parkingFC = (parking: { coords: [number, number]; active?: boolean } | null) => ({
  type: 'FeatureCollection' as const,
  features: parking
    ? [{ type: 'Feature' as const, properties: { label: 'P', active: !!parking.active }, geometry: { type: 'Point' as const, coordinates: parking.coords } }]
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

const photoFC = (pins: PhotoPin[]) => ({
  type: 'FeatureCollection' as const,
  features: pins.map((p) => ({
    type: 'Feature' as const,
    properties: { photoId: p.id, icon: `photo-${p.id}` },
    geometry: { type: 'Point' as const, coordinates: p.coords },
  })),
})

const zoomForArea = (ha: number) => (ha > 150 ? 12.4 : ha > 40 ? 13.2 : ha > 8 ? 14 : 14.8)

export function MapView({
  visited,
  onSelect,
  onSelectPoi,
  parking,
  onSelectParking,
  onClearSelection,
  focus,
  quest,
  track,
  me,
  followMe,
  onUserPan,
  mapStyle,
  stampPins,
  onSelectStamp,
  amenityPins,
  onSelectAmenity,
  hideStampFor,
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
  const trackRef = useRef(track)
  const meRef = useRef(me)
  const followRef = useRef(followMe)
  const parkingRef = useRef(parking)
  const stampPinsRef = useRef(stampPins)
  const amenityPinsRef = useRef(amenityPins)
  const photoPinsRef = useRef(photoPins)
  const placingRef = useRef(placingPhoto)
  // the map handler is registered once, so callbacks must be read fresh
  const cbRef = useRef({ onSelect, onSelectPoi, onSelectParking, onSelectStamp, onClearSelection, onSelectAmenity, onUserPan, onSelectPhoto, onPlacePhoto })
  cbRef.current = { onSelect, onSelectPoi, onSelectParking, onSelectStamp, onClearSelection, onSelectAmenity, onUserPan, onSelectPhoto, onPlacePhoto }
  const initialStyle = useRef(mapStyle)
  const currentStyleKey = useRef(mapStyle.key)
  visitedRef.current = visited
  questRef.current = quest
  trackRef.current = track
  meRef.current = me
  followRef.current = followMe
  parkingRef.current = parking
  stampPinsRef.current = stampPins
  amenityPinsRef.current = amenityPins
  photoPinsRef.current = photoPins
  placingRef.current = placingPhoto

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

    // pin artwork must exist before the symbol layers reference it
    const addPinImages = async () => {
      const cs = getComputedStyle(document.documentElement)
      const v = (n: string) => cs.getPropertyValue(n).trim()
      const images = await buildPinImages({
        surface: v('--bg-surface'),
        accent: v('--map-visited-stroke'),
        accentStrong: v('--content-accent'),
        gold: v('--bg-gold'),
        onGold: v('--content-on-gold'),
        infoSubtle: v('--bg-info-subtle'),
        info: v('--content-info'),
        infoBorder: v('--border-info'),
        foodSubtle: v('--bg-food-subtle'),
        food: v('--content-food'),
        foodBorder: v('--border-food'),
        playSubtle: v('--bg-play-subtle'),
        play: v('--content-play'),
        playBorder: v('--border-play'),
      })
      for (const [id, bmp] of images) {
        if (map.hasImage(id)) map.removeImage(id)
        map.addImage(id, bmp)
      }
    }

    /** stamp artwork per collected park, loaded lazily and ignored when missing */
    const addStampImages = async (pins: StampPin[]) => {
      for (const pin of pins) {
        const id = `stamp-${pin.parkId}`
        if (map.hasImage(id)) continue
        try {
          const res = await fetch(asset(`stamps/${pin.parkId}.png`))
          if (!res.ok) continue
          const bmp = await createImageBitmap(await res.blob())
          if (!map.hasImage(id)) map.addImage(id, bmp)
        } catch {
          // no artwork for this park yet: the pin simply does not render
        }
      }
    }
    ;(map as unknown as { __addStampImages: (p: StampPin[]) => void }).__addStampImages = addStampImages

    const addPhotoImages = async (pins: PhotoPin[]) => {
      const ring = readMapColors().meRing
      for (const pin of pins) {
        const id = `photo-${pin.id}`
        if (map.hasImage(id)) continue
        try {
          map.addImage(id, await buildPhotoImage(pin.blob, ring))
        } catch {
          // an unreadable picture simply gets no pin
        }
      }
    }
    ;(map as unknown as { __addPhotoImages: (p: PhotoPin[]) => Promise<void> }).__addPhotoImages =
      addPhotoImages

    const syncVisited = () => {
      for (const f of parksData.features) {
        map.setFeatureState({ source: 'parks', id: f.id }, { visited: visitedRef.current.has(f.id) })
      }
    }

    // everything Parkove draws on top of the base style; re-run after setStyle
    const addAppLayers = async () => {
      if (map.getSource('parks')) return // already on this style
      await addPinImages()
      await addStampImages(stampPinsRef.current)
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
          'fill-opacity': currentStyleKey.current === 'satellite' ? 0.28 : 0.55,
        },
      })
      map.addLayer({
        id: 'parks-line',
        type: 'line',
        source: 'parks',
        paint: {
          'line-color': ['case', ['boolean', ['feature-state', 'visited'], false], c.visitedStroke, c.unvisitedStroke] as never,
          'line-width': 1.6,
        },
      })
      map.addSource('track', { type: 'geojson', data: trackFC(trackRef.current) as never })
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
          'icon-size': ['interpolate', ['linear'], ['zoom'], 11, 0.24, 14, 0.34, 17, 0.46] as never,
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
        id: 'amenity-pins',
        type: 'symbol',
        source: 'amenities',
        layout: {
          'icon-image': ['get', 'icon'] as never,
          'icon-size': ['interpolate', ['linear'], ['zoom'], 12, 0.2, 15, 0.3, 17, 0.4] as never,
          'icon-allow-overlap': true,
        },
      })
      // stamps for collected parks: only worth showing when zoomed in
      await addPhotoImages(photoPinsRef.current)
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
          'icon-size': ['interpolate', ['linear'], ['zoom'], 13, 0.3, 16, 0.46, 18, 0.55] as never,
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
      // pins must never disappear behind a sticker
      for (const layer of ['amenity-pins', 'parking-pin', 'quest-poi-dots']) {
        if (map.getLayer(layer)) map.moveLayer(layer)
      }
      for (const layer of ['amenity-hit', 'parking-hit', 'quest-poi-hit']) {
        if (map.getLayer(layer)) map.moveLayer(layer)
      }
      loadedRef.current = true
      syncVisited()
    }

    const applyColors = () => {
      if (!map.getLayer('parks-fill')) return
      const c = readMapColors()
      const fill = ['case', ['boolean', ['feature-state', 'visited'], false], c.visitedFill, c.unvisitedFill]
      const stroke = ['case', ['boolean', ['feature-state', 'visited'], false], c.visitedStroke, c.unvisitedStroke]
      map.setPaintProperty('parks-fill', 'fill-color', fill as never)
      map.setPaintProperty('parks-line', 'line-color', stroke as never)
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

    map.on('load', addAppLayers)

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
        cb.onSelectParking()
        return
      }
      const amenity = hit('amenity-hit')
      if (amenity?.properties?.kind) {
        cb.onSelectAmenity(amenity.properties.kind as 'food' | 'playground')
        return
      }
      const stamp = hit('stamp-pin-hit')
      if (stamp?.properties?.parkId) {
        cb.onSelectStamp(String(stamp.properties.parkId))
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
    for (const layer of ['parks-fill', 'quest-poi-hit', 'parking-hit', 'amenity-hit', 'stamp-pin-hit', 'walk-photo-hit']) {
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
    map.setStyle(mapStyle.spec)
    // 'style.load' does not fire after setStyle in MapLibre 5. styledata can
    // even race the OLD style right after the call, so re-add on every
    // styledata-with-loaded-style AND on idle; addAppLayers is idempotent.
    const readd = () => {
      if (!map.isStyleLoaded()) return
      ;(map as unknown as { __addAppLayers?: () => void }).__addAppLayers?.()
      if (map.getLayer('parks-fill')) map.off('styledata', readd)
    }
    map.on('styledata', readd)
    map.once('idle', readd)
    return () => {
      map.off('styledata', readd)
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

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    ;(map.getSource('amenities') as { setData: (d: unknown) => void } | undefined)?.setData(
      amenityFC(amenityPins),
    )
  }, [amenityPins])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    const withImages = map as unknown as { __addPhotoImages?: (p: PhotoPin[]) => Promise<void> }
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
