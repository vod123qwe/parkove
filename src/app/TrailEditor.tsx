import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { Check, Undo2, X } from 'lucide-react'
import { Button } from '../ds'
import { resolveMapStyle } from './data/mapstyles'
import { PARKING } from './data/parking'
import { amenitiesFor, isFood } from './data/amenities'
import { questForPark } from './data/quests'
import parksData from './data/parks.json'
import { buildMyTrail, myTrailsFor, routeMyTrail } from './customtrail'
import type { RoutedTrip, Stop } from './customtrail'
import { formatDistance } from './geo'

/**
 * Edytor trasy na PEŁNYM EKRANIE.
 *
 * Jarek (2026-08-25): „edycja trasy powinna uruchamiać się chyba w osobnym
 * ekranie, tak żeby mapa była większa i były tylko selektory, ewentualnie
 * dodawanie palcem na mapie punktów albo dodawanie i przenoszenie palcem
 * swoich punktów".
 *
 * Dlatego to nie jest arkusz w arkuszu, a ekran: mapa bierze wszystko poza
 * paskiem u góry i kartą u dołu. Trzy sposoby układania stoją obok siebie:
 *
 *   1. pigułki punktów miejsca (punkty wyprawy, parkingi, placyki, kawa),
 *   2. dotknięcie mapy dokłada WŁASNY punkt tam, gdzie stuknąłeś,
 *   3. własny punkt można przeciągnąć palcem albo usunąć dotknięciem.
 *
 * Trasa liczy się na żywo, tym samym routerem, co gotowe warianty: każda
 * zmiana czeka 600 ms i pyta raz, a spóźniona odpowiedź starszego pytania
 * wypada po numerze biegu.
 */

type Feature = { id: string; geometry: { type: string; coordinates: unknown }; properties: { center: [number, number]; name: string } }
const FEATURES = (parksData as unknown as { features: Feature[] }).features

