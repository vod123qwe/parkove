import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Camera, CircleUserRound, Compass, Crosshair, Footprints, Layers, List as ListIcon, LocateFixed, RefreshCw, Sparkles } from 'lucide-react'
import { BottomSheet, Button, List, ListItem, PeekCard, ProgressRing, Segmented, Toast } from '../ds'
import { MapView } from './MapView'
import type { MapFocus } from './MapView'
import { ParkSheet } from './ParkSheet'
import type { ParkFeature } from './ParkSheet'
import { PoiModal } from './PoiSheet'
import { ParkingModal } from './ParkingModal'
import { AmenityModal } from './AmenityModal'
import { ParkPeekContent, ParkingPeekContent, PoiPeekContent } from './PeekContents'
import { StampsModal } from './StampsModal'
import { StampCelebration } from './StampCelebration'
import { ProfileModal } from './ProfileModal'
import { AppearanceModal, MapStyleModal } from './SettingsModals'
import { ExpeditionController } from './ExpeditionController'
import { ExpeditionBar } from './ExpeditionBar'
import { ExpeditionStatus } from './ExpeditionStatus'
import { MarkSheet } from './MarkSheet'
import { updateMark, useMarks } from './photos'
import { RevealSheet } from './RevealSheet'
import { KIND_META } from './kinds'
import { distanceToParkM, formatDistance } from './geo'
import type { Pt } from './geo'
import { beginWalk } from './walk'
import { EndWalkSheet } from './EndWalkSheet'
import { JourneyScreen } from './JourneyScreen'
import { StampScreen } from './StampScreen'
import { WalkSummary } from './WalkSummary'
import { stopExpedition, useGameState } from './state'
import { isParkComplete } from './progress'
import { useUpdateAvailable } from './update'
import { MAP_STYLES, getMapStyle, resolveMapStyle, setMapStyle } from './data/mapstyles'
import type { MapStyleId } from './data/mapstyles'
import { suggestedParking } from './data/parking'
import { amenitiesFor, isFood } from './data/amenities'
import type { ParkingInfo } from './data/parking'
import { pointsTotal, questForPark } from './data/quests'
import type { QuestPoi } from './data/quests'
import parksData from './data/parks.json'
import './app.css'

const FEATURES = parksData.features as unknown as ParkFeature[]

type PeekPage =
  | { t: 'park' }
  | { t: 'poi'; poi: QuestPoi }
  | { t: 'parking'; parking: ParkingInfo }

