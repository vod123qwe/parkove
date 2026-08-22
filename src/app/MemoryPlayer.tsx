import { useEffect, useRef, useState } from 'react'
import { Map as MapGL } from 'maplibre-gl'
import { ChevronLeft, Layers } from 'lucide-react'
import type { CSSProperties } from 'react'
import { WavePlayer } from './WavePlayer'
import { MemoryViewer } from './MemoryViewer'
import { PoiModal } from './PoiSheet'
import { REPLAY_LOOKS, replayStyle } from './data/mapstyles'
import type { ReplayLook } from './data/mapstyles'
import { buildTimeline, metresAt, msAtMetres, pointAt, walkedSoFar } from './memory'
import type { Timeline } from './memory'
import { buildPhotoImage, buildPinImages, pinColors, pinImageId } from './pins'
import type { Journey } from './state'
import type { WalkMark } from './photos'
import type { QuestPoi } from './data/quests'
import { bearingDeg, distanceM } from './geo'
import { useDarkChrome } from './screen'

/** how far ahead of the marker a memory counts as "we are passing it" */
const REACH_M = 22
/**
 * Approaching a memory the walk eases off, but only close to it: with points
 * every eighty metres a wide window turned the whole replay into a crawl.
 */
const SLOW_M = 30
/** and it never drops below a third of the speed you asked for */
const SLOW_FLOOR = 0.35
/** and it stands still this long when the memory lands */
/*
 * Chwila nieruchomosci na dojsciu. Wydluzona z 1100, bo teraz w tym samym
 * momencie kamera odjezdza, a odjazd potrzebuje jakichs 700 ms: ma sie zmiescic
 * w ciszy, a nie zaczynac po niej.
 */
const DWELL_MS = 1400
/** the camera aims at a point this far up the route, so it turns before you do */
const LOOKAHEAD_M = 28
/**
 * Wysokosc kamery i ile z niej wolno oddac w rece.
 *
 * Odtwarzanie stoi na 16.6, bo przy tileSize 128 wypada tam dokladnie poziom 19
 * kafli, czyli maksimum, jakie ma Geoportal (patrz docs/map-imagery.md). Szczypta
 * w obie strony ma sens, ale w granicach: to jest kamera prowadzona po trasie, a
 * nie mapa do zwiedzania. Poza tym w gore ostrosc i tak sie konczy, bo od okolo
 * 17.5 MapLibre musi rozciagac kafle poziomu 19.
 */
const BASE_ZOOM = 16.6
const ZOOM_SPAN = 1.5
/** how long the camera takes to settle on a new heading, in ms */
const TURN_TAU = 420
/**
 * Predkosc, i czemu wlasnie tyle.
 *
 * Odpowiedz jest liczona od tego, ile ma trwac seans: poltoragodzinny marsz w
 * domyslnym tempie ma zmiescic sie w okolo dwoch minutach. 5400 s przez 120 s to
 * 45 razy szybciej, a przepustnica jest kwadratowa, wiec polowa skoku daje
 * czwarta czesc maksimum. Stad 180.
 *
 * Domyslne tempo siedzi w POLOWIE skoku, nie na koncu, i to jest cala rzecz:
 * raczka w spoczynku stoi tak, ze widac, ze mozna i szybciej, i wolniej.
 */
const MAX_RATE = 180
/** gdzie parkuje raczka, gdy wyprawa jedzie sama */
const CRUISE = 0.5
/**
 * Przepustnica stoi teraz pionowo na prawej krawedzi, a nie lukiem na dole.
 * Powod jest o miejsce: dol nalezy do tresci, a suwak na krawedzi zajmuje pasek
 * szerokosci kciuka. Skok 118 px w kazda strone to zasieg kciuka bez
 * przekladania telefonu; srodek toru i podzialka licza sie w jednostkach SVG.
 */
const DIAL_THROW = 118
const THR_MID = 120
const THR_TRAVEL = 96
/** po tylu ms bez dotkniecia sterowanie gasnie, jesli cos sie dzieje */
const IDLE_HIDE_MS = 2500
/**
 * Karta wspomnienia schodzi po przejsciu tylu metrow dalszej drogi, a nie po
 * ilu sekundach: predkosc jest zmienna, wiec sekundy dawalyby raz mrugniecie,
 * raz wiecznosc. Minimum czasowe jest po to, zeby na pelnym gazie nie migala.
 *
 * Liczby wzialem z pomiaru, nie z powietrza. W domyslnym tempie wyprawa idzie
 * jakies 40 m na sekunde ekranu, wiec 140 m to 3,5 s, a podloga 4,5 s daje na
 * kazde wspomnienie tyle, ile trzeba na jedno spojrzenie. Przy pierwszej probie
 * bylo 60 m i 2,5 s, i karta uciekala, zanim dalo sie przeczytac nazwe.
 *
 * Gdy stoisz, karta zostaje: metry przestaja rosnac, wiec warunek nie zachodzi.
 */
const CARD_CLEAR_M = 140
const CARD_MIN_MS = 4500
/**
 * Gdzie w kadrze stoi chodzacy, jako czesc wysokosci ekranu.
 *
 * Padding od gory podnosi punkt zainteresowania: przy 0.34 chodzacy siedzi na
 * 67 procentach wysokosci, czyli nisko, i wtedy kadr jest droga przed toba, a
 * nie lusterkiem. Przy wspomnieniu przechodzimy na padding od dolu i chodzacy
 * wedruje na 29 procent: kamera odjezdza, swiat opada, robi sie miejsce na
 * karte. To ta sama zmiana rejestru, co "ide, staje, patrze".
 */
