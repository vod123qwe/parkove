import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import maplibregl from 'maplibre-gl'
import { Check, Undo2, X } from 'lucide-react'
import { Button } from '../ds'
import { resolveMapStyle } from './data/mapstyles'
import { PARKING } from './data/parking'
import { amenitiesFor, isFood } from './data/amenities'
import { questForPark } from './data/quests'
import parksData from './data/parks.json'
import { buildMyTrail, myTrailsFor, routeMyTrail, snapToPath } from './customtrail'
import type { RoutedTrip, Stop } from './customtrail'
import { ICONS, iconSvg } from './pins'
import { formatDistance } from './geo'
import { asset } from './assets'

/**
 * Edytor trasy na PEŁNYM EKRANIE.
 *
 * Jarek (2026-08-25): „edycja trasy powinna uruchamiać się chyba w osobnym
 * ekranie, tak żeby mapa była większa i były tylko selektory, ewentualnie
 * dodawanie palcem na mapie punktów albo dodawanie i przenoszenie palcem
 * swoich punktów".
 *
 * Trzy sposoby układania stoją obok siebie: kafle punktów miejsca u dołu,
 * znaczniki na mapie i własne punkty stawiane dotknięciem mapy.
 *
 * Cztery poprawki z pierwszego podejścia, wszystkie z uwag Jarka:
 *
 *  - znaczniki miały gołe kółka („ikonki są nieoczywiste"), więc noszą teraz
 *    tę samą ikonę, co pin miejsca na mapie: pomnik, fale, kubek, litera P;
 *  - wybrany punkt ma PTASZEK w prawym górnym rogu, bo sam kolor nie mówił,
 *    że coś jest na trasie;
 *  - punkty u dołu to KAFLE ze zdjęciem, gdy punkt je ma, bo po zdjęciu
 *    rozpoznaje się miejsce szybciej niż po nazwie;
 *  - własny punkt jest PRZYKLEJANY do najbliższej ścieżki („jeżeli punkt jest
 *    gdzieś, gdzie nie ma ścieżki, to dodaj ścieżkę w najbliższym miejscu,
 *    gdzie jest chodnik"). To zarazem główna przyczyna „trasa się nie
 *    wylicza": punkt na środku trawnika nie ma jak wejść do grafu dróg.
 */

type Feature = {
  id: string
  geometry: { type: string; coordinates: unknown }
  properties: { center: [number, number]; name: string }
}
const FEATURES = (parksData as unknown as { features: Feature[] }).features