export function App() {
  const { parks: progress, expedition } = useGameState()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [peekIndex, setPeekIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [parkingOpen, setParkingOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  /** which collection the list shows: everything, the day trips, or the city */
  const [listTab, setListTab] = useState<'all' | 'dolinki' | 'parki'>('all')
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
  const [profileOpen, setProfileOpen] = useState(false)
  const [stampsOpen, setStampsOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [mapStyleOpen, setMapStyleOpen] = useState(false)
  /** the quick switch on the map itself, for comparing looks in place */
  const [looksOpen, setLooksOpen] = useState(false)
  const [celebrate, setCelebrate] = useState<{ id: string; name: string } | null>(null)
  const [amenityKind, setAmenityKind] = useState<'food' | 'playground' | null>(null)
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
  const expeditionPark = expedition ? FEATURES.find((f) => f.id === expedition.parkId) : null
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

  /** walking distance where starting a walk is a real option */
  const NEAR_PARK_M = 300
  const nearSelected =
    !!selected && !!myFix && distanceToParkM(myFix.coords, selected.geometry) <= NEAR_PARK_M

  // swipeable peek pages: park -> quest points -> parking
  const peekPages = useMemo<PeekPage[]>(() => {
    if (!selected) return []
    const pois = questForPark(selected.id)?.pois ?? []
    const pages: PeekPage[] = [{ t: 'park' }, ...pois.map((poi) => ({ t: 'poi' as const, poi }))]
    const parking = suggestedParking(selected.id)
    if (parking) pages.push({ t: 'parking', parking })
    return pages
  }, [selected])
  const page = peekPages[Math.min(peekIndex, Math.max(0, peekPages.length - 1))] ?? null
  const activePoiId = peekOpen && page?.t === 'poi' ? page.poi.id : null
  const parkingActive = peekOpen && page?.t === 'parking'

  // quest dots follow the walk, or the selected quest park while browsing
  const overlayParkId = expedition?.parkId ?? (selected && questForPark(selected.id) ? selected.id : null)
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

  const amenityPins = useMemo(
    () =>
      selected
        ? amenitiesFor(selected.id).map((a) => ({
            id: a.id,
            kind: (isFood(a.kind) ? 'food' : 'playground') as 'food' | 'playground',
            coords: a.coords,
          }))
        : [],
    [selected],
  )

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
    setSelectedId(null)
    setPeekIndex(0)
    setExpanded(false)
  }, [])

  // map tap on a park: peek while browsing, the full sheet during a walk
  const selectParkFromMap = useCallback(
    (id: string) => {
      setSelectedId(id)
      setPeekIndex(0)
      setExpanded(onWalk)
      const f = FEATURES.find((x) => x.id === id)
      if (f) flyToPark(f, onWalk ? Math.round(window.innerHeight * 0.42) : 220)
    },
    [flyToPark, onWalk],
  )

  const openFromList = (f: ParkFeature) => {
    setListOpen(false)
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

  const onSelectParking = useCallback(() => {
    if (!selected) return
    const parking = suggestedParking(selected.id)
    if (peekOpen && parking) {
      setPeekIndex(peekPages.length - 1)
      flyToSlide({ t: 'parking', parking })
    } else {
      setParkingOpen(true)
    }
  }, [selected, peekOpen, peekPages.length, flyToSlide])

  const onPageSwipe = useCallback(
    (dir: 1 | -1) => {
      const next = Math.max(0, Math.min(peekPages.length - 1, peekIndex + dir))
      if (next === peekIndex) return
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
  const shownWalkId = expedition?.id ?? null
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
  const shownParks = useMemo(
    () => (listTab === 'all' ? sortedParks : sortedParks.filter((f) => groupOf(f) === listTab)),
    [sortedParks, listTab],
  )
  const LIST_TABS = useMemo(
    () => [
      { value: 'all' as const, label: 'Wszystkie' },
      { value: 'dolinki' as const, label: 'Dolinki' },
      { value: 'parki' as const, label: 'Parki' },
    ],
    [],
  )

  return (
    <div className="app-shell">
      <MapView
        visited={visitedIds}
        onSelect={selectParkFromMap}
        onSelectPoi={onSelectPoi}
        parking={selected ? (() => { const p = suggestedParking(selected.id); return p ? { coords: p.coords, active: parkingActive } : null })() : null}
        onSelectParking={onSelectParking}
        onClearSelection={clearSelection}
        focus={focus}
        quest={questOverlay}
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
        onSelectAmenity={setAmenityKind}
        hideStampFor={overlayParkId}
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
        {onWalk && <ExpeditionStatus />}
        <button className="app-profilebtn" aria-label="Profil" onClick={() => setProfileOpen(true)}>
          <CircleUserRound strokeWidth={1.75} />
        </button>
      </header>

      {onWalk && expeditionPark ? (
        <>
          <ExpeditionBar
            onRequestStop={() => setEndingWalk(true)}
            onPhoto={setPhotoAdded}
            onMark={setPhotoId}
          />
        </>
      ) : (
        !selected && (
          <div className="app-fab">
            <Button size="lg" icon={<ListIcon size={18} />} onClick={() => setListOpen(true)}>
              Miejsca
            </Button>
          </div>
        )
      )}

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
        className={`app-look${looksOpen ? ' -on' : ''}`}
        aria-label="Zmień wygląd mapy"
        aria-expanded={looksOpen}
        onClick={() => setLooksOpen((v) => !v)}
      >
        <Layers size={18} />
      </button>

      <button
        className="app-locate"
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
        open={peekOpen}
        onDismiss={clearSelection}
        page={peekIndex}
        pages={peekPages.length}
        onPageSwipe={peekPages.length > 1 ? onPageSwipe : undefined}
        onExpand={() => {
          setExpanded(true)
          if (selected) flyToPark(selected, Math.round(window.innerHeight * 0.42))
        }}
        action={
          <div className="app-peekactions">
            <Button
              full
              variant="tonal"
              onClick={() => {
                setExpanded(true)
                if (selected) flyToPark(selected, Math.round(window.innerHeight * 0.42))
              }}
            >
              {nearSelected ? 'Szczegóły' : 'Zobacz szczegóły miejsca'}
            </Button>
            {nearSelected && (
              <Button
                full
                icon={<Compass size={18} />}
                onClick={() => {
                  if (!selected) return
                  beginWalk(selected.id, selected.properties.name)
                  clearSelection()
                }}
              >
                Zacznij wyprawę
              </Button>
            )}
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

      <BottomSheet open={listOpen} onClose={() => setListOpen(false)} title="Miejsca do odkrycia">
        {/* the city and the day trips are different kinds of outing, so they get
            their own tabs rather than one long mixed list */}
        <Segmented
          className="app-listtabs"
          options={LIST_TABS}
          value={listTab}
          onChange={setListTab}
          aria-label="Rodzaj miejsc"
        />
        <List className="app-parklist">
          {shownParks.map((f) => {
            const p = progress[f.id]
            const visited = !!p
            const kind = KIND_META[f.properties.kind] ?? KIND_META.park
            const quest = questForPark(f.id)
            const total = pointsTotal(f.id)
            const earned = quest ? (p?.points.length ?? 0) : visited ? 1 : 0
            const done = earned >= total
            return (
              <ListItem
                key={f.id}
                icon={kind.icon}
                leadTone={done ? 'gold' : visited ? 'accent' : 'neutral'}
                title={f.properties.name}
                meta={`${kind.label} · ${String(f.properties.areaHa).replace('.', ',')} ha${quest ? ` · quest ${earned}/${total}` : ''}`}
                trailing={<ProgressRing value={(earned / total) * 100} size="sm" />}
                onClick={() => openFromList(f)}
              />
            )
          })}
        </List>
      </BottomSheet>

      <ParkSheet
        park={expanded ? selected : null}
        onClose={() => setExpanded(false)}
        onPhotoSaved={setPhotoId}
        onReveal={onReveal}
        onOpenPoi={(poi) => selected && setPoiCard({ parkId: selected.id, poi })}
        onOpenParking={() => setParkingOpen(true)}
        onOpenAmenity={setAmenityKind}
      />
      {selected && (
        <ParkingModal
          parkId={selected.id}
          parkName={selected.properties.name}
          open={parkingOpen}
          onClose={() => setParkingOpen(false)}
        />
      )}
      {stampPark && (
        <StampScreen
          park={stampPark}
          onClose={() => setStampParkId(null)}
          onGoToPark={(id) => {
            setStampParkId(null)
            setProfileOpen(false)
            selectParkFromMap(id)
          }}
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

      {movingPhotoId && (
        <Toast
          open
          onClose={() => setMovingPhotoId(null)}
          icon={<Camera size={18} />}
          title="Dotknij mapy"
          text="Tam postawię ten pin ze zdjęciem"
          offset={76}
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
          offset={76}
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
          offset={76}
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
          offset={76}
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
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        parks={FEATURES}
        visitedCount={visitedCount}
        onOpenStamps={() => setStampsOpen(true)}
        onOpenAppearance={() => setAppearanceOpen(true)}
        onOpenMapStyle={() => setMapStyleOpen(true)}
        onOpenStamp={setStampParkId}
        onOpenJourney={(id) => {
          clearSelection()
          setJourneyId(id)
        }}
        onGoToPark={(id) => {
          setProfileOpen(false)
          selectParkFromMap(id)
        }}
      />
      <AppearanceModal open={appearanceOpen} onClose={() => setAppearanceOpen(false)} />
      <MapStyleModal
        open={mapStyleOpen}
        onClose={() => setMapStyleOpen(false)}
        mapStyle={mapStyle}
        onMapStyle={pickMapStyle}
      />
      {selected && (
        <AmenityModal
          parkId={selected.id}
          parkName={selected.properties.name}
          kind={amenityKind}
          onClose={() => setAmenityKind(null)}
        />
      )}
      <StampsModal open={stampsOpen} onClose={() => setStampsOpen(false)} />
      <StampCelebration
        parkId={celebrate?.id ?? null}
        parkName={celebrate?.name ?? ''}
        onClose={() => setCelebrate(null)}
      />
    </div>
  )
}