const WALK_PAD = 0.34
const READ_PAD = 0.42
/** jak szybko kadr przechodzi miedzy chodzeniem i czytaniem, w ms */
const PAD_TAU = 260
/**
 * Rozejrzenie sie, palcem po mapie, w granicach.
 *
 * Powod jest praktyczny, nie estetyczny: Jarek pisze, ze "czasem gdzies postac
 * wychodzi za gore i nie widac". Kamera jedzie po kursie trasy, a w dolinie z
 * pitchem 58 grzbiet potrafi ja zaslonic. Poziomo obracasz sie wokol chodzacego,
 * pionowo podnosisz i opuszczasz kamere, i to drugie rozwiazuje zaslonienie
 * skuteczniej, bo z gory nie zaslania nic.
 *
 * Kazdy gest wybiera swoja os na pierwszym ruchu i przy niej zostaje: dwie osie
 * naraz w jednym przeciagnieciu robia sie papkowate.
 */
const SPIN_MAX = 60
const SPIN_PER_PX = 0.3
const TILT_BASE = 58
const TILT_MIN = 40
/*
 * Gora to 60, bo tyle daje MapLibre bez podnoszenia maxPitch, i nie ma o co
 * walczyc: przed zaslonieniem ratuje kierunek W DOL, czyli bardziej z gory.
 * Wyzszy kat to wiekszy dramatyzm i wiekszy koszt, a nie lepsza widocznosc.
 */
const TILT_MAX = 60
const TILT_PER_PX = 0.1
/** przeciagniecie ponizej tylu pikseli to jeszcze dotkniecie, nie obrot */
const DRAG_SLOP = 10
/** how long the walk takes to reach the speed you asked for: it spins up */
const RATE_TAU = 480