/** klucz ikony przystanku: kategoria punktu wyprawy albo rodzaj udogodnienia */
const iconKeyFor = (s: Stop): keyof typeof ICONS => {
  if (s.icon && s.icon in ICONS) return s.icon as keyof typeof ICONS
  if (s.kind === 'parking') return 'parking'
  if (s.kind === 'food') return 'food'
  if (s.kind === 'play') return 'play'
  return 'stamp'
}

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
      out.push({
        id: poi.id,
        name: poi.name,
        coords: poi.coords,
        kind: 'poi',
        icon: poi.category,
        photo: poi.photo,
      })
    for (const p of PARKING[parkId] ?? [])
      out.push({ id: `park-${p.name}`, name: p.name, coords: p.coords, kind: 'parking' })
    for (const a of amenitiesFor(parkId))
      out.push({
        id: a.id,
        name: a.name,
        coords: a.coords,
        kind: isFood(a.kind) ? 'food' : 'play',
      })
    return out
  }, [parkId])

  const [picked, setPicked] = useState<Set<string>>(() => new Set(initialStops))
  const [own, setOwn] = useState<Array<{ id: string; coords: [number, number] }>>([])
  const [trip, setTrip] = useState<RoutedTrip | null>(null)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const run = useRef(0)
  const ownSeq = useRef(0)

  const toggle = (id: string) =>
    setPicked((was) => {
      const next = new Set(was)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  /*
   * Nowy własny punkt najpierw ląduje tam, gdzie dotknąłeś, a potem przeskakuje
   * na najbliższą ścieżkę. Kolejność ma znaczenie: pytanie do routera trwa
   * chwilę, a znacznik ma pojawić się natychmiast.
   */
  const addOwn = async (at: [number, number]) => {
    ownSeq.current += 1
    const id = `own-${ownSeq.current}`
    setOwn((was) => [...was, { id, coords: at }])
    const on = await snapToPath(at)
    if (!on) {
      setNote('Nie znalazłem ścieżki w pobliżu, punkt został tam, gdzie dotknąłeś')
      return
    }
    const moved = Math.round(Math.hypot((on[0] - at[0]) * 71500, (on[1] - at[1]) * 111300))
    setOwn((was) => was.map((o) => (o.id === id ? { ...o, coords: on } : o)))
    if (moved > 12) setNote(`Punkt przyklejony do ścieżki, ${moved} m dalej`)
  }

  const stops = useMemo<Stop[]>(
    () => [
      ...items.filter((i) => picked.has(i.id)),
      ...own.map((o, i) => ({
        id: o.id,
        name: `Twój punkt ${i + 1}`,
        coords: o.coords,
        kind: 'poi' as const,
      })),
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
    /*
     * Scroll ZOOMUJE mape, jak wszedzie indziej (Jarek: "zostaw scroll jak
     * byl wczesniej"). Blokowalem go, gdy szukalem powodu blednych pozycji
     * znacznikow, ale powod byl inny: nasza regula CSS odbierala znacznikom
     * pozycjonowanie absolutne (docs/trails.md). Skoro to naprawione, mapa
     * moze zachowywac sie normalnie.
     *
     * Dwuklik dalej NIE zoomuje: sluzy do usuwania wlasnego punktu, a jedno
     * dotkniecie nie powinno robic dwoch rzeczy naraz.
     */
    map.doubleClickZoom.disable()
    mapRef.current = map
    if (import.meta.env.DEV) (window as unknown as { __pkEditMap?: maplibregl.Map }).__pkEditMap = map

    map.on('load', () => {
      /* styl niesie własną kamerę, więc kadr miejsca wymuszamy po załadowaniu */
      if (f) {
        map.addSource('park', {
          type: 'geojson',
          data: { type: 'Feature', geometry: f.geometry, properties: {} } as never,
        })
        map.addLayer({
          id: 'park-fill',
          type: 'fill',
          source: 'park',
          paint: { 'fill-color': '#7ce93f', 'fill-opacity': 0.1 },
        })
        map.addLayer({
          id: 'park-line',
          type: 'line',
          source: 'park',
          paint: { 'line-color': '#7ce93f', 'line-width': 2, 'line-opacity': 0.8 },
        })
        const b = new maplibregl.LngLatBounds()
        const rings = (
          f.geometry.type === 'Polygon'
            ? (f.geometry.coordinates as number[][][])
            : (f.geometry.coordinates as number[][][][]).flat()
        ) as number[][][]
        for (const ring of rings) for (const c of ring) b.extend(c as [number, number])
        map.fitBounds(b, { padding: 48, duration: 0 })
      }
      map.addSource('draft', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] } as never,
      })
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

    /* dotknięcie mapy dokłada własny punkt; znacznik jest elementem DOM, więc
       dotknięcie znacznika nie dochodzi tutaj i nie tworzy punktu przy punkcie */
    map.on('click', (e) => void addOwn([e.lngLat.lng, e.lngLat.lat]))

    /*
     * Przeliczenie rozmiaru: raz po pierwszej klatce (kadr jest już pewny) i
     * potem przy każdej zmianie wysokości kontenera. Bez tego znaczniki
     * siedzą obok swoich miejsc, gdy kontener zmierzył się w innym stanie
     * (animacja, pasek adresu telefonu, klawiatura).
     */
    const bump = () => map.resize()
    requestAnimationFrame(bump)
    const ro = new ResizeObserver(bump)
    ro.observe(el)
    window.addEventListener('orientationchange', bump)

    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', bump)
      for (const m of markers.current) m.remove()
      markers.current = []
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkId])

  /* --------------------------------------------------- znaczniki na mapie */
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
      dot.innerHTML =
        iconSvg(iconKeyFor(it), 15) +
        (on ? '<span class="tedit__tick" aria-hidden="true">✓</span>' : '')
      dot.onclick = (ev) => {
        ev.stopPropagation()
        toggle(it.id)
      }
      markers.current.push(new maplibregl.Marker({ element: dot, anchor: 'center' }).setLngLat(it.coords).addTo(map))
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
       * Usuwanie na DWA dotknięcia, nie jedno. Przeciąganie i tapnięcie
       * zaczynają się identycznie, więc pojedynczy klik kasowałby punkt za
       * każdym razem, gdy palec drgnie przy przenoszeniu.
       */
      dot.ondblclick = (ev) => {
        ev.stopPropagation()
        setOwn((was) => was.filter((x) => x.id !== o.id))
      }
      dot.onclick = (ev) => ev.stopPropagation()
      const marker = new maplibregl.Marker({ element: dot, draggable: true, anchor: 'center' })
        .setLngLat(o.coords)
        .addTo(map)
      marker.on('dragend', () => {
        const at = marker.getLngLat()
        const raw: [number, number] = [at.lng, at.lat]
        setOwn((was) => was.map((x) => (x.id === o.id ? { ...x, coords: raw } : x)))
        /* po przeniesieniu znów szukamy ścieżki: punkt ma leżeć na alejce */
        void snapToPath(raw).then((on) => {
          if (!on) return
          setOwn((was) => was.map((x) => (x.id === o.id ? { ...x, coords: on } : x)))
        })
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
    const src = mapRef.current?.getSource('draft') as { setData: (d: unknown) => void } | undefined
    if (!src) return
    src.setData(
      trip
        ? {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: trip.line },
            properties: {},
          }
        : { type: 'FeatureCollection', features: [] },
    )
  }, [trip])

  /*
   * Strona pod edytorem stoi. Bez tego dotknięcie poza mapą przewijało listę
   * miejsc pod spodem, a na telefonie potrafiło przesunąć cały kadr razem z
   * paskiem adresu.
   */
  useEffect(() => {
    const was = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = was
    }
  }, [])

  /* komunikat o przyklejeniu gaśnie sam, żeby nie wisiał nad kartą */
  useEffect(() => {
    if (!note) return
    const t = window.setTimeout(() => setNote(null), 2600)
    return () => window.clearTimeout(t)
  }, [note])

  const save = async () => {
    if (!trip) return
    setSaving(true)
    const out = await buildMyTrail(
      parkId,
      stops,
      `Moja trasa ${myTrailsFor(parkId).length + 1}`,
      trip,
    )
    setSaving(false)
    if ('error' in out) {
      setProblem(out.error)
      return
    }
    onSaved(out.trail.id)
  }

  /*
   * PORTAL do body, nie dziecko modalu.
   *
   * Edytor otwiera sie z modalu Szlak i pierwsza wersja renderowala sie w
   * jego drzewie. Skutek byl taki, ze dotkniecie mapy trafialo w zaslone
   * modalu, modal sie zamykal i zabieral edytor ze soba. To ta sama lekcja,
   * co przy .jscreen w app.css: wlasny kontekst stosu rodzica sprawia, ze
   * numer z-index dziecka nie znaczy tego, co myslisz. Pelny ekran musi
   * wisiec na body.
   */
  return createPortal(
    <div className="tedit">
      <div className="tedit__map" ref={box} />
      <div className="tedit__top">
        <button className="tedit__back pk-press" aria-label="Zamknij edytor" onClick={onClose}>
          <X size={18} />
        </button>
        <p className="t-label tedit__name">{parkName}</p>
      </div>

      {note && (
        <p className="t-caption tedit__note" role="status">
          {note}
        </p>
      )}

      <div className="tedit__card">
        <p className="t-caption tedit__hint">
          Dotknij mapy, żeby dodać swój punkt. Przyklei się do najbliższej ścieżki, przeciągniesz go
          palcem, a dotknięcie dwa razy usuwa.
        </p>
        {/*
          Kafle, nie pigułki (uwaga Jarka): kwadrat ze zdjęciem punktu, gdy
          jakieś ma, i z ikoną rodzaju, gdy nie ma. Po zdjęciu rozpoznaje się
          miejsce szybciej niż po nazwie, a ptaszek w narożniku mówi, że punkt
          jest na trasie.
        */}
        <div className="tedit__tiles" role="group" aria-label="Punkty miejsca">
          {items.map((it) => {
            const on = picked.has(it.id)
            const photo = it.photo ? asset(it.photo) : null
            return (
              <button
                key={it.id}
                className={`tedit__tile pk-press${on ? ' -on' : ''}`}
                aria-pressed={on}
                onClick={() => toggle(it.id)}
              >
                <span
                  className="tedit__thumb"
                  style={photo ? { backgroundImage: `url(${photo})` } : undefined}
                  aria-hidden="true"
                >
                  {!photo && (
                    <span
                      className="tedit__thumbicon"
                      dangerouslySetInnerHTML={{ __html: iconSvg(iconKeyFor(it), 20) }}
                    />
                  )}
                </span>
                <span className="tedit__tilename">{it.name}</span>
                {on && (
                  <span className="tedit__tiletick" aria-hidden="true">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
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
                <strong>{formatDistance(trip.m)}</strong> · {trip.min} min · {stops.length}{' '}
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
            <Button
              size="md"
              disabled={!trip || saving}
              icon={<Check size={17} />}
              onClick={() => void save()}
            >
              {saving ? 'Zapisuję…' : 'Zapisz trasę'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
