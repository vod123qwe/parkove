import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Award, Camera, ChevronRight, Coffee, Compass, Crosshair, Footprints, Info, Layers, List as ListIcon, LocateFixed, Menu, Palette, RefreshCw, Route, Search, Sparkles, ToyBrick, X } from 'lucide-react'
import { BottomSheet, Button, List, ListItem, PeekCard, Segmented, Toast } from '../ds'
import { heroPhoto } from './data/parkinfo'
import { MapView } from './MapView'
import { SpotCard } from './SpotCard'
import { PointsSheet } from './PointsSheet'
import { asset } from './assets'
import type { MapFocus } from './MapView'
import { ParkSheet } from './ParkSheet'
import type { ParkFeature } from './ParkSheet'
import { PoiModal } from './PoiSheet'
import { ParkingModal } from './ParkingModal'
import { TrailModal } from './TrailModal'
import { TrailPicker } from './TrailPicker'
import { LooksModal } from './LooksModal'
import { JourneysModal } from './JourneysModal'
import { StatsModal } from './StatsModal'
import { AboutModal } from './AboutModal'
import { MapFilters } from './MapFilters'
import { PlantCamera } from './PlantCamera'
import { plantEnabled } from './plant'
import { getGlances, sky } from './weather'
import type { Glance } from './weather'
import { SKY_ICONS } from './skyIcons'
import { TRAIL_INK, trailById, trailsFor } from './data/trails'
import { AmenityModal } from './AmenityModal'
import { ParkPeekContent, ParkingPeekContent, PoiPeekContent } from './PeekContents'
import { AchievementsModal } from './AchievementsModal'
import { StampCelebration } from './StampCelebration'
import { ExpeditionController } from './ExpeditionController'
import { ExpeditionBar } from './ExpeditionBar'
import { MarkSheet } from './MarkSheet'
import { updateMark, useMarks, addMark } from './photos'
import { RevealSheet } from './RevealSheet'
import { distanceM, distanceToParkM, formatDistance } from './geo'
import type { Pt } from './geo'
import { beginWalk } from './walk'
import { askHeading, useHeading } from './heading'
import { useWakeLock } from './wakelock'
import { REFRESH_FROM } from './refresh'
import { VERSION, changesSince } from '../changelog'
import { EndWalkSheet } from './EndWalkSheet'
import { JourneyScreen } from './JourneyScreen'
import { StampScreen } from './StampScreen'
import { WalkSummary } from './WalkSummary'
import { chooseTrail, stopExpedition, useGameState } from './state'
import { isParkComplete } from './progress'
import { useUpdateAvailable } from './update'
import { MAP_STYLES, getMapStyle, resolveMapStyle, setMapStyle } from './data/mapstyles'
import { DownloadStatus } from './DownloadStatus'
import { KIND_META } from './kinds'
import { CHALLENGES, challengeStates } from './data/challenges'
import type { MapStyleId } from './data/mapstyles'
import { PARKING } from './data/parking'
import { amenitiesFor, isFood } from './data/amenities'
import type { ParkingInfo } from './data/parking'
import { pointsTotal, questForPark, photosForPark } from './data/quests'
import type { QuestPoi } from './data/quests'
import parksData from './data/parks.json'
import { plMiejsca, plNaklejki, plPunkty, plWyprawy, plZapisane } from './naming'
import './app.css'

const FEATURES = parksData.features as unknown as ParkFeature[]

/**
 * Ile arkusz miejsc wystaje na ekranie głównym.
 *
 * Liczone z pomiaru, składnik po składniku, bo Jarek powiedział dokładnie, co ma
 * być widać: „tytuł, search, taby i jeden kolejny park". Nagłówek arkusza ma 84,
 * pole szukania z odstępami 70, zakładki 44, wiersz miejsca 76. Razem 274, a po
 * pomiarze 290: przy 274 z wiersza było widać 60 pikselów z 76, więc park nie
 * był całym parkiem.
 *
 * Wcześniej było 174 i pokazywało półtora wiersza i nic więcej, a wtedy do
 * szukania trzeba było najpierw rozwinąć arkusz: wyszukiwarka istniała tylko dla
 * tych, którzy wiedzą, że tam jest.
 */
const DOCK_PEEK = 290

type PeekPage =
  | { t: 'park' }
  | { t: 'poi'; poi: QuestPoi }
  | { t: 'parking'; parking: ParkingInfo }

