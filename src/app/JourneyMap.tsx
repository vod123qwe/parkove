import { useEffect, useRef } from 'react'
import { Map as MapGL } from 'maplibre-gl'
import type { MapLayerMouseEvent } from 'maplibre-gl'
import { trackSegments } from './geo'
import type { Pt } from './geo'
import { buildPhotoImage, buildPinImages, pinColors, pinImageId } from './pins'
import { resolveMapStyle, getMapStyle } from './data/mapstyles'
import type { WalkMark } from './photos'
import type { QuestPoi } from './data/quests'

/**
 * The map of a walk that already happened: the path, the points it collected
 * and the things left along it. Its own instance on purpose, because the walk
 * history is a screen of its own and must not disturb the live map.
 */
export function JourneyMap({
  track,
  points,
  collected,
  marks,
  onSelectMark,
  placing = false,
  onPlace,
  bottomPadding = 48,
}: {
  track: Pt[]
  points: QuestPoi[]
  collected: Set<string>
  marks: Array<WalkMark & { url?: string }>
  onSelectMark: (id: string) => void
  /** while moving a pin, the next tap on this map is its new home */
  placing?: boolean
  onPlace?: (coords: Pt) => void
  /** room the sheet takes at the bottom, so the whole route stays visible */
  bottomPadding?: number
}) {
  const holder = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapGL | null>(null)
  const cb = useRef({ onSelectMark, onPlace, placing })
  cb.current = { onSelectMark, onPlace, placing }
  const data = useRef({ track, points, collected, marks })
  data.current = { track, points, collected, marks }
  const padRef = useRef(bottomPadding)
  padRef.current = bottomPadding

  useEffect(() => {
    if (!holder.current) return
    const map = new MapGL({
      container: holder.current,
      /*
       * A walk in the journal is a still picture: the flat photograph is enough
       * and the raised version would pull elevation tiles for no gain here.
       * Płaskim odpowiednikiem rzeźby terenu jest ortofotomapa, nie satelita
       * Esri: to ma być to samo zdjęcie, tylko położone.
       */
      style: resolveMapStyle(getMapStyle() === 'satellite-3d' ? 'ortho' : getMapStyle()).spec,
      center: track[0] ?? [19.9445, 50.0555],
      zoom: 14,
      attributionControl: { compact: true },
      // a small map inside a screen: panning yes, twisting no
      pitchWithRotate: false,
      dragRotate: false,
    })
    mapRef.current = map

    const draw = async () => {
      const { track: line, points: pois, collected: got, marks: things } = data.current
      const colors = pinColors()
      for (const [id, img] of await buildPinImages(colors)) {
        if (!map.hasImage(id)) map.addImage(id, img)
      }
      for (const m of things) {
        if (m.kind !== 'photo' || !m.blob) continue
        const id = `photo-${m.id}`
        if (map.hasImage(id)) continue
        try {
          map.addImage(id, await buildPhotoImage(m.blob, colors.surface))
        } catch {
          // an unreadable picture just gets no pin
        }
      }

      map.addSource('j-track', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: trackSegments(line)
            .filter((seg) => seg.length >= 2)
            .map((seg) => ({
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: seg },
            })),
        } as never,
      })
      /*
       * Ślad w limonce ze wspomnienia (--trail-edge), bez obwódki.
       *
       * Był w --content-accent, czyli w tym samym ciemnym zielonym, co tło
       * przycisku, i na ortofotomapie lasu ginął. Pierwszą próbą była biała
       * otoczka, jak na mapie głównej, ale Jarek wolał sam kolor, i ma rację:
       * limonka jest jaśniejsza od wszystkiego, na czym może leżeć, więc nie
       * potrzebuje podkładki, a ekran jest wtedy o jedną warstwę czystszy.
       *
       * Na mapie głównej ten kolor należy do szlaku, więc ślad musi się tam od
       * niego różnić. Tutaj żadnego szlaku nie ma, jest jedna linia i to jest
       * przebyta droga, dokładnie jak we wspomnieniu.
       */
      map.addLayer({
        id: 'j-track-line',
        type: 'line',
        source: 'j-track',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': colors.trailEdge, 'line-width': 4, 'line-opacity': 1 },
      })

      /*
       * Złota kropka na starcie, tym samym językiem, co miniatura na liście
       * wypraw: „tu się zaczęło".
       *
       * Metę odpuszczamy świadomie. Po pierwsze większość tych wypraw to pętle,
       * więc koniec leżałby na starcie i nie mówiłby nic. Po drugie biała kropka
       * obok zielonych pinów czyta się jak jeszcze jeden pin, a na tej mapie
       * pinów już jest dość.
       */
      if (line.length > 1) {
        map.addSource('j-start', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'Point', coordinates: line[0] },
          } as never,
        })
        map.addLayer({
          id: 'j-start-dot',
          type: 'circle',
          source: 'j-start',
          paint: {
            'circle-radius': 5,
            'circle-color': colors.gold,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
          },
        })
      }

      map.addSource('j-pois', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: pois.map((p) => ({
            type: 'Feature',
            properties: { icon: pinImageId(p.category, got.has(p.id) ? 'done' : 'open') },
            geometry: { type: 'Point', coordinates: p.coords },
          })),
        } as never,
      })
      map.addLayer({
        id: 'j-poi-pins',
        type: 'symbol',
        source: 'j-pois',
        layout: {
          'icon-image': ['get', 'icon'] as never,
          'icon-size': 0.34,
          'icon-allow-overlap': true,
        },
      })

      map.addSource('j-marks', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: things
            .filter((m) => m.coords)
            .map((m) => ({
              type: 'Feature',
              properties: {
                markId: m.id,
                icon: m.kind === 'photo' ? `photo-${m.id}` : pinImageId(m.kind, m.kind),
              },
              geometry: { type: 'Point', coordinates: m.coords as Pt },
            })),
        } as never,
      })
      map.addLayer({
        id: 'j-mark-hit',
        type: 'circle',
        source: 'j-marks',
        paint: { 'circle-radius': 22, 'circle-color': 'transparent' },
      })
      map.addLayer({
        id: 'j-mark-pins',
        type: 'symbol',
        source: 'j-marks',
        layout: {
          'icon-image': ['get', 'icon'] as never,
          'icon-size': 0.42,
          'icon-allow-overlap': true,
        },
      })

      // frame the whole walk, with room for the pins at its edges
      if (line.length > 1) {
        let west = line[0][0]
        let east = west
        let south = line[0][1]
        let north = south
        for (const [lng, lat] of line) {
          west = Math.min(west, lng)
          east = Math.max(east, lng)
          south = Math.min(south, lat)
          north = Math.max(north, lat)
        }
        map.fitBounds(
          [
            [west, south],
            [east, north],
          ],
          {
            padding: { top: 96, left: 40, right: 40, bottom: padRef.current + 24 },
            maxZoom: 17,
            duration: 0,
          },
        )
      } else if (line.length === 1) {
        map.jumpTo({ center: line[0], zoom: 16.5 })
      }
    }

    map.on('load', () => void draw())
    map.on('click', (e: MapLayerMouseEvent) => {
      if (cb.current.placing) {
        cb.current.onPlace?.([e.lngLat.lng, e.lngLat.lat])
        return
      }
      if (!map.getLayer('j-mark-hit')) return
      const hit = map.queryRenderedFeatures(e.point, { layers: ['j-mark-hit'] })[0]
      if (hit?.properties?.markId) cb.current.onSelectMark(String(hit.properties.markId))
    })
    // moving a pin changes the data, so keep a way to refresh it in place
    ;(map as unknown as { __redrawMarks: () => void }).__redrawMarks = () => {
      const things = data.current.marks
      ;(map.getSource('j-marks') as { setData: (d: unknown) => void } | undefined)?.setData({
        type: 'FeatureCollection',
        features: things
          .filter((m) => m.coords)
          .map((m) => ({
            type: 'Feature',
            properties: {
              markId: m.id,
              icon: m.kind === 'photo' ? `photo-${m.id}` : pinImageId(m.kind, m.kind),
            },
            geometry: { type: 'Point', coordinates: m.coords as Pt },
          })),
      } as never)
    }

    // the screen animates in, so the canvas learns its size a beat later
    const t = window.setTimeout(() => map.resize(), 260)

    return () => {
      window.clearTimeout(t)
      map.remove()
      mapRef.current = null
    }
    // built once per screen: the walk it shows never changes underneath
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // marks move and get deleted while the screen is open
  useEffect(() => {
    const map = mapRef.current as unknown as { __redrawMarks?: () => void } | null
    map?.__redrawMarks?.()
  }, [marks])

  return <div ref={holder} className="journeymap" />
}
