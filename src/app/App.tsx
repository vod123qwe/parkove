import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CircleUserRound, List as ListIcon } from 'lucide-react'
import { BottomSheet, Button, Card, List, ListItem, PeekCard, ProgressRing } from '../ds'
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
import { RevealSheet } from './RevealSheet'
import { KIND_META } from './kinds'
import { useGameState } from './state'
import { isDarkNow, onDarkChange } from './theme'
import { getMapStyle, resolveMapStyle, setMapStyle } from './data/mapstyles'
import type { MapStyleId } from './data/mapstyles'
import { suggestedParking } from './data/parking'
import { amenitiesFor, isFood } from './data/amenities'
import type { ParkingInfo } from './data/parking'
import { pointsTotal, questForPark } from './data/quests'
import type { QuestPoi } from './data/quests'
import parksData from './data/parks.json'
import './app.css'

const FEATURES = parksData.features as unknown as ParkFeature[]
const TOTAL_POINTS = FEATURES.reduce((s, f) => s + pointsTotal(f.id), 0)

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
  const [focus, setFocus] = useState<MapFocus | null>(null)
  const [reveal, setReveal] = useState<{ parkId: string; poi: QuestPoi } | null>(null)
  const [poiCard, setPoiCard] = useState<{ parkId: string; poi: QuestPoi } | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [stampsOpen, setStampsOpen] = useState(false)
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [mapStyleOpen, setMapStyleOpen] = useState(false)
  const [celebrate, setCelebrate] = useState<{ id: string; name: string } | null>(null)
  const [amenityKind, setAmenityKind] = useState<'food' | 'playground' | null>(null)
  const [mapStyle, setMapStyleState] = useState<MapStyleId>(getMapStyle)
  const [isDark, setIsDark] = useState(isDarkNow)

  useEffect(() => onDarkChange(() => setIsDark(isDarkNow())), [])

  const pickMapStyle = (id: MapStyleId) => {
    setMapStyleState(id)
    setMapStyle(id)
  }

  const mapStyleSpec = useMemo(() => resolveMapStyle(mapStyle, isDark), [mapStyle, isDark])

  const visitedIds = useMemo(() => new Set(Object.keys(progress)), [progress])

  const stampPins = useMemo(
    () =>
      FEATURES.filter((f) => visitedIds.has(f.id)).map((f) => ({
        parkId: f.id,
        coords: f.properties.center,
      })),
    [visitedIds],
  )

  // celebrate the moment a park joins the collection
  const knownVisited = useRef<Set<string> | null>(null)
  useEffect(() => {
    const prev = knownVisited.current
    knownVisited.current = visitedIds
    if (!prev) return
    for (const id of visitedIds) {
      if (!prev.has(id)) {
        const f = FEATURES.find((x) => x.id === id)
        if (f) setCelebrate({ id, name: f.properties.name })
        break
      }
    }
  }, [visitedIds])

  const earnedPoints = FEATURES.reduce((s, f) => {
    const p = progress[f.id]
    if (!p) return s
    return s + (questForPark(f.id) ? p.points.length : 1)
  }, 0)
  const percent = Math.round((earnedPoints / TOTAL_POINTS) * 100)
  const visitedCount = FEATURES.filter((f) => visitedIds.has(f.id)).length

  const selected = FEATURES.find((f) => f.id === selectedId) ?? null
  const expeditionPark = expedition ? FEATURES.find((f) => f.id === expedition.parkId) : null
  const onWalk = !!expedition
  const peekOpen = !!selected && !expanded && !onWalk

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

  const sortedParks = useMemo(
    () => [...FEATURES].sort((a, b) => a.properties.name.localeCompare(b.properties.name, 'pl')),
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
        mapStyle={mapStyleSpec}
        stampPins={stampPins}
        onSelectStamp={selectParkFromMap}
        amenityPins={amenityPins}
        onSelectAmenity={setAmenityKind}
        hideStampFor={overlayParkId}
      />
      <ExpeditionController onReveal={onReveal} />

      <header className="app-hud">
        <Card className="app-hud__card">
          <ProgressRing value={percent} size="sm" />
          <div className="app-hud__text">
            <span className="app-hud__percent">{percent}% Krakowa</span>
            <span className="app-hud__count t-caption">
              {visitedCount}/{FEATURES.length} miejsc · {earnedPoints}/{TOTAL_POINTS} pkt
            </span>
          </div>
        </Card>
        <button className="app-profilebtn" aria-label="Profil" onClick={() => setProfileOpen(true)}>
          <CircleUserRound strokeWidth={1.75} />
        </button>
      </header>

      {onWalk && expeditionPark ? (
        <ExpeditionBar parkName={expeditionPark.properties.name} />
      ) : (
        !selected && (
          <div className="app-fab">
            <Button size="lg" icon={<ListIcon size={18} />} onClick={() => setListOpen(true)}>
              Miejsca
            </Button>
          </div>
        )
      )}

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
          <Button
            full
            variant="tonal"
            onClick={() => {
              setExpanded(true)
              if (selected) flyToPark(selected, Math.round(window.innerHeight * 0.42))
            }}
          >
            Zobacz szczegóły miejsca
          </Button>
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
        <List className="app-parklist">
          {sortedParks.map((f) => {
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
      {reveal && (
        <RevealSheet
          parkId={reveal.parkId}
          poi={reveal.poi}
          onClose={() => setReveal(null)}
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
        percent={percent}
        visitedCount={visitedCount}
        onOpenStamps={() => setStampsOpen(true)}
        onOpenAppearance={() => setAppearanceOpen(true)}
        onOpenMapStyle={() => setMapStyleOpen(true)}
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