export function App() {
  const { parks: progress, expedition, trails: trailChoice, filters, answers } = useGameState()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [peekIndex, setPeekIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [parkingOpen, setParkingOpen] = useState(false)
  /*
   * Arkusz miejsc jest DOMYSLNA powierzchnia ekranu glownego, wiec jego
   * widocznosc jest wyliczana, a nie przelaczana.
   *
   * Wczesniej byla stanem (`listOpen`), ktory gasil sie przy wejsciu w miejsce z
   * listy i przy pokazywaniu czegos na mapie, a wlaczal tylko z menu. Efekt
   * zglosil Jarek: po zakonczeniu wyprawy arkusz nie wracal, bo zostal zgaszony
   * kiedys wczesniej i nikt go nie zapalil. Stan, ktory da sie zablokowac w zlej
   * pozycji, jest tu po prostu zlym narzedziem.
   *
   * Zostaje `listWide`, ale on nie decyduje o WIDOCZNOSCI, tylko o tym, czy
   * arkusz stoi rozwiniety: menu prosi o pelna liste, a przeciagniecie w dol ja
   * skleja z powrotem.
   */
  const [listWide, setListWide] = useState(false)
  const [listDetent, setListDetent] = useState<'min' | 'auto' | 'full'>('min')
  /** which collection the list shows: everything, the day trips, or the city */
  const [listTab, setListTab] = useState<'all' | 'dolinki' | 'parki'>('all')
  /*
   * Pogoda dla calej listy: jedno zapytanie na wszystkie miejsca, wiec placimy
   * za nie tylko wtedy, gdy lista jest otwarta. Dzieki temu wybor niedzielnego
   * celu jest jednym spojrzeniem, a nie otwieraniem pieciu kart po kolei.
   */
  const [glances, setGlances] = useState<Record<string, Glance>>({})
  const [focus, setFocus] = useState<MapFocus | null>(null)
  const [reveal, setReveal] = useState<{ parkId: string; poi: QuestPoi } | null>(null)
  /** heads-up that a point is within sight, and the arrival notice with a story */
  const [nearNotice, setNearNotice] = useState<{ poi: QuestPoi; distance: number } | null>(null)
  const [arrival, setArrival] = useState<{ parkId: string; poi: QuestPoi } | null>(null)
  /** the camera follows the walker until the map is touched */
  const [followMe, setFollowMe] = useState(true)
  /** photo pin being looked at, and the one being dragged to a new place */
  const [photoId, setPhotoId] = useState<string | null>(null)
  const [movingPhotoId, setMovingPhotoId] = useState<string | null>(null)
  const [photoAdded, setPhotoAdded] = useState<string | null>(null)
  /** confirmation before a walk becomes a journal entry */
  const [endingWalk, setEndingWalk] = useState(false)
  /** the walk that just ended, waiting to show its summary */
  const [summaryId, setSummaryId] = useState<string | null>(null)
  /** last known position outside a walk: decides whether the start CTA shows */
  const [myFix, setMyFix] = useState<{ coords: Pt; accuracy: number; at: number } | null>(null)
  /** a past walk opened for review: its route takes over the map */
  const [journeyId, setJourneyId] = useState<string | null>(null)
  /** one sticker opened up close */
  const [stampParkId, setStampParkId] = useState<string | null>(null)
  const [poiCard, setPoiCard] = useState<{ parkId: string; poi: QuestPoi } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [stampsOpen, setStampsOpen] = useState(false)
  /*
   * Jeden ekran wygladu (motyw + mapa) i jeden o aplikacji, zamiast czterech
   * wejsc rozsypanych po menu i profilu. Uwaga na nazwe: looksOpen nizej to
   * szybki przelacznik stylu NA mapie, co innego niz ten ekran.
   */
  const [looksModalOpen, setLooksModalOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [journeysOpen, setJourneysOpen] = useState(false)
  /** the quick switch on the map itself, for comparing looks in place */
  const [looksOpen, setLooksOpen] = useState(false)
  const [celebrate, setCelebrate] = useState<{ id: string; name: string } | null>(null)
  const [amenityKind, setAmenityKind] = useState<'food' | 'playground' | null>(null)
  /** wybrana konkretna kawiarnia albo plac zabaw: pin rośnie, mapa centruje */
  const [amenitySpotId, setAmenitySpotId] = useState<string | null>(null)
  const [trailsOpen, setTrailsOpen] = useState(false)
  /*
   * Wybieranie szlaku na mapie w trakcie wyprawy: numer podgladanej trasy.
   * null = nie wybieramy. Podglad rysuje sie na mapie, a moduly na dole
   * podmieniaja sie na pasek wyboru, wiec mapa zostaje ta sama.
   */
  const [pickTrail, setPickTrail] = useState<number | null>(null)
  /* pelnoekranowa kamera do sprawdzania roslin */
  const [plantCam, setPlantCam] = useState(false)
  /* małe cele w terenie: lista punktów wyprawy i wybrany z niej cel */
  const [pointsOpen, setPointsOpen] = useState(false)
  const [targetPoiId, setTargetPoiId] = useState<string | null>(null)
  const [wantHeading, setWantHeading] = useState(false)
  /* wynik odświeżenia wersji: pokazujemy raz, po przeładowaniu */
  /*
   * Wynik odświeżenia wersji. Czytamy w inicjalizatorze stanu i NIE usuwamy tu
   * znacznika: moduł w trybie deweloperskim wykonuje się dwa razy, a StrictMode
   * montuje komponent dwa razy, więc każde „przeczytaj i skasuj” gubiło
   * informację przed pokazaniem. Znacznik ginie razem z zamknięciem paska.
   */
  const [refreshInfo, setRefreshInfo] = useState(() => {
    try {
      const from = sessionStorage.getItem(REFRESH_FROM)
      return from ? { nowa: from !== VERSION, z: from } : null
    } catch {
      return null
    }
  })
  const [mapStyle, setMapStyleState] = useState<MapStyleId>(getMapStyle)


  const pickMapStyle = (id: MapStyleId) => {
    setMapStyleState(id)
    setMapStyle(id)
  }

  const mapStyleSpec = useMemo(() => resolveMapStyle(mapStyle), [mapStyle])

  const visitedIds = useMemo(() => new Set(Object.keys(progress)), [progress])

  /** parks with every point collected: these are the ones with a stamp */
  const completedIds = useMemo(
    () => new Set(FEATURES.filter((f) => isParkComplete(f.id, progress)).map((f) => f.id)),
    [progress],
  )

  const stampPins = useMemo(
    () =>
      FEATURES.filter((f) => completedIds.has(f.id)).map((f) => ({
        parkId: f.id,
        coords: f.properties.center,
      })),
    [completedIds],
  )

  // A stamp is the end of a story, so it waits for the walk to be over: during
  // one, completions queue up here instead of interrupting with confetti.
  const knownComplete = useRef<Set<string> | null>(null)
  const pendingStamps = useRef<string[]>([])
  useEffect(() => {
    const prev = knownComplete.current
    knownComplete.current = completedIds
    if (!prev) return
    for (const id of completedIds) if (!prev.has(id)) pendingStamps.current.push(id)
  }, [completedIds])

  const visitedCount = FEATURES.filter((f) => visitedIds.has(f.id)).length

  const selected = FEATURES.find((f) => f.id === selectedId) ?? null

  /**
   * Czy arkusz miejsc stoi na dole: jedna prawda dla niego i dla komunikatów.
   *
   * Wyliczane z tego, co zajmuje dół, i tylko z tego. Nie ma tu żadnego stanu,
   * który mógłby zostać w złej pozycji: skończ wyprawę albo odklikaj miejsce i
   * arkusz wraca sam.
   */
  const dockUp = !selected && !expedition

  /** wybrana kawiarnia albo plac zabaw: mapa jedzie do pinu, pin się zaznacza */
  const pickAmenity = (id: string) => {
    const spot = selected ? amenitiesFor(selected.id).find((a) => a.id === id) : null
    if (!spot) return
    setAmenitySpotId(id)
    setAmenityKind(null)
    setExpanded(false)
    setFocus({ center: spot.coords, zoom: 17.2, ts: Date.now() })
  }

  const activeSpot = useMemo(
    () =>
      selected && amenitySpotId
        ? (amenitiesFor(selected.id).find((a) => a.id === amenitySpotId) ?? null)
        : null,
    [selected, amenitySpotId],
  )

  /* znacznik kasujemy z opoźnieniem, nie przy zamknięciu: w trybie
     deweloperskim komponent bywa odmontowany w pierwszej sekundzie i informacja
     ginęła, zanim ktoś ją zobaczył */
  useEffect(() => {
    if (!refreshInfo) return
    const t = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(REFRESH_FROM)
      } catch {
        // nic
      }
    }, 1500)
    return () => window.clearTimeout(t)
  }, [refreshInfo])

  const expeditionPark = expedition ? FEATURES.find((f) => f.id === expedition.parkId) : null
  const expeditionQuest = expedition ? questForPark(expedition.parkId) : null
  /* kompas włączamy dopiero, gdy wybierzesz cel: przedtem nie ma po co słuchać czujnika */
  const heading = useHeading(wantHeading && !!targetPoiId)
  /* ekran nie gaśnie w trakcie wyprawy: inaczej ślad urywa się w kieszeni */
  useWakeLock(!!expedition)
  const onWalk = !!expedition
  const peekOpen = !!selected && !expanded && !onWalk

  // ...and lands once the walk is closed, one park at a time
  useEffect(() => {
    if (onWalk || celebrate || !pendingStamps.current.length) return
    const id = pendingStamps.current.shift()!
    const f = FEATURES.find((x) => x.id === id)
    if (f) setCelebrate({ id, name: f.properties.name })
  }, [onWalk, celebrate, completedIds])

  // the start CTA only makes sense when the park is within reach, so the peek
  // asks the phone where we are: once per minute, reusing the cached reading
  useEffect(() => {
    if (!peekOpen || !navigator.geolocation) return
    if (myFix && Date.now() - myFix.at < 60_000) return
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setMyFix({
          coords: [pos.coords.longitude, pos.coords.latitude],
          accuracy: pos.coords.accuracy ?? 30,
          at: Date.now(),
        }),
      () => {
        // no permission or no signal: then there is simply no CTA
      },
      { maximumAge: 60_000, timeout: 8000 },
    )
    // myFix in the deps would re-ask right after every answer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peekOpen, selectedId])

  // swipeable peek pages: park -> quest points -> parking
  const peekPages = useMemo<PeekPage[]>(() => {
    if (!selected) return []
    const pois = questForPark(selected.id)?.pois ?? []
    const pages: PeekPage[] = [{ t: 'park' }, ...pois.map((poi) => ({ t: 'poi' as const, poi }))]
    /* wszystkie parkingi jako strony: pin, ktory widzisz, ma miec swoja kartke */
    for (const parking of PARKING[selected.id] ?? []) pages.push({ t: 'parking', parking })
    return pages
  }, [selected])
  const page = peekPages[Math.min(peekIndex, Math.max(0, peekPages.length - 1))] ?? null
  const activePoiId = peekOpen && page?.t === 'poi' ? page.poi.id : null
  const activeParkingId = peekOpen && page?.t === 'parking' ? page.parking.id : null

  // quest dots follow the walk, or the selected quest park while browsing
  const overlayParkId = expedition?.parkId ?? (selected && questForPark(selected.id) ? selected.id : null)
  /*
   * Szlak rysujemy dla tego samego miejsca, dla ktorego pokazujemy punkty:
   * w trakcie wyprawy dla niej, poza wyprawa dla wybranego parku.
   */
  const trailOverlay = useMemo(() => {
    /* w trybie wyboru mapa pokazuje podglad, nie zapisany wybor */
    const list = overlayParkId ? trailsFor(overlayParkId) : []
    const t =
      pickTrail != null
        ? (list[pickTrail] ?? null)
        : trailById(overlayParkId ?? '', overlayParkId ? (trailChoice[overlayParkId] ?? null) : null)
    if (!t) return null
    return { line: t.line, ink: t.colour ? TRAIL_INK[t.colour] : undefined }
  }, [overlayParkId, trailChoice, pickTrail])

  const questOverlay = useMemo(() => {
    if (!overlayParkId) return null
    const quest = questForPark(overlayParkId)
    if (!quest) return null
    const collected = new Set(progress[overlayParkId]?.points ?? [])
    return {
      pois: quest.pois.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        coords: p.coords,
        collected: collected.has(p.id),
        active: p.id === activePoiId,
      })),
    }
  }, [overlayParkId, progress, activePoiId])

  /*
   * Piny udogodnien i parkingow slucha filtrow (MapFilters). Bierzemy je dla
   * overlayParkId, nie dla `selected`, zeby w trakcie wyprawy tez byly widoczne:
   * wtedy pytanie "gdzie kawa" i "gdzie stoi auto" jest najczestsze.
   */
  const amenityPins = useMemo(
    () =>
      overlayParkId
        ? amenitiesFor(overlayParkId)
            .map((a) => ({
              id: a.id,
              kind: (isFood(a.kind) ? 'food' : 'playground') as 'food' | 'playground',
              coords: a.coords,
            }))
            .filter((a) => (a.kind === 'food' ? filters.food : filters.play))
        : [],
    [overlayParkId, filters.food, filters.play],
  )

  const parkingPins = useMemo(
    () =>
      overlayParkId && filters.parking
        ? (PARKING[overlayParkId] ?? []).map((p) => ({
            id: p.id,
            coords: p.coords,
            active: p.id === activeParkingId,
          }))
        : [],
    [overlayParkId, filters.parking, activeParkingId],
  )

  /*
   * Pogoda dla listy miejsc. Bylo warunkowane otwarciem listy, ale arkusz miejsc
   * stoi teraz na ekranie glownym od pierwszej sekundy, wiec warunek zawsze byl
   * prawdziwy i tylko udawal oszczednosc. Jedno zapytanie po zaladowaniu:
   * Open-Meteo przyjmuje wszystkie 57 wspolrzednych naraz.
   */
  useEffect(() => {
    void getGlances(FEATURES.map((f) => ({ id: f.id, coords: f.properties.center }))).then(
      setGlances,
    )
  }, [])

  const flyToPark = useCallback((f: ParkFeature, bottomPx: number) => {
    setFocus({
      center: f.properties.center,
      areaHa: f.properties.areaHa,
      ts: Date.now(),
      bottomPadding: bottomPx,
    })
  }, [])

  const flyToSlide = useCallback(
    (target: PeekPage) => {
      if (!selected) return
      if (target.t === 'park') flyToPark(selected, 220)
      else {
        const coords = target.t === 'poi' ? target.poi.coords : target.parking.coords
        setFocus({ center: coords, zoom: 15.8, ts: Date.now(), bottomPadding: 220 })
      }
    },
    [selected, flyToPark],
  )

  const clearSelection = useCallback(() => {
    setAmenitySpotId(null)
    setSelectedId(null)
    setPeekIndex(0)
    setExpanded(false)
  }, [])

  const selectParkFromMapRef = useRef<((id: string) => void) | null>(null)

  /**
   * „Pokaż na mapie” z dowolnego ekranu. Zamyka KAŻDĄ warstwę, nie tylko tę, z
   * której kliknąłeś: kolekcja pieczątek zostawała otwarta i zasłaniała mapę, więc
   * apka odlatywała do parku, którego nie było widać.
   */
  const showOnMap = useCallback(
    (id: string) => {
      setStampParkId(null)
      setStampsOpen(false)
      setMenuOpen(false)
      // arkusz nie znika, tylko sklada sie do wystawania: ma byc, gdy wrocisz
      setListWide(false)
      setJourneyId(null)
      setStatsOpen(false)
      setJourneysOpen(false)
      selectParkFromMapRef.current?.(id)
    },
    [],
  )

  // map tap on a park: peek while browsing, the full sheet during a walk
  const selectParkFromMap = useCallback(
    (id: string) => {
      setAmenitySpotId(null)
      setSelectedId(id)
      setPeekIndex(0)
      setExpanded(onWalk)
      const f = FEATURES.find((x) => x.id === id)
      if (f) flyToPark(f, onWalk ? Math.round(window.innerHeight * 0.42) : 220)
    },
    [flyToPark, onWalk],
  )
  selectParkFromMapRef.current = selectParkFromMap

  const openFromList = (f: ParkFeature) => {
    setAmenitySpotId(null)
    setListWide(false)
    setSelectedId(f.id)
    setPeekIndex(0)
    setExpanded(true)
    flyToPark(f, Math.round(window.innerHeight * 0.42))
  }

  const onReveal = useCallback(
    (poi: QuestPoi) => {
      const parkId = expedition?.parkId ?? selectedId
      if (parkId) setReveal({ parkId, poi })
    },
    [expedition?.parkId, selectedId],
  )

  /** within sight: a nudge to look around, gone on its own after a moment */
  const onNear = useCallback((poi: QuestPoi, distance: number) => {
    // a heads-up about the next point beats an arrival notice already read
    setArrival(null)
    setNearNotice({ poi, distance })
  }, [])

  /**
   * Arrived. The point is already counted by the engine, so this only offers
   * the story: reading can wait for a bench, or for home.
   */
  const onArrive = useCallback(
    (poi: QuestPoi) => {
      const parkId = expedition?.parkId
      if (!parkId) return
      setNearNotice(null)
      setArrival({ parkId, poi })
      // the phone may be in a pocket with the app merely hidden, not closed
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        void navigator.serviceWorker?.ready
          .then((reg) =>
            reg.showNotification('Jesteś na miejscu', {
              body: poi.name,
              icon: `${import.meta.env.BASE_URL}icon-192.png`,
              tag: `poi-${poi.id}`,
            }),
          )
          .catch(() => {})
      }
    },
    [expedition?.parkId],
  )

  // pin tap: swap the peek page while browsing, open the full card otherwise
  const onSelectPoi = useCallback(
    (poiId: string) => {
      if (!overlayParkId) return
      /*
       * Zaznaczone jest zawsze jedno miejsce. Karta kawiarni albo placu zabaw
       * opisuje TO, co wskazałeś, więc wybór czegokolwiek innego musi ją zdjąć,
       * inaczej na dole zostaje kartka o placu, a na mapie świeci już tężnia.
       */
      setAmenitySpotId(null)
      const quest = questForPark(overlayParkId)
      const idx = quest?.pois.findIndex((p) => p.id === poiId) ?? -1
      if (idx < 0) return
      if (onWalk || expanded) {
        setPoiCard({ parkId: overlayParkId, poi: quest!.pois[idx] })
      } else {
        setPeekIndex(1 + idx)
        flyToSlide({ t: 'poi', poi: quest!.pois[idx] })
      }
    },
    [overlayParkId, onWalk, expanded, flyToSlide],
  )

  const onSelectParking = useCallback(
    (id?: string) => {
      if (!selected) return
      setAmenitySpotId(null)
      const idx = id ? peekPages.findIndex((p) => p.t === 'parking' && p.parking.id === id) : -1
      const page = idx >= 0 ? peekPages[idx] : null
      if (peekOpen && page?.t === 'parking') {
        setPeekIndex(idx)
        flyToSlide(page)
      } else {
        setParkingOpen(true)
      }
    },
    [selected, peekOpen, peekPages, flyToSlide],
  )

  const onPageSwipe = useCallback(
    (dir: 1 | -1) => {
      const next = Math.max(0, Math.min(peekPages.length - 1, peekIndex + dir))
      if (next === peekIndex) return
      setAmenitySpotId(null)
      setPeekIndex(next)
      flyToSlide(peekPages[next])
    },
    [peekIndex, peekPages, flyToSlide],
  )

  const journeys = useGameState().journeys
  const stampPark = stampParkId ? (FEATURES.find((f) => f.id === stampParkId) ?? null) : null
  const summaryJourney = summaryId ? (journeys.find((j) => j.id === summaryId) ?? null) : null
  const summaryPark = summaryJourney
    ? FEATURES.find((f) => f.id === summaryJourney.parkId)
    : null
  const journey = journeyId ? (journeys.find((j) => j.id === journeyId) ?? null) : null
  const journeyPark = journey ? FEATURES.find((f) => f.id === journey.parkId) : null

  // photo pins belong to a walk: on the everyday map they would be clutter
  const updateReady = useUpdateAvailable()
  const [updateHidden, setUpdateHidden] = useState(false)
  const walkMarks = useMarks()

  /*
   * Ile wyzwań zrobionych, na podpis w menu. Liczone tu, a nie w ekranie, bo
   * podpis ma mówić coś, zanim tam wejdziesz: półka bez liczby to półka, na
   * którą nie ma powodu zaglądać.
   */
  const challengeDone = useMemo(
    () =>
      challengeStates({
        parks: progress,
        journeys,
        answers,
        marks: walkMarks,
      }).filter((c) => c.done).length,
    [progress, journeys, answers, walkMarks],
  )

  /*
   * Zdjęć konkretnej kawiarni czy placu zabaw nie ma w Wikimedia Commons i nie
   * będzie. Ale Ty tam bywasz: zdjęcia zrobione w promieniu 80 metrów od tego
   * pinu są jego zdjęciami i z czasem tych miejsc będzie coraz więcej.
   */
  const spotPhotos = useMemo(() => {
    if (!activeSpot) return []
    return walkMarks.filter(
      (m) => m.kind === 'photo' && m.url && m.coords && distanceM(m.coords, activeSpot.coords) <= 80,
    )
  }, [walkMarks, activeSpot])

  const shownWalkId = expedition?.id ?? null
  /* auto zapisane w tej wyprawie: dystans liczymy raz i podajemy liście punktów */
  const carAway = useMemo(() => {
    const here = expedition?.where?.coords ?? myFix?.coords ?? null
    if (!here || !expedition) return null
    const car = walkMarks.find((m) => m.kind === 'car' && m.journeyId === expedition.id && m.coords)
    return car?.coords ? distanceM(here, car.coords) : null
  }, [walkMarks, expedition, myFix])
  const photoPins = useMemo(
    () =>
      shownWalkId
        ? walkMarks
            .filter((m) => m.journeyId === shownWalkId && m.coords)
            .map((m) => ({
              id: m.id,
              kind: m.kind,
              coords: m.coords as [number, number],
              blob: m.blob,
            }))
        : [],
    [walkMarks, shownWalkId],
  )
  const openPhoto = photoId ? (walkMarks.find((m) => m.id === photoId) ?? null) : null

  const sortedParks = useMemo(
    () => [...FEATURES].sort((a, b) => a.properties.name.localeCompare(b.properties.name, 'pl')),
    [],
  )

  const groupOf = (f: ParkFeature) => f.properties.group ?? 'parki'

  /*
   * Lista układa się tak, jak podejmuje się decyzję: najbliższe najpierw, w
   * trzech kubełkach według stanu. Alfabet był najgorszą możliwą kolejnością,
   * bo nazwa nie mówi ani gdzie to jest, ani czy tam już byłeś.
   */
  const LIST_GROUPS = [
    { key: 'started' as const, label: 'Zaczęte' },
    { key: 'fresh' as const, label: 'Nietknięte' },
    { key: 'done' as const, label: 'Zdobyte' },
  ]
  /*
   * Wyszukiwarka miejsc (Jarek: „chciałbym mieć wyszukiwarkę parków na
   * listingu").
   *
   * Dwie decyzje, które w niej siedzą. Pierwsza: **szukanie omija zakładki i
   * grupy**. Jeśli wpisujesz „będkow", to chcesz to znaleźć, a nie dowiedzieć
   * się, że jest w drugiej zakładce. Druga: **bez ogonków**. Na telefonie nikt
   * nie przytrzymuje litery, żeby wpisać ę, więc „bedkow" musi znajdować
   * „Będkowską", a nie zwracać pustą listę.
   */
  const [query, setQuery] = useState('')
  const plain = (t: string) =>
    t
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/ł/g, 'l')
      .toLowerCase()
  const needle = plain(query.trim())

  const shownParks = useMemo(() => {
    if (needle.length > 0) {
      /* szukanie po nazwie i po rodzaju miejsca: „dolina" ma znajdować dolinki */
      return sortedParks.filter(
        (f) =>
          plain(f.properties.name).includes(needle) ||
          plain(KIND_META[f.properties.kind]?.label ?? '').includes(needle),
      )
    }
    return listTab === 'all' ? sortedParks : sortedParks.filter((f) => groupOf(f) === listTab)
  }, [sortedParks, listTab, needle])
  const grouped = useMemo(() => {
    const rows = shownParks.map((f) => {
      const p = progress[f.id]
      const visited = !!p
      const total = pointsTotal(f.id)
      const earned = questForPark(f.id) ? (p?.points.length ?? 0) : visited ? 1 : 0
      const done = completedIds.has(f.id)
      const spots = amenitiesFor(f.id)
      return {
        f,
        earned,
        total,
        done,
        visited,
        hasPlay: spots.some((a) => !isFood(a.kind)),
        hasFood: spots.some((a) => isFood(a.kind)),
        away: myFix ? distanceToParkM(myFix.coords, f.geometry) : null,
      }
    })
    const order = (a: (typeof rows)[number], b: (typeof rows)[number]) =>
      a.away != null && b.away != null
        ? a.away - b.away
        : a.f.properties.name.localeCompare(b.f.properties.name, 'pl')
    return {
      started: rows.filter((r) => r.visited && !r.done).sort(order),
      fresh: rows.filter((r) => !r.visited).sort(order),
      done: rows.filter((r) => r.done).sort(order),
    }
  }, [shownParks, progress, completedIds, myFix])

  const LIST_TABS = useMemo(
    () => [
      { value: 'all' as const, label: 'Wszystkie' },
      { value: 'dolinki' as const, label: 'Dolinki' },
      { value: 'parki' as const, label: 'Parki' },
    ],
    [],
  )

  return (
    <div
      className={`app-shell${onWalk ? ' -walking' : ''}`}
      /*
       * Ile pikseli u dołu jest już zajęte. Jedna zmienna, z której korzystają
       * wszystkie rzeczy przyklejone do dolnej krawędzi, bo Jarek zobaczył, jak
       * arkusz miejsc nachodzi na komunikat o aktualizacji.
       *
       * Przyczyna była podwójna: komunikaty stały niżej w kolejności warstw niż
       * arkusz (95 wobec 100), więc chowały się ZA nim, a odstępy od dołu były
       * wpisane na sztywno jako 76, dobrane pod pasek wyprawy, którego wtedy nie
       * ma. Zamiast dopisywać kolejne liczby: jedna zmienna, ustawiana tam, gdzie
       * wiadomo, co stoi na dole.
       *
       * Bierzemy wysokość WYSTAWANIA arkusza, nie jego aktualną: komunikat nie
       * ma gonić rozwijanego arkusza w górę, bo wtedy skacze po ekranie.
       *
       * 76 px dla karty miejsca i paska wyprawy to ta sama liczba, która była
       * wcześniej wpisana w pięć miejsc z osobna. Nie jest lepsza, jest w jednym
       * miejscu.
       */
      style={{
        ['--pk-bottom-taken' as string]: dockUp
          ? `${DOCK_PEEK}px`
          : selected || expedition
            ? '76px'
            : '0px',
      }}
    >
      <MapView
        visited={visitedIds}
        onSelect={selectParkFromMap}
        onSelectPoi={onSelectPoi}
        parking={parkingPins}
        onSelectParking={onSelectParking}
        onClearSelection={clearSelection}
        focus={focus}
        quest={questOverlay}
        trail={filters.trail ? trailOverlay : null}
        track={expedition?.track ?? null}
        me={
          expedition?.where ??
          (myFix ? { coords: myFix.coords, accuracy: myFix.accuracy, course: null } : null)
        }
        followMe={onWalk && followMe}
        onUserPan={() => setFollowMe(false)}
        mapStyle={mapStyleSpec}
        stampPins={stampPins}
        onSelectStamp={selectParkFromMap}
        amenityPins={amenityPins}
        activeAmenityId={amenitySpotId}
        onSelectAmenity={(kind, id) => {
          // klik w pin: pokaż to jedno miejsce, nie całą listę kategorii
          if (id) pickAmenity(id)
          else setAmenityKind(kind)
        }}
        hideStampFor={overlayParkId}
        /*
         * Reflektor swieci tez sam z siebie w trakcie wyprawy. Dotad wlaczal sie
         * tylko po wybraniu miejsca, wiec po starcie wyprawy mapa wracala do
         * stanu "wszystkie parki rowne", a przez cala wyprawe interesuje cie
         * jedno miejsce: to, po ktorym chodzisz. Wybor recznie zrobiony wygrywa,
         * bo wtedy sam poprosiles o co innego.
         */
        focusId={selectedId ?? expedition?.parkId ?? null}
        photoPins={photoPins}
        onSelectPhoto={setPhotoId}
        placingPhoto={!!movingPhotoId}
        onPlacePhoto={(coords) => {
          if (movingPhotoId) void updateMark(movingPhotoId, { coords })
          setMovingPhotoId(null)
        }}
      />
      <ExpeditionController onNear={onNear} onArrive={onArrive} />

      {/* nothing on the left when not walking: a percentage of a city is a
          number, not a reason to go outside. Something may earn this corner
          later; until then the map has it */}
      <header className="app-hud">
        {/* filtry po lewej, menu po prawej: rodzenstwo na tej samej wysokosci */}
        <MapFilters show={!!selected || onWalk} />
        {/*
        Pasek pobierania mapy. Nad wszystkim i u samej gory, bo to jedyna rzecz w
        apce, ktora dzieje sie dalej po zamknieciu widoku, w ktorym ja zaczeto.
      */}
      <DownloadStatus />

      <button className="app-profilebtn pk-press" aria-label="Menu" onClick={() => setMenuOpen(true)}>
          <Menu strokeWidth={2} />
        </button>
      </header>

      {onWalk && expeditionPark && pickTrail != null ? (
        /*
         * Tryb wyboru szlaku: mapa zostaje, akcje wyprawy schodza, a w ich miejscu
         * jest pasek z jedna trasa i ptaszkiem. Po wyborze wszystko wraca.
         */
        <TrailPicker
          trails={trailsFor(expeditionPark.id)}
          index={pickTrail}
          onIndex={(next) => {
            setPickTrail(next)
            const t = trailsFor(expeditionPark.id)[next]
            /* kadr idzie za trasa: przesuniecie palcem ma pokazac, gdzie ona jest */
            if (t?.line?.length) {
              const lons = t.line.map((c) => c[0])
              const lats = t.line.map((c) => c[1])
              const span = Math.max(Math.max(...lons) - Math.min(...lons), Math.max(...lats) - Math.min(...lats))
              setFocus({
                center: [(Math.min(...lons) + Math.max(...lons)) / 2, (Math.min(...lats) + Math.max(...lats)) / 2],
                zoom: span > 0.05 ? 12.4 : span > 0.02 ? 13.4 : span > 0.008 ? 14.6 : 15.6,
                ts: Date.now(),
                bottomPadding: 220,
              })
            }
          }}
          onPick={(t) => {
            chooseTrail(expeditionPark.id, t.id)
            setPickTrail(null)
          }}
          onClose={() => setPickTrail(null)}
        />
      ) : onWalk && expeditionPark ? (
        <>
          <ExpeditionBar
            onRequestStop={() => setEndingWalk(true)}
            onPhoto={setPhotoAdded}
            onMark={setPhotoId}
            onOpenPoints={expeditionQuest ? () => setPointsOpen(true) : undefined}
            onCheckPlant={plantEnabled() ? () => setPlantCam(true) : undefined}
            targetId={targetPoiId}
            heading={heading}
            spotCard={
              activeSpot ? (
                <SpotCard
                  spot={activeSpot}
                  parkId={selected?.id}
                  placeName={selected?.properties.name}
                  photos={spotPhotos}
                  onOpenPhoto={setPhotoId}
                  onClose={() => setAmenitySpotId(null)}
                />
              ) : null
            }
          />
        </>
      ) : null}

      {looksOpen && (
        <>
          <button
            className="app-looks__catch"
            aria-label="Zamknij wybór mapy"
            onClick={() => setLooksOpen(false)}
          />
          <div className="app-looks" role="radiogroup" aria-label="Styl mapy">
            {MAP_STYLES.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={opt.id === mapStyle}
                className={`app-lookopt${opt.id === mapStyle ? ' -on' : ''}`}
                onClick={() => {
                  pickMapStyle(opt.id)
                  setLooksOpen(false)
                }}
              >
                <span
                  className="app-lookopt__swatch"
                  style={{
                    background: `linear-gradient(135deg, ${opt.swatch[0]} 45%, ${opt.swatch[1]})`,
                  }}
                />
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        className={`app-look pk-press${looksOpen ? ' -on' : ''}`}
        aria-label="Zmień wygląd mapy"
        aria-expanded={looksOpen}
        onClick={() => setLooksOpen((v) => !v)}
      >
        <Layers size={18} />
      </button>

      <button
        className="app-locate pk-press"
        aria-label="Pokaż, gdzie jestem"
        onClick={() => {
          if (onWalk) setFollowMe(true)
          if (!navigator.geolocation) return
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords: Pt = [pos.coords.longitude, pos.coords.latitude]
              setMyFix({ coords, accuracy: pos.coords.accuracy ?? 30, at: Date.now() })
              setFocus({ center: coords, zoom: 16.4, ts: Date.now() })
            },
            () => {
              // no permission, no position: nothing to centre on
            },
            { enableHighAccuracy: true, maximumAge: 15_000, timeout: 8000 },
          )
        }}
      >
        {onWalk && !followMe ? <Crosshair size={19} /> : <LocateFixed size={19} />}
      </button>

      <PeekCard
        open={peekOpen && !activeSpot}
        onDismiss={clearSelection}
        page={peekIndex}
        pages={peekPages.length}
        onPageSwipe={peekPages.length > 1 ? onPageSwipe : undefined}
        onExpand={() => {
          setExpanded(true)
          if (selected) flyToPark(selected, Math.round(window.innerHeight * 0.42))
        }}
        action={
          /*
           * Dwa przyciski zawsze, start jako CTA po prawej. Wcześniej start
           * pokazywał się tylko blisko parku, więc z domu widziałeś jeden przycisk
           * i nie dało się zacząć wyprawy przed dojazdem. Karta wyprawy radzi
           * sobie z odległością sama: mówi „do parku" i podaje dystans.
           */
          <div className="app-peekactions">
            <Button
              full
              variant="tonal"
              onClick={() => {
                setExpanded(true)
                if (selected) flyToPark(selected, Math.round(window.innerHeight * 0.42))
              }}
            >
              Szczegóły
            </Button>
            <Button
              full
              icon={<Compass size={18} />}
              onClick={() => {
                if (!selected) return
                beginWalk(selected.id, selected.properties.name)
                clearSelection()
              }}
            >
              Rozpocznij
            </Button>
          </div>
        }
      >
        {selected && page?.t === 'poi' ? (
          <PoiPeekContent
            poi={page.poi}
            collected={(progress[selected.id]?.points ?? []).includes(page.poi.id)}
            onOpen={() => setPoiCard({ parkId: selected.id, poi: page.poi })}
          />
        ) : selected && page?.t === 'parking' ? (
          <ParkingPeekContent parking={page.parking} onOpen={() => setParkingOpen(true)} />
        ) : selected ? (
          <ParkPeekContent
            park={selected}
            earned={questForPark(selected.id) ? (progress[selected.id]?.points.length ?? 0) : visitedIds.has(selected.id) ? 1 : 0}
            total={pointsTotal(selected.id)}
          />
        ) : null}
      </PeekCard>

      {/*
        Arkusz miejsc jest OTWARTY, a nie schowany za przyciskiem (Jarek: „zamiast
        przycisku Miejsca widać bottom sheet otwarty z miejscami, gdzie widać
        półtorej celki z parkami, można to rozwijać"). To zresztą dopiero teraz
        zgadza się z briefem: „pełnoekranowa mapa fog-of-war + bottom sheet z
        kartami parków".
        Wysokość wystawania jest z pomiaru, nie na oko: wiersz miejsca ma 76 px,
        więc półtora wiersza to 114, a z chwytem i jedną linijką podpisu wychodzi
        174. Zmierzone po zmianie: 1,50 komórki.
        Nagłówek DS (84) i zakładki (44) czekają do rozwinięcia, bo przy 174
        pikselach zjadłyby całe miejsce na miejsca.
        Znika tylko wtedy, gdy dół należy do czegoś innego: do karty wybranego
        miejsca albo do paska wyprawy. Jedna powierzchnia na raz.
      */}
      <BottomSheet
        open={dockUp}
        onClose={() => undefined}
        modal={false}
        minHeight={DOCK_PEEK}
        /*
         * Menu prosi o pelna liste zmiana tej wartosci: DS przy jej zmianie
         * ustawia zatrzask od nowa, wiec nie trzeba drugiego mechanizmu.
         */
        openAt={listWide ? 'full' : 'min'}
        onDetent={(d) => {
          setListDetent(d)
          // przeciagnales w dol: nie jestesmy juz "rozwinieci z menu"
          if (d === 'min') setListWide(false)
        }}
        title="Wszystkie parki"
      >
        {/*
          Tytuł, szukanie i zakładki widać od razu, bez rozwijania: to one
          zamieniają wystający arkusz z podglądu listy w narzędzie. Podpis
          „Miejsca blisko Ciebie" stał tu zamiast tytułu i wypadł razem z
          powodem, dla którego istniał.
        */}
        <label className="app-search">
          <Search size={17} aria-hidden="true" />
          <input
            className="app-search__field"
            type="search"
            value={query}
            placeholder="Szukaj miejsca"
            aria-label="Szukaj miejsca"
            /*
             * Dotknięcie pola rozwija arkusz na pełną wysokość, i to nie jest
             * uprzejmość, tylko konieczność (Jarek: „jak mam wyszukiwarkę
             * zaznaczoną, to niech rozciąga się do góry ekranu, żebym podczas
             * wpisywania widział wyniki na telefonie"). Na telefonie klawiatura
             * zajmuje dolną połowę, więc przy wystawaniu na 290 px wyników nie
             * byłoby widać wcale: wpisujesz w ciemno.
             */
            onFocus={() => setListWide(true)}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="app-search__clear" aria-label="Wyczyść" onClick={() => setQuery('')}>
              <X size={15} />
            </button>
          )}
        </label>
        {/* zakladki nie maja sensu przy szukaniu: wynik idzie po wszystkim */}
        {!needle && (
          <Segmented
            className="app-listtabs"
            options={LIST_TABS}
            value={listTab}
            onChange={setListTab}
            aria-label="Rodzaj miejsc"
          />
        )}
        {needle && (
          <p className="t-caption app-search__count">
            {shownParks.length === 0
              ? 'Nic takiego nie ma na liście.'
              : `${shownParks.length} ${
                  shownParks.length === 1 ? 'miejsce' : shownParks.length < 5 ? 'miejsca' : 'miejsc'
                }`}
          </p>
        )}
        {LIST_GROUPS.map((group) => {
          const rows = grouped[group.key]
          if (!rows.length) return null
          return (
            <section key={group.key} className="app-listgroup">
              {/* naglowek grupy zabralby polowe wystajacego arkusza, wiec czeka;
                  przy szukaniu nie ma go wcale, bo wynik nie jest przegladaniem */}
              {listDetent !== 'min' && !needle && (
                <h3 className="t-title app-listgroup__head">
                  {group.label} <span className="app-listgroup__count">{rows.length}</span>
                </h3>
              )}
              <List className="app-parklist">
                {rows.map(({ f, earned, total, done, visited, hasPlay, hasFood }) => (
                  <ListItem
                    key={f.id}
                    photo={{ src: asset(heroPhoto(f.id) ?? photosForPark(f.id)[0]?.src ?? ''), alt: '' }}
                    title={f.properties.name}
                    meta={
                      done
                        ? 'zdobyte'
                        : questForPark(f.id)
                          ? visited
                            ? `${earned} z ${total} punktów`
                            : `${total} ${plPunkty(total)} do odkrycia`
                          : visited
                            ? 'odwiedzone'
                            : 'jeszcze nieodkryte'
                    }
                    metaExtra={
                      hasPlay || hasFood ? (
                        <>
                          {hasPlay && <ToyBrick aria-label="plac zabaw" />}
                          {hasFood && <Coffee aria-label="kawa albo jedzenie" />}
                        </>
                      ) : undefined
                    }
                    /*
                     * Pogoda zamiast pierscienia postepu. Ten sam powod, co przy
                     * karcie podgladu: postep stoi obok slowami („2 z 5 punktow"),
                     * a pusty pierscien nie mowil nic o miejscu. Stopnie i niebo
                     * odpowiadaja na pytanie, ktore w niedziele rano decyduje.
                     */
                    trailing={(() => {
                      const g = glances[f.id]
                      if (!g) return undefined
                      const s = sky(g.code)
                      return (
                        <span className="app-wchip" title={s.label}>
                          <span className={`app-wchip__icon -${s.sky}`} aria-hidden="true">
                            {SKY_ICONS[s.sky]}
                          </span>
                          <span className="app-wchip__temp">{g.temp}°</span>
                          {g.rain >= 50 && (
                            <span className="app-wchip__rain">{g.rain}%</span>
                          )}
                        </span>
                      )
                    })()}
                    onClick={() => openFromList(f)}
                  />
                ))}
              </List>
            </section>
          )
        })}
      </BottomSheet>

      <ParkSheet
        park={expanded ? selected : null}
        onClose={() => setExpanded(false)}
        onPhotoSaved={setPhotoId}
        onReveal={onReveal}
        onOpenPoi={(poi) => selected && setPoiCard({ parkId: selected.id, poi })}
        onOpenParking={() => setParkingOpen(true)}
        onOpenAmenity={setAmenityKind}
        onOpenTrails={() => setTrailsOpen(true)}
      />
      {selected && (
        <ParkingModal
          parkId={selected.id}
          parkName={selected.properties.name}
          open={parkingOpen}
          onClose={() => setParkingOpen(false)}
        />
      )}
      <PlantCamera
        open={plantCam}
        onClose={() => setPlantCam(false)}
        onSave={
          expedition
            ? (blob, caption) => {
                /* rozpoznanie zostaje w dzienniku wyprawy jako zdjecie z podpisem */
                void addMark({
                  kind: 'photo',
                  parkId: expedition.parkId,
                  journeyId: expedition.id,
                  coords: expedition.where?.coords ?? expedition.track[expedition.track.length - 1],
                  caption,
                  blob,
                })
              }
            : undefined
        }
      />

      {/* w trakcie wyprawy nie ma wybranego parku, a szlak trzeba dac zmienic */}
      {(() => {
        const tp = selected ?? expeditionPark
        if (!tp) return null
        return (
          <TrailModal
            parkId={tp.id}
            parkName={tp.properties.name}
            open={trailsOpen}
            onClose={() => setTrailsOpen(false)}
          />
        )
      })()}
      {stampPark && (
        <StampScreen
          park={stampPark}
          onClose={() => setStampParkId(null)}
          onGoToPark={showOnMap}
        />
      )}

      {journey && journeyPark && (
        <JourneyScreen
          journey={journey}
          parkName={journeyPark.properties.name}
          onClose={() => setJourneyId(null)}
        />
      )}

      {endingWalk && (
        <EndWalkSheet
          onClose={() => setEndingWalk(false)}
          onConfirm={() => {
            const finished = expedition?.id ?? null
            stopExpedition()
            setEndingWalk(false)
            setFollowMe(true)
            // the stamp goes first, the summary waits its turn below
            setSummaryId(finished)
          }}
        />
      )}

      {summaryId && !celebrate && summaryJourney && summaryPark && (
        <WalkSummary
          journey={summaryJourney}
          parkName={summaryPark.properties.name}
          onOpenJourney={() => {
            setSummaryId(null)
            setJourneyId(summaryJourney.id)
          }}
          onClose={() => setSummaryId(null)}
        />
      )}

      {openPhoto && !movingPhotoId && (
        <MarkSheet
          mark={openPhoto}
          onClose={() => setPhotoId(null)}
          onMove={() => {
            setMovingPhotoId(openPhoto.id)
            setPhotoId(null)
          }}
        />
      )}

      {refreshInfo && (
        <Toast
          open
          onClose={() => setRefreshInfo(null)}
          tone={refreshInfo.nowa ? 'reward' : 'info'}
          icon={<RefreshCw size={18} />}
          title={refreshInfo.nowa ? `Nowa wersja ${VERSION}` : 'Brak zmian'}
          /*
           * Po odświeżeniu mówimy CO przyszło, a nie tylko że coś przyszło:
           * numer wersji nie jest informacją. Jedna linijka na wersję, a przy
           * kilku naraz najnowsza plus ile jeszcze, bo to się czyta w biegu.
           */
          text={
            refreshInfo.nowa
              ? (() => {
                  const list = changesSince(refreshInfo.z)
                  if (list.length === 0) return `Było ${refreshInfo.z}, jest ${VERSION}`
                  if (list.length === 1) return list[0]
                  return `${list[0]} Do tego ${list.length - 1} ${
                    list.length === 2 ? 'wersja' : list.length < 5 ? 'wersje' : 'wersji'
                  } wcześniej.`
                })()
              : `Masz najnowszą wersję, ${VERSION}`
          }
          autoMs={9000}
        />
      )}

      {movingPhotoId && (
        <Toast
          open
          onClose={() => setMovingPhotoId(null)}
          icon={<Camera size={18} />}
          title="Dotknij mapy"
          text="Tam postawię ten pin ze zdjęciem"
        />
      )}

      {photoAdded && !openPhoto && (
        <Toast
          open
          onClose={() => setPhotoAdded(null)}
          tone="reward"
          icon={<Camera size={18} />}
          title="Zdjęcie zapisane"
          text="Pin stanął w miejscu, gdzie stoisz"
          actionLabel="Opisz"
          onAction={() => {
            setPhotoId(photoAdded)
            setPhotoAdded(null)
          }}
          autoMs={9000}
        />
      )}

      {updateReady && !updateHidden && !onWalk && !openPhoto && (
        <Toast
          open
          onClose={() => setUpdateHidden(true)}
          icon={<RefreshCw size={18} />}
          title="Jest nowsza wersja"
          text="Odświeżenie wczyta ją, postęp zostaje"
          actionLabel="Odśwież"
          onAction={() => window.location.reload()}
        />
      )}

      {onWalk && nearNotice && !arrival && (
        <Toast
          open
          onClose={() => setNearNotice(null)}
          icon={<Footprints size={18} />}
          title={`Blisko: ${nearNotice.poi.name}`}
          text={`${formatDistance(nearNotice.distance)} stąd, rozejrzyj się`}
          autoMs={8000}
        />
      )}

      {arrival && (
        <Toast
          open
          onClose={() => setArrival(null)}
          tone="reward"
          icon={<Sparkles size={18} />}
          title={arrival.poi.name}
          text="Punkt zaliczony, czeka historia"
          actionLabel="Czytaj"
          onAction={() => {
            setReveal(arrival)
            setArrival(null)
          }}
          autoMs={20000}
        />
      )}

      {reveal && (
        <RevealSheet
          parkId={reveal.parkId}
          poi={reveal.poi}
          onClose={() => setReveal(null)}
          onPhotoSaved={setPhotoId}
          onReadMore={(poi) => {
            const parkId = reveal.parkId
            setReveal(null)
            setPoiCard({ parkId, poi })
          }}
        />
      )}
      <PoiModal
        poi={poiCard?.poi ?? null}
        parkId={poiCard?.parkId ?? null}
        collected={poiCard ? (progress[poiCard.parkId]?.points ?? []).includes(poiCard.poi.id) : false}
        onClose={() => setPoiCard(null)}
      />
      {/*
        Menu jako trzy pieterka, nie jedna plaska lista (decyzja Jarka 2026-08-22).
        TY: co zrobiles. WYPRAWY: gdzie isc. USTAWIENIA: jak apka wyglada i czym
        jest. Duplikaty poszly precz: piecztaki mialy wiersz w menu i sekcje w
        profilu, wyglad mapy i aplikacji mialy po dwa wejscia (menu i profil).
        Lista miejsc zostaje tutaj mimo przycisku na mapie, bo w trakcie wyprawy
        ten przycisk nie istnieje i menu jest wtedy jedyna droga.
      */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <p className="t-caption app-menu__head">Ty</p>
        <List className="app-menu">
          <ListItem
            icon={<Route />}
            leadTone="accent"
            title="Moje liczby"
            meta={`${completedIds.size} ${plNaklejki(completedIds.size)}, ${journeys.length} ${plWyprawy(
              journeys.length,
            )}, ${visitedCount} ${plMiejsca(visitedCount)}`}
            trailing={<ChevronRight size={18} />}
            onClick={() => {
              setMenuOpen(false)
              setStatsOpen(true)
            }}
          />
          {/*
            "Osiagniecia", po drodze przez "Pieczatki", "Album" i "Wyzwania"
            (Jarek, 2026-08-22). Ostatnia nazwa byla zla z tego samego powodu, co
            pierwsza: mowila o JEDNYM rodzaju, a w srodku sa dwa rowne sobie.
            Osiagniecie jest parasolem, pieczatka i wyzwanie sa jego rodzajami,
            i dlatego siedza w dwoch zakladkach, a nie jedno pod drugim.
          */}
          <ListItem
            icon={<Award />}
            title="Osiągnięcia"
            meta={`${completedIds.size} ${
              completedIds.size === 1 ? 'pieczątka' : completedIds.size < 5 ? 'pieczątki' : 'pieczątek'
            }, ${challengeDone} z ${CHALLENGES.length} wyzwań`}
            trailing={<ChevronRight size={18} />}
            onClick={() => {
              setMenuOpen(false)
              setStampsOpen(true)
            }}
          />
          <ListItem
            icon={<Footprints />}
            title="Moje wyprawy"
            meta={
              journeys.length
                ? `${journeys.length} ${plZapisane(journeys.length)}, każda ze swoim śladem`
                : 'Jeszcze żadnej, zapisują się same po zakończeniu'
            }
            trailing={<ChevronRight size={18} />}
            onClick={() => {
              setMenuOpen(false)
              setJourneysOpen(true)
            }}
          />
        </List>

        {/*
          Polka "Miejsca", nie "Wyprawy" (Jarek, 2026-08-23: „moje wyprawy niech
          beda w sekcji Ty"). Po przeniesieniu wypraw zostalo tu jedno wejscie i
          jest ono o miejscach, nie o wyprawach, wiec nazwa polki poszla za
          trescia.
        */}
        <p className="t-caption app-menu__head">Miejsca</p>
        <List className="app-menu">
          <ListItem
            icon={<ListIcon />}
            title="Wszystkie parki"
            meta={`${FEATURES.length - 1} miejsc, ${completedIds.size} zdobytych`}
            trailing={<ChevronRight size={18} />}
            onClick={() => {
              setMenuOpen(false)
              setListWide(true)
            }}
          />
        </List>

        <p className="t-caption app-menu__head">Ustawienia</p>
        <List className="app-menu">
          <ListItem
            icon={<Palette />}
            title="Wygląd"
            meta="Motyw i styl mapy, z podglądem"
            trailing={<ChevronRight size={18} />}
            onClick={() => {
              setMenuOpen(false)
              setLooksModalOpen(true)
            }}
          />
          <ListItem
            icon={<Info />}
            title="O aplikacji"
            meta={`Wersja ${VERSION}, odświeżanie, katalog`}
            trailing={<ChevronRight size={18} />}
            onClick={() => {
              setMenuOpen(false)
              setAboutOpen(true)
            }}
          />
        </List>
      </BottomSheet>

      <StatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        onOpenPark={(id) => {
          setStatsOpen(false)
          showOnMap(id)
        }}
      />
      <JourneysModal
        open={journeysOpen}
        onClose={() => setJourneysOpen(false)}
        onOpenJourney={(id) => {
          setJourneysOpen(false)
          clearSelection()
          setJourneyId(id)
        }}
      />
      <LooksModal
        open={looksModalOpen}
        onClose={() => setLooksModalOpen(false)}
        mapStyle={mapStyle}
        onMapStyle={pickMapStyle}
      />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      {/* poza wyprawą karta miejsca stoi sama na dole; w trakcie wyprawy
          wchodzi w miejsce karty „co dalej", bo na dole ma być jedna rzecz */}
      {activeSpot && !onWalk && (
        <SpotCard
          spot={activeSpot}
          parkId={selected?.id}
          placeName={selected?.properties.name}
          photos={spotPhotos}
          onOpenPhoto={setPhotoId}
          onClose={() => setAmenitySpotId(null)}
        />
      )}

      {expeditionQuest && (
        <PointsSheet
          open={pointsOpen}
          onClose={() => setPointsOpen(false)}
          pois={expeditionQuest.pois}
          collected={new Set(progress[expeditionQuest.parkId]?.points ?? [])}
          here={expedition?.where?.coords ?? myFix?.coords ?? null}
          targetId={targetPoiId}
          carAway={carAway}
          trail={(() => {
            const t = trailById(expeditionQuest.parkId, trailChoice[expeditionQuest.parkId] ?? null)
            return t ? { name: t.name, m: t.m, min: t.min } : null
          })()}
          hasTrails={trailsFor(expeditionQuest.parkId).length > 0}
          onOpenTrails={() => {
            /*
             * W trakcie wyprawy nie otwieramy arkusza z kaflami, tylko wybor na
             * mapie: w terenie chcesz zobaczyc trase na mapie, po ktorej idziesz.
             * Arkusz (TrailModal) zostaje do planowania w domu.
             */
            setPointsOpen(false)
            const list = trailsFor(expeditionQuest.parkId)
            const current = list.findIndex((t) => t.id === trailChoice[expeditionQuest.parkId])
            setPickTrail(current >= 0 ? current : 0)
          }}
          onPick={(poiId) => {
            setTargetPoiId(poiId)
            setPointsOpen(false)
            /* zgoda na kompas tylko przy dotknięciu: iOS nie pozwala inaczej */
            void askHeading().then((ok) => setWantHeading(ok))
            const poi = expeditionQuest.pois.find((p) => p.id === poiId)
            if (poi) setFocus({ center: poi.coords, zoom: 16.6, ts: Date.now() })
          }}
        />
      )}

      {selected && (
        <AmenityModal
          parkId={selected.id}
          parkName={selected.properties.name}
          kind={amenityKind}
          onClose={() => setAmenityKind(null)}
          onPick={pickAmenity}
        />
      )}
      <AchievementsModal
        open={stampsOpen}
        onClose={() => setStampsOpen(false)}
        /* z kolekcji wchodzimy w kartę pieczątki: to tam jest napisane, za co jest */
        onPick={(id) => setStampParkId(id)}
      />
      <StampCelebration
        parkId={celebrate?.id ?? null}
        parkName={celebrate?.name ?? ''}
        onClose={() => setCelebrate(null)}
      />
    </div>
  )
}