/** a walk is usually minutes, so read it as mm:ss until it passes an hour */
const fmtClock = (ms: number) => {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

type Memory =
  | { kind: 'mark'; id: string; at: number; mark: WalkMark & { url?: string } }
  | { kind: 'poi'; id: string; at: number; poi: QuestPoi }

/**
 * Walking the same route again, at whatever speed you feel like. The dial in
 * the corner is a throttle, not a scrubber: push it up and your past self
 * starts moving, push further and the walk speeds up, pull below the middle
 * and it runs backwards. Memories arrive as you reach the places they were
 * left at, which is the whole point of doing it this way.
 */
export function MemoryPlayer({
  journey,
  points,
  marks,
  onClose,
}: {
  journey: Journey
  points: QuestPoi[]
  marks: Array<WalkMark & { url?: string }>
  onClose: () => void
}) {
  const holder = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapGL | null>(null)
  const readyRef = useRef(false)
  const lineRef = useRef<Timeline | null>(null)
  /** what the dial asks for, and what the walk is actually doing right now */
  const targetRef = useRef(0)
  const rateRef = useRef(0)
  const elapsedRef = useRef(0)
  const bearingRef = useRef<number | null>(null)
  const seenRef = useRef<Set<string>>(new Set())
  const dwellUntil = useRef(0)
  /** wysokosc kamery, ktora moze przestawic szczypta; wraca do bazy przy wyjsciu */
  const zoomRef = useRef(BASE_ZOOM)
  /** czy palce sa wlasnie na mapie: wtedy kamera nie wtraca sie do kadru */
  const pinching = useRef(false)
  /** rozejrzenie sie: przesuniecie kursu i kat kamery, oba trzymane recznie */
  const spin = useRef(0)
  const tilt = useRef(TILT_BASE)
  const drag = useRef<{
    id: number
    x: number
    y: number
    spin: number
    tilt: number
    axis: '' | 'x' | 'y'
  } | null>(null)
  /** czy to przeciagniecie bylo obrotem: wtedy nie liczy sie jako pauza */
  const moved = useRef(false)
  /**
   * Prosba o jedno domalowanie kadru. Kamera odswieza sie tylko wtedy, gdy cos
   * jedzie, wiec rozejrzenie sie na stojaco nie mialoby jak wejsc na ekran.
   */
  const poke = useRef(false)

  const [elapsed, setElapsed] = useState(0)
  const [memory, setMemory] = useState<Memory | null>(null)
  /**
   * Czy sterowanie jest widoczne. W spoczynku ekran jest sama mapa: dial i
   * zegar wjezdzaja po dotknieciu i gasna po IDLE_HIDE_MS. Gdy stoisz, zostaja,
   * bo skoro zatrzymales, to pewnie czytasz.
   */
  const [chrome, setChrome] = useState(true)
  const chromeTimer = useRef(0)
  /** gdzie na trasie pojawila sie karta i od kiedy wisi: stad wie, kiedy zejsc */
  const memAt = useRef(0)
  const memSince = useRef(0)
  /** to samo, co stan `memory`, ale czytane z petli, ktora ma puste zaleznosci */
  const memRef = useRef<Memory | null>(null)
  /**
   * Ile jest "czytania" w kadrze: 0 to chodzenie, 1 to wspomnienie na ekranie.
   * Wygladzane co klatke i wysylane razem z reszta kamery, bo easeTo na padding
   * przegralby z jumpTo, ktore i tak lata w kazdej klatce.
   */
  const padNow = useRef(0)
  const padWant = useRef(0)
  /** dotkniecie mapy: zatrzymuje albo wznawia, i zawsze pokazuje sterowanie */
  const tapRef = useRef<() => void>(() => {})
  /** odsloniecie sterowania wolane z petli, gdy trasa dobiega konca */
  const showChromeRef = useRef<() => void>(() => {})
  /** wlaczenie jazdy z zewnatrz petli, bez martwienia sie o kolejnosc deklaracji */
  const cruiseRef = useRef<() => void>(() => {})
  /** czy wyprawa juz sama ruszyla, i kiedy ma ruszyc */
  const startedRef = useRef(false)
  const startAt = useRef(0)
  const [look, setLook] = useState<ReplayLook>('relief')
  useDarkChrome()
  const [looksOpen, setLooksOpen] = useState(false)
  /** whatever the memory was opened into: the full screen version of it */
  const [openMark, setOpenMark] = useState<string | null>(null)
  const [openPoi, setOpenPoi] = useState<QuestPoi | null>(null)
  /** a tap that closed an overlay must not carry on to the button underneath */
  const closedAt = useRef(0)
  const shut = (fn: () => void) => {
    closedAt.current = performance.now()
    fn()
  }

  const timeline = (lineRef.current ??= buildTimeline(journey, points))
  const track = journey.track

  // memories in the order they were left, each at its distance along the walk
  const stops = useRef<Array<{ id: string; metres: number; body: Memory }>>([])
  if (stops.current.length === 0) {
    const list: Array<{ id: string; metres: number; body: Memory }> = []
    const atMetres = (coords: [number, number]) => {
      let best = 0
      let bestD = Infinity
      for (let i = 0; i < track.length; i++) {
        const d = distanceM(track[i], coords)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
      return bestD <= 120 ? timeline.dist[best] : -1
    }
    for (const m of marks) {
      if (!m.coords) continue
      const metres = atMetres(m.coords)
      if (metres >= 0) list.push({ id: m.id, metres, body: { kind: 'mark', id: m.id, at: m.at, mark: m } })
    }
    for (const p of points) {
      if (!journey.points.includes(p.id)) continue
      const metres = atMetres(p.coords)
      if (metres >= 0)
        list.push({ id: p.id, metres, body: { kind: 'poi', id: p.id, at: journey.times?.[p.id] ?? 0, poi: p } })
    }
    stops.current = list.sort((a, b) => a.metres - b.metres)
  }

  // ---- the map, built once ----
  useEffect(() => {
    if (!holder.current || track.length === 0) return
    const map = new MapGL({
      container: holder.current,
      style: replayStyle('relief'),
      center: track[0],
      zoom: BASE_ZOOM,
      minZoom: BASE_ZOOM - ZOOM_SPAN,
      maxZoom: BASE_ZOOM + ZOOM_SPAN,
      pitch: 58,
      bearing: 0,
      attributionControl: { compact: true },
      /*
       * Kadr prowadzi trasa, wiec przesuwanie i obracanie zostaje wylaczone: bez
       * tego kamera i palec walczylyby o to samo. Zostaje sama wysokosc, bo o to
       * poprosil Jarek („moglbym miec mozliwosc lekkiego jeszcze zzoomowania i
       * odzoomowania, ale zeby byly limity"), i granice pilnuje minZoom/maxZoom.
       */
      dragPan: false,
      dragRotate: false,
      scrollZoom: true,
      touchZoomRotate: true,
      doubleClickZoom: false,
      keyboard: false,
      boxZoom: false,
    })
    // szczypta ma zmieniac wysokosc, nie kat: obrot nalezy do trasy
    map.touchZoomRotate.disableRotation()

    /*
     * Atrybucja startuje zwinieta do samego "i".
     *
     * Dotad lezala pod ciemnym dolem i nikt jej nie widzial. Gdy ciemnosc stala
     * sie zdarzeniem, wyszla na wierzch i zajmowala dwie linie na dole kadru.
     * Zwijamy ja raz, ale nie odbieramy jej: gdy dotkniesz "i", zostaje otwarta,
     * bo od tego momentu `opened` jest wlaczone i nic jej nie zamknie.
     */
    let opened = false
    const tuck = () => {
      const box = map.getContainer().querySelector('.maplibregl-ctrl-attrib')
      if (!box) return
      const btn = box.querySelector('.maplibregl-ctrl-attrib-button')
      if (btn && !btn.hasAttribute('data-pk-watch')) {
        btn.setAttribute('data-pk-watch', '1')
        btn.addEventListener('click', () => {
          opened = true
        })
      }
      if (!opened) box.classList.remove('maplibregl-compact-show')
    }
    map.on('idle', tuck)
    map.on('styledata', tuck)

    /*
     * Kamera przestawia kadr co klatke przez jumpTo, wiec bez tego szczypta
     * cofalaby sie natychmiast po kazdym palcu. Dwie rzeczy zalatwiaja sprawe.
     *
     * Po pierwsze `originalEvent` odsiewa gest od ruchu wlasnego: zdarzenia z
     * jumpTo go nie maja, a z palca albo kolka zawsze maja. Tylko te pierwsze
     * zapisujemy jako nowa wysokosc kamery.
     *
     * Po drugie w trakcie gestu kamera w ogole nie rusza kadru. Szczypta na
     * dwoch palcach przesuwa tez srodek miedzy nimi, wiec walka o center
     * konczylaby sie drganiem. Chodzacy wyjdzie na chwile z osi i wroci, gdy
     * palce zejda: tego sie nie widzi, a gest jest wtedy taki, jak w mapach.
     */
    const grab = (e: { originalEvent?: unknown }) => {
      if (e.originalEvent) pinching.current = true
    }
    const release = () => {
      if (!pinching.current) return
      pinching.current = false
      zoomRef.current = map.getZoom()
    }
    map.on('zoomstart', grab)
    map.on('zoom', (e: { originalEvent?: unknown }) => {
      if (e.originalEvent) zoomRef.current = map.getZoom()
    })
    map.on('zoomend', release)
    mapRef.current = map
    if (import.meta.env.DEV) {
      // a debug handle, the same as the main map has
      ;(window as unknown as { __pkReplay?: MapGL }).__pkReplay = map
    }
    // pierwszy kadr od razu w ramie chodzenia; dalej padding jedzie z draw()
    map.setPadding({ top: Math.round(window.innerHeight * WALK_PAD), left: 0, right: 0, bottom: 0 })

    const paintOnce = async () => {
      const colors = pinColors()
      const trail = {
        line: colors.trailEdge,
        fill: colors.trailFill,
        me: colors.trailMe,
      }
      for (const [id, img] of await buildPinImages(colors)) {
        if (!map.hasImage(id)) map.addImage(id, img)
      }
      for (const m of marks) {
        if (m.kind !== 'photo' || !m.blob) continue
        const id = `photo-${m.id}`
        if (map.hasImage(id)) continue
        try {
          map.addImage(id, await buildPhotoImage(m.blob, '#ffffff'))
        } catch {
          // a picture that will not decode simply gets no pin
        }
      }

      map.addSource('mem-track', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: track[0] } } as never,
      })
      map.addSource('mem-ahead', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: track },
        } as never,
      })
      map.addLayer({
        id: 'mem-ahead-line',
        type: 'line',
        source: 'mem-ahead',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 4, 'line-opacity': 0.45 },
      })

      map.addSource('mem-done', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [track[0], track[0]] },
        } as never,
      })
      map.addLayer({
        id: 'mem-done-line',
        type: 'line',
        source: 'mem-done',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': trail.line, 'line-width': 6 },
      })

      map.addSource('mem-stops', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stops.current.map((s) => ({
            type: 'Feature',
            properties: {
              markId: s.id,
              icon:
                s.body.kind === 'mark'
                  ? s.body.mark.kind === 'photo'
                    ? `photo-${s.body.mark.id}`
                    : pinImageId(s.body.mark.kind, 'replay')
                  : pinImageId(s.body.poi.category, 'replay'),
            },
            geometry: {
              type: 'Point',
              coordinates:
                s.body.kind === 'mark' ? (s.body.mark.coords as [number, number]) : s.body.poi.coords,
            },
          })),
        } as never,
      })
      map.addLayer({
        id: 'mem-stop-hit',
        type: 'circle',
        source: 'mem-stops',
        paint: { 'circle-radius': 26, 'circle-color': 'transparent' },
      })
      map.addLayer({
        id: 'mem-stop-pins',
        type: 'symbol',
        source: 'mem-stops',
        layout: {
          'icon-image': ['get', 'icon'] as never,
          'icon-size': 0.46,
          'icon-allow-overlap': true,
          'icon-pitch-alignment': 'viewport',
        },
      })

      map.addSource('mem-me', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: track[0] },
        } as never,
      })
      map.addLayer({
        id: 'mem-me-dot',
        type: 'circle',
        source: 'mem-me',
        paint: {
          'circle-radius': 9,
          // the classic blue puck: the stops are green, so I am not
          'circle-color': trail.me,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })

      readyRef.current = true
      draw(elapsedRef.current)
    }

    /*
     * styledata fires several times per style and painting is async, so it
     * needs a latch. The latch has to be released even when the style is
     * swapped mid-paint and an add throws: without the finally, one failed
     * paint locked the map out of ever drawing the route again.
     */
    /** everything the replay puts on the map, so a failed attempt can be undone */
    const OURS = {
      layers: ['mem-ahead-line', 'mem-done-line', 'mem-stop-hit', 'mem-stop-pins', 'mem-me-dot'],
      sources: ['mem-track', 'mem-ahead', 'mem-done', 'mem-stops', 'mem-me'],
    }
    const wipe = () => {
      for (const id of OURS.layers) if (map.getLayer(id)) map.removeLayer(id)
      for (const id of OURS.sources) if (map.getSource(id)) map.removeSource(id)
    }

    let painting = false
    /** a broken style must not be retried forever; reset on every new style */
    let tries = 0
    const paint = async () => {
      if (painting || tries > 6 || map.getSource('mem-track')) return
      painting = true
      tries++
      try {
        await paintOnce()
        readyRef.current = true
      } catch {
        // half a route is worse than none: clear it so the retry starts clean
        try {
          wipe()
        } catch {
          // the style went away entirely; nothing of ours is left on it
        }
      } finally {
        painting = false
      }
    }
    ;(map as unknown as { __paint: () => void }).__paint = paint

    map.on('load', () => void paint())
    // setStyle wipes our layers, and 'style.load' is unreliable in v5
    map.on('styledata', () => {
      tries = 0
      // isStyleLoaded also waits for every tile in view, which on the heavy
      // looks is ten seconds of a walk with no route on it. Adding sources only
      // needs the style itself, and a failed attempt now cleans up after itself
      if (!map.getSource('mem-track')) void paint()
    })
    /*
     * A heavy look (raised ground, a whole vector city) is still settling when
     * styledata arrives, so that call finds the style unready and there is no
     * second one. 'idle' means everything has landed: if the walk is not on the
     * map by then, it never will be, so paint it.
     */
    map.on('idle', () => {
      if (!map.getSource('mem-track')) void paint()
    })

    /*
     * Dotkniecie pinu prowadzi cie do niego: marker idzie, staje i mowi.
     * Dotkniecie samej mapy zatrzymuje albo wznawia marsz, i to jest jedyny
     * przycisk pauzy, jaki tu jest. Wczesniej stal osobny, 56 na 56, na stale.
     */
    map.on('click', (e) => {
      if (!map.getLayer('mem-stop-hit')) return
      const hit = map.queryRenderedFeatures(e.point, { layers: ['mem-stop-hit'] })[0]
      const id = hit?.properties?.markId
      if (!id) {
        tapRef.current()
        return
      }
      const stop = stops.current.find((x) => x.id === String(id))
      if (stop) travelTo(stop)
    })

    return () => {
      map.remove()
      mapRef.current = null
      readyRef.current = false
    }
    // built once: a replay shows one finished walk that cannot change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Wspomnienie wchodzi na ekran, a razem z nim ciemnosc i odjazd kamery.
   *
   * Wczesniej `setMemory` nie bylo nigdzie czyszczone: gdy mineles pierwsze
   * wspomnienie, karta zostawala do konca seansu, tylko podmieniana przez
   * nastepna. Dlatego ciemnosc musiala byc stala, i dlatego ten ekran czul sie
   * jak kokpit, a nie jak film. Teraz ciemnosc jest zdarzeniem: wjezdza z karta
   * i schodzi razem z nia.
   */
  const showMemory = (body: Memory, metres: number) => {
    memAt.current = metres
    memSince.current = performance.now()
    padWant.current = 1
    memRef.current = body
    setMemory(body)
  }
  const hideMemory = () => {
    padWant.current = 0
    memRef.current = null
    setMemory(null)
  }

  // ---- moving through the walk ----
  const draw = (ms: number, dt = 0) => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    const metres = metresAt(timeline, ms)
    const { at, bearing: segment } = pointAt(track, timeline.dist, metres)

    // aim at where the route goes next, not at the step underfoot: a corner
    // then reads as a turn of the head instead of a cut
    const ahead = pointAt(track, timeline.dist, metres + LOOKAHEAD_M).at
    const target =
      Math.abs(ahead[0] - at[0]) + Math.abs(ahead[1] - at[1]) > 1e-7
        ? bearingDeg(at, ahead)
        : segment
    if (bearingRef.current == null) bearingRef.current = target
    else {
      // shortest way round, eased by time rather than by frames
      let delta = ((target - bearingRef.current + 540) % 360) - 180
      const k = dt > 0 ? 1 - Math.exp(-dt / TURN_TAU) : 1
      bearingRef.current += delta * k
    }
    const bearing = bearingRef.current
    ;(map.getSource('mem-me') as { setData: (d: unknown) => void } | undefined)?.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: at },
    } as never)
    ;(map.getSource('mem-done') as { setData: (d: unknown) => void } | undefined)?.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: walkedSoFar(track, timeline.dist, metres) },
    } as never)
    if (!pinching.current) {
      const h = window.innerHeight
      const v = padNow.current
      map.jumpTo({
        center: at,
        // kurs trasy plus to, o ile sam sie rozejrzales
        bearing: bearing + spin.current,
        zoom: zoomRef.current,
        pitch: tilt.current,
        // jeden suwak miedzy dwiema ramami: chodzenie w gorze, czytanie w dole
        /*
         * Zaciskane do zera z premedytacja. MapLibre rzuca wyjatkiem na ujemnym
         * paddingu, a wyjatek w petli klatek zabija cala petle: ekran zamiera i
         * nie ma po czym poznac, co sie stalo. Kamera nie jest miejscem na
         * ambicje, wiec woli sie przyciac niz wywrocic.
         */
        padding: {
          top: Math.max(0, Math.round((1 - v) * WALK_PAD * h)),
          left: 0,
          right: 0,
          bottom: Math.max(0, Math.round(v * READ_PAD * h)),
        },
      })
    }

    // a memory shows up when we reach where it was left
    const hit = stops.current.find(
      (s) => Math.abs(s.metres - metres) <= REACH_M && !seenRef.current.has(s.id),
    )
    if (hit) {
      seenRef.current.add(hit.id)
      showMemory(hit.body, metres)
      navigator.vibrate?.(25)
      // a beat of stillness, so arriving somewhere actually feels like arriving
      dwellUntil.current = performance.now() + DWELL_MS
    }
  }

  /** an animated walk to a chosen memory, ignoring the throttle while it runs */
  const trip = useRef<{ from: number; to: number; t0: number; dur: number; stop: string } | null>(
    null,
  )
  const travelTo = (stop: { id: string; metres: number; body: Memory }) => {
    const to = msAtMetres(timeline, stop.metres)
    const from = elapsedRef.current
    const gap = Math.abs(to - from)
    targetRef.current = 0
    rateRef.current = 0
    posRef.current = 0
    setPos(0)
    trip.current = {
      from,
      to,
      t0: performance.now(),
      // near things are a step, far things a proper walk, but never a slog
      dur: Math.max(600, Math.min(1600, 600 + gap / 60)),
      stop: stop.id,
    }
    showMemory(stop.body, stop.metres)
  }

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      /*
       * dt przyciete z obu stron, i to nie jest ostroznosc na zapas.
       *
       * Znak minus jest realny: pierwsza klatka po commicie Reacta dostaje
       * czasem znacznik POCZATKU tej samej klatki, w ktorej effect sie wykonal,
       * czyli chwile wczesniejszy niz `performance.now()` z linijki powyzej.
       * Zmierzone minus 53 ms. Przy wygladzaniu wykladniczym ujemne dt daje
       * wspolczynnik ponizej zera, czyli krok w zla strone: padding wyszedl na
       * minus, MapLibre rzucil wyjatkiem, wyjatek zabil petle klatek i cale
       * odtwarzanie stalo z zegarem na zerze.
       *
       * Gora jest po to, zeby powrot z tla nie teleportowal wyprawy o pol
       * doliny: 64 ms to jakies cztery klatki i tyle wolno nadgonic naraz.
       */
      const dt = Math.min(64, Math.max(0, now - last))
      last = now

      /*
       * Wyprawa rusza sama, chwile po tym, jak mapa sie odmaluje. Ta chwila jest
       * po to, zeby zobaczyc, skad zaczynasz, zanim swiat pojedzie.
       */
      if (!startedRef.current && readyRef.current) {
        startedRef.current = true
        startAt.current = now + 600
      }
      if (startAt.current && now >= startAt.current) {
        startAt.current = 0
        cruiseRef.current()
      }

      // kadr dojezdza do swojej ramy niezaleznie od tego, czy cos sie rusza
      const padGap = padWant.current - padNow.current
      let settling = false
      if (Math.abs(padGap) > 0.0015) {
        padNow.current += padGap * (1 - Math.exp(-dt / PAD_TAU))
        settling = true
      } else if (padNow.current !== padWant.current) {
        padNow.current = padWant.current
        settling = true
      }

      /*
       * Karta schodzi sama, gdy poszedles dalej: liczone w metrach, bo predkosc
       * jest zmienna. Cofanie tez ja zdejmuje, bo wtedy wracasz przed miejsce,
       * w ktorym cos zostawiles.
       */
      if (memRef.current) {
        const walked = metresAt(timeline, elapsedRef.current) - memAt.current
        if (now - memSince.current > CARD_MIN_MS && (walked > CARD_CLEAR_M || walked < -8)) {
          hideMemory()
        }
      }

      // a walk does not jump to a speed: it gathers it, and it coasts down
      const target = targetRef.current
      if (rateRef.current !== target) {
        const k = 1 - Math.exp(-dt / RATE_TAU)
        rateRef.current += (target - rateRef.current) * k
        if (Math.abs(target - rateRef.current) < 0.04) rateRef.current = target
      }

      // travelling to a pin the walker was sent to: nothing else moves it
      const going = trip.current
      if (going) {
        const p = Math.min(1, (now - going.t0) / going.dur)
        // ease in and out: it sets off, covers ground, and lands softly
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
        const next = going.from + (going.to - going.from) * e
        elapsedRef.current = next
        setElapsed(next)
        draw(next, dt)
        if (p >= 1) {
          seenRef.current.add(going.stop)
          dwellUntil.current = now + DWELL_MS
          trip.current = null
        }
        raf = requestAnimationFrame(step)
        return
      }

      let r = rateRef.current
      // standing at a memory: the walk holds itself still for a moment
      if (now < dwellUntil.current) r = 0
      if (r > 0) {
        // approaching something you left: slow down, the way you would
        const metresNow = metresAt(timeline, elapsedRef.current)
        let nearest = Infinity
        for (const stop of stops.current) {
          if (seenRef.current.has(stop.id)) continue
          const gap = stop.metres - metresNow
          if (gap >= 0 && gap < nearest) nearest = gap
        }
        if (nearest < SLOW_M) {
          const t = Math.max(0, nearest / SLOW_M)
          r *= SLOW_FLOOR + (1 - SLOW_FLOOR) * t * t
        }
      }
      if (r !== 0) {
        const next = Math.max(0, Math.min(timeline.totalMs, elapsedRef.current + dt * r))
        if (next !== elapsedRef.current) {
          elapsedRef.current = next
          setElapsed(next)
          draw(next, dt)
          // rewinding should let a memory happen again on the way back
          if (r < 0) {
            const metres = metresAt(timeline, next)
            for (const s of stops.current) {
              if (s.metres > metres + REACH_M) seenRef.current.delete(s.id)
            }
          }
        }
        if (next === timeline.totalMs || next === 0) {
          posRef.current = 0
          setPos(0)
          targetRef.current = 0
          rateRef.current = 0
          // koniec albo poczatek trasy: pokaz sterowanie, zeby bylo widac, ze
          // mozna zawrocic. Bez tego staniesz przed pustym ekranem
          showChromeRef.current()
        }
      } else if (settling || poke.current) {
        // stoisz, a kadr sie zmienia: rama dojezdza albo wlasnie sie rozgladasz
        poke.current = false
        draw(elapsedRef.current, dt)
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- the dial: a throttle that stays where you leave it ----
  const posRef = useRef(0)
  const [pos, setPos] = useState(0)
  const dragFrom = useRef<{ y: number; pos: number } | null>(null)

  /** the handle rides the arc; the speed it asks for rises as its square */
  const applyPos = (next: number) => {
    const p = Math.abs(next) < 0.05 ? 0 : Math.max(-1, Math.min(1, next))
    posRef.current = p
    setPos(p)
    targetRef.current = Math.sign(p) * MAX_RATE * p * p
  }

  const onDialDown = (e: React.PointerEvent) => {
    showChromeRef.current()
    cancelAnimationFrame(tween.current)
    trip.current = null
    try {
      // capture keeps the drag alive outside the arc; losing it is survivable
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // some engines refuse: the drag still works through this element
    }
    dragFrom.current = { y: e.clientY, pos: posRef.current }
  }
  const onDialMove = (e: React.PointerEvent) => {
    const from = dragFrom.current
    if (!from) return
    // w gore idziesz dalej, w dol wracasz: tak, jak mowi o tym metafora
    applyPos(from.pos - (e.clientY - from.y) / DIAL_THROW)
  }
  const onDialUp = () => {
    dragFrom.current = null
    showChromeRef.current()
  }

  /**
   * Pausing lets the handle spring back rather than teleport: it overshoots
   * the middle by a hair and settles, which is what makes it feel sprung.
   */
  const tween = useRef(0)
  const centre = () => {
    cancelAnimationFrame(tween.current)
    const from = posRef.current
    if (from === 0) return
    const t0 = performance.now()
    const DUR = 360
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / DUR)
      const eased = 1 - Math.pow(1 - p, 3)
      const overshoot = Math.sin(p * Math.PI) * 0.05 * -Math.sign(from)
      applyPos(from * (1 - eased) + overshoot)
      if (p < 1) tween.current = requestAnimationFrame(step)
      else applyPos(0)
    }
    tween.current = requestAnimationFrame(step)
  }

  /**
   * Odsloniecie sterowania. Jedna zasada: gdy cos jedzie, gasnie po chwili, a
   * gdy stoisz, zostaje, bo skoro zatrzymales, to pewnie czytasz. Sprawdzenie
   * jest w samym timerze, nie przy zakladaniu, bo `centre()` sprowadza raczke
   * do zera przez 360 ms i w momencie dotkniecia jeszcze nie stoi.
   */
  const showChrome = () => {
    window.clearTimeout(chromeTimer.current)
    setChrome(true)
    chromeTimer.current = window.setTimeout(() => {
      if (posRef.current !== 0) setChrome(false)
    }, IDLE_HIDE_MS)
  }
  showChromeRef.current = showChrome
  cruiseRef.current = () => {
    applyPos(CRUISE)
    showChrome()
  }
  /*
   * Dotkniecie mapy. Tu byl ukryty konflikt: "dotknij, zeby pokazac sterowanie"
   * i "dotknij, zeby zatrzymac" to ten sam gest. Robia wiec jedno: dotkniecie
   * zatrzymuje albo wznawia I pokazuje dial, na ktorym widzisz, jak raczka
   * wraca na srodek. Kontrolka pokazuje ci, co sie wlasnie stalo.
   */
  tapRef.current = () => {
    // przeciagniecie konczy sie takim samym `click`, bo mapa nie przechwytuje
    // przesuwania; bez tego kazde rozejrzenie sie zatrzymywaloby wyprawe
    if (moved.current) return
    if (posRef.current === 0) applyPos(CRUISE)
    else centre()
    showChrome()
  }

  useEffect(() => () => window.clearTimeout(chromeTimer.current), [])

  /** swipe w dol na karcie zdejmuje wspomnienie od razu */
  const cardFrom = useRef<number | null>(null)

  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

  /*
   * Rozejrzenie sie po mapie jednym palcem. Mapa ma wylaczone przesuwanie i
   * obracanie, wiec nic nam tego gestu nie zabiera i mozemy go wziac na siebie.
   *
   * Kierunek jest jak w kazdej mapie: grunt idzie za palcem. Przeciagasz w
   * prawo, swiat jedzie w prawo, czyli kamera obchodzi chodzacego z lewej.
   */
  const onMapDown = (e: React.PointerEvent) => {
    if (!e.isPrimary || pinching.current) return
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      spin: spin.current,
      tilt: tilt.current,
      axis: '',
    }
    moved.current = false
  }
  const onMapMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    if (pinching.current) {
      drag.current = null
      return
    }
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (!d.axis) {
      if (Math.abs(dx) < DRAG_SLOP && Math.abs(dy) < DRAG_SLOP) return
      d.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
      moved.current = true
      showChromeRef.current()
    }
    if (d.axis === 'x') {
      const next = clamp(d.spin - dx * SPIN_PER_PX, -SPIN_MAX, SPIN_MAX)
      // blisko zera wraca na os trasy, zeby kadr dal sie wyprostowac
      spin.current = Math.abs(next) < 4 ? 0 : next
    } else {
      const next = clamp(d.tilt + dy * TILT_PER_PX, TILT_MIN, TILT_MAX)
      // tak samo jak kurs: blisko wartosci wyjsciowej wraca do niej samo
      tilt.current = Math.abs(next - TILT_BASE) < 2.5 ? TILT_BASE : next
    }
    poke.current = true
  }
  const onMapUp = () => {
    drag.current = null
  }

  const progress = timeline.totalMs > 0 ? elapsed / timeline.totalMs : 0

  return (
    <div className="memplay">
      <div
        ref={holder}
        className="memplay__map"
        onPointerDown={onMapDown}
        onPointerMove={onMapMove}
        onPointerUp={onMapUp}
        onPointerCancel={onMapUp}
      />

      {/*
        Cichy cien na samym dole, zawsze. Nie zero, bo wlos postepu i wjezdzajacy
        dial musza miec na czym stac, gdy pod nimi trafi sie jasne pole.
      */}
      <div className="memplay__hem" aria-hidden="true" />

      {/* ciemnosc i rozmycie sa zdarzeniem: przychodza z karta, schodza z nia */}
      <div className={`memplay__veil${memory ? ' -on' : ''}`} aria-hidden="true" />
      <div className={`memplay__floor${memory ? ' -on' : ''}`} aria-hidden="true">
        <span style={{ '--b': '1px', '--from': '0%', '--to': '38%' } as CSSProperties} />
        <span style={{ '--b': '3px', '--from': '24%', '--to': '66%' } as CSSProperties} />
        <span style={{ '--b': '7px', '--from': '48%', '--to': '88%' } as CSSProperties} />
        <span style={{ '--b': '12px', '--from': '70%', '--to': '100%' } as CSSProperties} />
      </div>

      <button
        className={`memplay__back${chrome ? '' : ' -dim'}`}
        aria-label="Wyjdź ze wspomnień"
        onClick={() => {
          if (performance.now() - closedAt.current < 500) return
          onClose()
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        className={`memplay__look${chrome ? '' : ' -off'}`}
        aria-label="Zmień wygląd mapy"
        onClick={() => setLooksOpen((v) => !v)}
      >
        <Layers size={19} />
      </button>

      {looksOpen && (
        <div className="memplay__looks">
          {REPLAY_LOOKS.map((l) => (
            <button
              key={l.id}
              className={`memplay__lookopt${l.id === look ? ' -on' : ''}`}
              onClick={() => {
                setLooksOpen(false)
                if (l.id === look) return
                setLook(l.id)
                readyRef.current = false
                const map = mapRef.current
                if (!map) return
                // the raised ground survives a style swap unless it is dropped
                try {
                  map.setTerrain(null)
                } catch {
                  // no terrain to drop
                }
                map.setStyle(replayStyle(l.id))
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      {/*
        Dol nalezy do tresci i tylko do tresci. Sterowanie przenioslo sie na
        prawa krawedz (pomysl Jarka: "moze kontrolka predkosci powinna sie
        pojawiac po prawej jak suwak na srodku, wtedy byloby wiecej miejsca na
        content"), wiec nie trzymamy tu zapasu na kontrolke i wspomnienie moze
        zjechac az do wlosa postepu.
      */}
      <div className="memplay__bottom">
        {memory &&
          (() => {
            /*
             * Otwiera sie tylko to, co ma co pokazac wiecej: zdjecie ma pelny
             * ekran, punkt ma opis, legende i dylemat. Notatka i nagranie sa tu
             * juz cale, wiec nie udaja, ze gdzies prowadza, i nie sa wtedy
             * przyciskiem (decyzja Jarka: "jezeli jest audio lub notatka
             * tekstowa, to niech to nie otwiera sie w nowym oknie").
             */
            const openable = memory.kind === 'poi' || memory.mark.kind === 'photo'
            const Tag = (openable ? 'button' : 'div') as 'button'
            return (
              <Tag
                className={`memplay__memory${openable ? '' : ' -flat'}`}
                onPointerDown={(e: React.PointerEvent) => {
                  cardFrom.current = e.clientY
                }}
                onPointerMove={(e: React.PointerEvent) => {
                  if (cardFrom.current === null) return
                  if (e.clientY - cardFrom.current > 60) {
                    cardFrom.current = null
                    hideMemory()
                  }
                }}
                onPointerUp={() => {
                  cardFrom.current = null
                }}
                onPointerCancel={() => {
                  cardFrom.current = null
                }}
                onClick={
                  openable
                    ? () => {
                        // stop where we are: reading is not walking
                        targetRef.current = 0
                        rateRef.current = 0
                        posRef.current = 0
                        setPos(0)
                        if (memory.kind === 'mark') setOpenMark(memory.id)
                        else setOpenPoi(memory.poi)
                      }
                    : undefined
                }
              >
                {memory.kind === 'mark' ? (
                  memory.mark.kind === 'photo' && memory.mark.url ? (
                    <>
                      <img
                        className="memplay__snap"
                        src={memory.mark.url}
                        alt={memory.mark.caption}
                      />
                      {memory.mark.caption && <p className="memplay__said">{memory.mark.caption}</p>}
                    </>
                  ) : memory.mark.kind === 'audio' && memory.mark.url ? (
                    <>
                      <WavePlayer src={memory.mark.url} blob={memory.mark.blob} autoPlay />
                      {memory.mark.caption && <p className="memplay__said">{memory.mark.caption}</p>}
                    </>
                  ) : (
                    /*
                     * Notatka jest cytatem, nie karteczka. Zolty posit byl
                     * najglosniejszym obiektem w calym kadrze i zabieral pol
                     * ekranu czemus, co jest jednym zdaniem. Zostaje reka, ktora
                     * to napisala, i znak cytatu u gory.
                     */
                    <p className="memplay__quote">
                      <span className="memplay__quotemark" aria-hidden="true">
                        &#8220;
                      </span>
                      {memory.mark.caption || 'Pusta notatka'}
                    </p>
                  )
                ) : (
                  <>
                    {/*
                      Punkt dostaje swoje zdjecie, gdy je ma, i to jest ta zmiana
                      formy, o ktora pytal Jarek. Punkt byl jedyna forma bez
                      zadnego przedmiotu: sam akapit na czerni. A w repozytorium
                      leza 45 zdjec punktow, z ktorych ten ekran nie korzystal.
                      Prosto, bez przekrzywienia: to nie Twoja fotka, to miejsce.
                    */}
                    {memory.poi.photo && (
                      <img className="memplay__place" src={memory.poi.photo} alt={memory.poi.name} />
                    )}
                    <p className="t-body-strong memplay__poiname">{memory.poi.name}</p>
                    <p className="t-body-sm memplay__teaser">{memory.poi.teaser}</p>
                    <span className="memplay__more">czytaj wiecej</span>
                  </>
                )}
              </Tag>
            )
          })()}
      </div>

      {/*
        Przepustnica na prawej krawedzi, w pionie, na srodku wysokosci. Pion jest
        przy okazji uczciwszy wobec metafory: komentarz w tym pliku od zawsze
        mowil "push it up and your past self starts moving", a luk byl poziomy.
      */}
      <div className={`memplay__hud${chrome ? '' : ' -off'}`}>
        <div
          className="memplay__throttle"
          onPointerDown={onDialDown}
          onPointerMove={onDialMove}
          onPointerUp={onDialUp}
          onPointerCancel={onDialUp}
        >
          <svg viewBox="0 0 56 240" className="memplay__ladder" aria-hidden="true">
            {/*
              Poswiata idzie za raczka, a nie stoi w srodku toru: to ona robi z
              drabinki przepustnice, a nie rzad kresek. Gradient w jednostkach
              uzytkownika, wiec kazda kreska gasnie na swojej dlugosci.
            */}
            <defs>
              <linearGradient
                id="pk-lad-fade"
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1={THR_MID - pos * THR_TRAVEL - 78}
                x2="0"
                y2={THR_MID - pos * THR_TRAVEL + 78}
              >
                <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {Array.from({ length: 41 }, (_, i) => {
              const y = THR_MID - THR_TRAVEL + (i / 40) * THR_TRAVEL * 2
              const mid = i === 20
              return (
                <line
                  key={i}
                  x1={mid ? 24 : 31}
                  y1={y}
                  x2="52"
                  y2={y}
                  stroke={mid ? 'var(--trail-edge)' : 'url(#pk-lad-fade)'}
                  strokeOpacity={mid ? 0.55 : 1}
                  strokeWidth={mid ? 1.6 : 1.1}
                  strokeLinecap="round"
                />
              )
            })}
          </svg>

          {/* raczka nad poswiata, wiec nigdy nie gasnie razem z kreskami */}
          <svg viewBox="0 0 56 240" className="memplay__grip" aria-hidden="true">
            <g transform={`translate(0 ${(-pos * THR_TRAVEL).toFixed(2)})`}>
              <rect
                x="6"
                y={THR_MID - 15}
                width="44"
                height="30"
                rx="15"
                fill="var(--trail-fill)"
                stroke="var(--trail-edge)"
                strokeWidth="2.6"
              />
              {[-3.5, 3.5].map((dx) =>
                [-3.5, 3.5].map((dy) => (
                  <rect
                    key={`${dx}${dy}`}
                    x={28 + dx - 1.5}
                    y={THR_MID + dy - 1.5}
                    width="3"
                    height="3"
                    rx="0.8"
                    fill="#ffffff"
                  />
                )),
              )}
            </g>
          </svg>
        </div>

        <div className="memplay__clock">
          <span className="memplay__time">{fmtClock(elapsed).replace(':', ' : ')}</span>
          <span className="memplay__clocklabel">czas wyprawy</span>
        </div>
      </div>

      {/* gdzie jestes w wyprawie: tego dotad nie bylo nigdzie */}
      <div className="memplay__bar" aria-hidden="true">
        <span
          className="memplay__barfill"
          style={{ transform: `scaleX(${Math.max(0, Math.min(1, progress))})` }}
        />
      </div>

      {openMark && (
        <MemoryViewer
          marks={marks}
          startId={openMark}
          onClose={() => shut(() => setOpenMark(null))}
        />
      )}

      <PoiModal
        poi={openPoi}
        parkId={journey.parkId}
        collected
        onClose={() => shut(() => setOpenPoi(null))}
      />
    </div>
  )
}