export function TrailEditor({
  parkId,
  parkName,
  initialStops,
  onClose,
  onSaved,
}: {
  parkId: string
  parkName: string
  /** przystanki trasy, którą edytujesz (id punktów miejsca) */
  initialStops: string[]
  onClose: () => void
  onSaved: (trailId: string) => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markers = useRef<maplibregl.Marker[]>([])

  /** wszystko, co w tym miejscu da się postawić na trasie */
  const items = useMemo<Stop[]>(() => {
    const out: Stop[] = []
    for (const poi of questForPark(parkId)?.pois ?? [])
      out.push({ id: poi.id, name: poi.name, coords: poi.coords, kind: 'poi' })
    for (const p of PARKING[parkId] ?? [])
      out.push({ id: `park-${p.name}`, name: p.name, coords: p.coords, kind: 'parking' })
    for (const a of amenitiesFor(parkId))
      out.push({ id: a.id, name: a.name, coords: a.coords, kind: isFood(a.kind) ? 'food' : 'play' })
    return out
  }, [parkId])

  const [picked, setPicked] = useState<Set<string>>(() => new Set(initialStops))
  const [own, setOwn] = useState<Array<{ id: string; coords: [number, number] }>>([])
  const [trip, setTrip] = useState<RoutedTrip | null>(null)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const run = useRef(0)
  const ownSeq = useRef(0)

  const stops = useMemo<Stop[]>(
    () => [
      ...items.filter((i) => picked.has(i.id)),
      ...own.map((o, i) => ({ id: o.id, name: `Twój punkt ${i + 1}`, coords: o.coords, kind: 'poi' as const })),
    ],
    [items, picked, own],
  )

  /* ---------------------------------------------------------------- mapa */
  useEffect(() => {
    const el = box.current
    if (!el || mapRef.current) return
    const f = FEATURES.find((x) => x.id === parkId)
    const style = resolveMapStyle('satellite')
    const map = new maplibregl.Map({
      container: el,
      style: style.spec,
      center: f?.properties.center ?? [19.94, 50.06],
      zoom: 15,
      pitch: 0,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    })
    map.touchZoomRotate.disableRotation()
    mapRef.current = map

    map.on('load', () => {
      /* styl niesie własną kamerę, więc kadr miejsca wymuszamy po załadowaniu */
      if (f) {
        map.jumpTo({ center: f.properties.center, zoom: 15 })
        map.addSource('park', { type: 'geojson', data: { type: 'Feature', geometry: f.geometry, properties: {} } as never })
        map.addLayer({ id: 'park-fill', type: 'fill', source: 'park', paint: { 'fill-color': '#7ce93f', 'fill-opacity': 0.12 } })
        map.addLayer({ id: 'park-line', type: 'line', source: 'park', paint: { 'line-color': '#7ce93f', 'line-width': 2, 'line-opacity': 0.8 } })
        const b = new maplibregl.LngLatBounds()
        const rings = (f.geometry.type === 'Polygon'
          ? (f.geometry.coordinates as number[][][])
          : (f.geometry.coordinates as number[][][][]).flat()) as number[][][]
        for (const ring of rings) for (const c of ring) b.extend(c as [number, number])
        map.fitBounds(b, { padding: 46, duration: 0 })
      }
      map.addSource('draft', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } as never })
      map.addLayer({
        id: 'draft-casing',
        type: 'line',
        source: 'draft',
        paint: { 'line-color': '#12290c', 'line-width': 7, 'line-opacity': 0.55 },
      })
      map.addLayer({
        id: 'draft-line',
        type: 'line',
        source: 'draft',
        paint: { 'line-color': '#7ce93f', 'line-width': 3.4 },
      })
    })

    /*
     * Dotknięcie mapy dokłada własny punkt. Marker jest elementem DOM, więc
     * dotknięcie markera NIE dochodzi do mapy i nie tworzy punktu przy punkcie.
     */
    map.on('click', (e) => {
      ownSeq.current += 1
      setOwn((was) => [...was, { id: `own-${ownSeq.current}`, coords: [e.lngLat.lng, e.lngLat.lat] }])
    })

    return () => {
      for (const m of markers.current) m.remove()
      markers.current = []
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkId])

  /* --------------------------------------------------- markery: punkty i własne */
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    for (const m of markers.current) m.remove()
    markers.current = []

    for (const it of items) {
      const on = picked.has(it.id)
      const dot = document.createElement('button')
      dot.className = `tedit__dot -${it.kind}${on ? ' -on' : ''}`
      dot.type = 'button'
      dot.setAttribute('aria-label', `${on ? 'Zdejmij z trasy' : 'Dodaj do trasy'}: ${it.name}`)
      dot.onclick = (ev) => {
        ev.stopPropagation()
        setPicked((was) => {
          const next = new Set(was)
          if (next.has(it.id)) next.delete(it.id)
          else next.add(it.id)
          return next
        })
      }
      markers.current.push(new maplibregl.Marker({ element: dot }).setLngLat(it.coords).addTo(map))
    }

    for (const [i, o] of own.entries()) {
      const dot = document.createElement('button')
      dot.className = 'tedit__dot -own'
      dot.type = 'button'
      dot.textContent = String(i + 1)
      dot.setAttribute(
        'aria-label',
        `Twój punkt ${i + 1}: przeciągnij, żeby przenieść, dotknij dwa razy, żeby usunąć`,
      )
      /*
       * Usuwanie na DWA dotkniecia, nie jedno. Przeciaganie i tapniecie
       * zaczynaja sie identycznie, wiec pojedynczy klik kasowalby punkt za
       * kazdym razem, gdy palec drgnie przy przenoszeniu. Dwa dotkniecia sa
       * jednoznaczne, a od omylkowego usuniecia jest jeszcze Cofnij punkt.
       */
      dot.ondblclick = (ev) => {
        ev.stopPropagation()
        setOwn((was) => was.filter((x) => x.id !== o.id))
      }
      dot.onclick = (ev) => ev.stopPropagation()
      const marker = new maplibregl.Marker({ element: dot, draggable: true }).setLngLat(o.coords).addTo(map)
      marker.on('dragend', () => {
        const at = marker.getLngLat()
        setOwn((was) => was.map((x) => (x.id === o.id ? { ...x, coords: [at.lng, at.lat] } : x)))
      })
      markers.current.push(marker)
    }
  }, [items, picked, own])

  /* ---------------------------------------------------------- trasa na żywo */
  useEffect(() => {
    const mine = ++run.current
    if (stops.length < 2) {
      setTrip(null)
      setBusy(false)
      return
    }
    setBusy(true)
    const timer = window.setTimeout(() => {
      void routeMyTrail(stops).then((out) => {
        if (run.current !== mine) return
        setBusy(false)
        if ('error' in out) {
          setTrip(null)
          setProblem(out.error)
        } else {
          setProblem(null)
          setTrip(out.trip)
        }
      })
    }, 600)
    return () => window.clearTimeout(timer)
  }, [stops])

  /* linia na mapie idzie za trasą */
  useEffect(() => {
    const map = mapRef.current
    const src = map?.getSource('draft') as { setData: (d: unknown) => void } | undefined
    if (!src) return
    src.setData(
      trip
        ? { type: 'Feature', geometry: { type: 'LineString', coordinates: trip.line }, properties: {} }
        : { type: 'FeatureCollection', features: [] },
    )
  }, [trip])

  const save = async () => {
    if (!trip) return
    setSaving(true)
    const out = await buildMyTrail(parkId, stops, `Moja trasa ${myTrailsFor(parkId).length + 1}`, trip)
    setSaving(false)
    if ('error' in out) {
      setProblem(out.error)
      return
    }
    onSaved(out.trail.id)
  }

  const chips = items.filter((i) => i.kind !== 'poi')
  const pois = items.filter((i) => i.kind === 'poi')

  return (
    <div className="tedit">
      <div className="tedit__map" ref={box} />
      <div className="tedit__top">
        <button className="tedit__back pk-press" aria-label="Zamknij edytor" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="t-label tedit__name">{parkName}</p>
      </div>

      <div className="tedit__card">
        <p className="t-caption tedit__hint">
          Dotknij mapy, żeby dodać swój punkt. Przeciągnij go palcem, żeby przenieść, a dotknij
          dwa razy, żeby usunąć.
        </p>
        <div className="tedit__chips" role="group" aria-label="Punkty miejsca">
          {[...pois, ...chips].map((it) => {
            const on = picked.has(it.id)
            return (
              <button
                key={it.id}
                className={`tedit__chip pk-press${on ? ' -on' : ''}`}
                aria-pressed={on}
                onClick={() =>
                  setPicked((was) => {
                    const next = new Set(was)
                    if (next.has(it.id)) next.delete(it.id)
                    else next.add(it.id)
                    return next
                  })
                }
              >
                {it.name}
              </button>
            )
          })}
        </div>
        <div className="tedit__foot">
          <p className="t-body-sm tedit__sum">
            {stops.length < 2 ? (
              'Zaznacz co najmniej dwa punkty'
            ) : trip ? (
              <>
                <strong>{formatDistance(trip.m)}</strong> · {trip.min} min ·{' '}
                {stops.length}{' '}
                {stops.length === 1 ? 'przystanek' : stops.length < 5 ? 'przystanki' : 'przystanków'}
                {busy && ' · liczę…'}
              </>
            ) : busy ? (
              'Liczę trasę…'
            ) : (
              (problem ?? 'Nie udało się policzyć trasy')
            )}
          </p>
          <div className="tedit__acts">
            {own.length > 0 && (
              <button
                className="tedit__clear pk-press"
                aria-label="Cofnij ostatni własny punkt"
                onClick={() => setOwn((was) => was.slice(0, -1))}
              >
                <Undo2 size={15} /> Cofnij punkt
              </button>
            )}
            <Button size="md" disabled={!trip || saving} icon={<Check size={17} />} onClick={() => void save()}>
              {saving ? 'Zapisuję…' : 'Zapisz trasę'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
