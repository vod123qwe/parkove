import { useMemo, useState } from 'react'
import { ChevronRight, Component, Footprints, Map as MapIcon, Palette, Pencil, Sparkles, Trees } from 'lucide-react'
import { Button, Carousel, List, ListItem, Modal, Polaroid, ProgressRing, Stamp, Stat } from '../ds'
import { useGameState } from './state'
import { usePhotos } from './photos'
import { getName, greeting, initials, setName as saveName } from './profile'
import { KIND_META } from './kinds'
import { questForPark } from './data/quests'
import { VERSION } from '../changelog'
import type { ParkFeature } from './ParkSheet'

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })

const fmtDuration = (ms: number) => {
  const min = Math.round(ms / 60000)
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`
}

export function ProfileModal({
  open,
  onClose,
  parks,
  percent,
  visitedCount,
  onOpenStamps,
  onOpenAppearance,
  onOpenMapStyle,
  onGoToPark,
}: {
  open: boolean
  onClose: () => void
  parks: ParkFeature[]
  percent: number
  visitedCount: number
  onOpenStamps: () => void
  onOpenAppearance: () => void
  onOpenMapStyle: () => void
  onGoToPark: (parkId: string) => void
}) {
  const { parks: progress, journeys } = useGameState()
  const photos = usePhotos()
  const [name, setNameState] = useState(getName)
  const [editing, setEditing] = useState(false)

  const parkName = (id: string) => parks.find((p) => p.id === id)?.properties.name ?? id

  const km = useMemo(
    () => journeys.reduce((s, j) => s + j.distanceM, 0) / 1000,
    [journeys],
  )

  // recently earned stamps first, so the carousel shows the newest win
  const earned = useMemo(
    () =>
      parks
        .filter((p) => progress[p.id])
        .sort((a, b) => (progress[b.id]?.firstAt ?? '').localeCompare(progress[a.id]?.firstAt ?? '')),
    [parks, progress],
  )

  /** one unvisited park as today's nudge, stable for the day */
  const suggestion = useMemo(() => {
    const left = parks.filter((p) => !progress[p.id])
    if (!left.length) return null
    const withQuest = left.filter((p) => questForPark(p.id))
    const pool = withQuest.length ? withQuest : left
    const day = Math.floor(Date.now() / 86400000)
    return pool[day % pool.length]
  }, [parks, progress])

  const commitName = (value: string) => {
    setNameState(value)
    saveName(value)
    setEditing(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="Profil">
      <header className="prof-head">
        {editing ? (
          <input
            className="prof-nameinput"
            defaultValue={name}
            autoFocus
            placeholder="Twoje imię"
            onBlur={(e) => commitName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitName((e.target as HTMLInputElement).value)
              if (e.key === 'Escape') setEditing(false)
            }}
          />
        ) : (
          <button className="prof-greet" onClick={() => setEditing(true)}>
            <span className="prof-avatar">{initials(name)}</span>
            <span className="prof-greet__text t-headline">{greeting(name)}</span>
            <Pencil size={15} className="prof-greet__pencil" />
          </button>
        )}

        <div className="prof-ring">
          <ProgressRing value={percent} size="lg" />
          <div className="prof-ring__text">
            <p className="t-body-strong">{percent}% Krakowa odkryte</p>
            <p className="t-body-sm park-muted">
              {visitedCount} z {parks.length} miejsc · {km.toFixed(1).replace('.', ',')} km w parkach
            </p>
          </div>
        </div>

        <div className="prof-stats">
          <Stat value={String(visitedCount)} label="pieczątki" />
          <Stat value={String(journeys.length)} label="wyprawy" />
          <Stat value={km.toFixed(1).replace('.', ',')} label="kilometry" />
        </div>
      </header>

      <section className="prof-section">
        <div className="prof-sechead">
          <h3 className="t-title prof-sectitle">Pieczątki</h3>
          <Button variant="ghost" onClick={onOpenStamps}>
            Zobacz wszystkie
          </Button>
        </div>
        {earned.length ? (
          <Carousel className="prof-stamps" aria-label="Zdobyte pieczątki">
            {earned.map((p) => (
              <Stamp
                key={p.id}
                parkId={p.id}
                name={p.properties.name}
                earned
                size="md"
                showName
                fallback={<Trees />}
              />
            ))}
          </Carousel>
        ) : (
          <p className="t-body-sm park-muted prof-empty">
            Pierwszą pieczątkę dostaniesz przy pierwszej wizycie w parku.
          </p>
        )}
      </section>

      <section className="prof-section">
        <h3 className="t-title prof-sectitle">Zdjęcia z wypraw</h3>
        {photos.length ? (
          <Carousel className="prof-photos" aria-label="Zdjęcia z wypraw">
            {photos.map((ph, i) => (
              <Polaroid
                key={ph.id}
                src={ph.url}
                caption={ph.caption || parkName(ph.parkId)}
                meta={`${parkName(ph.parkId)} · ${fmtDate(ph.at)}`}
                tilt={i % 2 ? 1.5 : -1.5}
              />
            ))}
          </Carousel>
        ) : (
          <p className="t-body-sm park-muted prof-empty">
            Podczas wyprawy dotknij „Dodaj zdjęcie”, a fotka wyląduje tutaj z Twoim podpisem.
          </p>
        )}
      </section>

      {journeys.length > 0 && (
        <section className="prof-section">
          <h3 className="t-title prof-sectitle">Ostatnie wyprawy</h3>
          <List className="prof-list">
            {[...journeys]
              .sort((a, b) => b.startedAt - a.startedAt)
              .slice(0, 3)
              .map((j) => (
                <ListItem
                  key={j.id}
                  icon={<Footprints />}
                  leadTone="accent"
                  title={parkName(j.parkId)}
                  meta={`${fmtDate(j.startedAt)} · ${(j.distanceM / 1000).toFixed(1).replace('.', ',')} km · ${fmtDuration(j.endedAt - j.startedAt)}${j.points.length ? ` · ${j.points.length} pkt` : ''}`}
                  onClick={() => {
                    onGoToPark(j.parkId)
                    onClose()
                  }}
                  trailing={<ChevronRight size={18} className="park-parking__chevron" />}
                />
              ))}
          </List>
        </section>
      )}

      {suggestion && (
        <section className="prof-section">
          <h3 className="t-title prof-sectitle">Dokąd dziś</h3>
          <button
            className="park-parking"
            onClick={() => {
              onGoToPark(suggestion.id)
              onClose()
            }}
          >
            <Sparkles size={18} />
            <div className="park-parking__body">
              <p className="t-label park-parking__name">{suggestion.properties.name}</p>
              <p className="t-caption park-parking__hint">
                {(KIND_META[suggestion.properties.kind] ?? KIND_META.park).label} ·{' '}
                {String(suggestion.properties.areaHa).replace('.', ',')} ha
                {questForPark(suggestion.id) ? ' · czeka tu wyprawa z punktami' : ' · jeszcze nieodkryty'}
              </p>
            </div>
            <ChevronRight size={18} className="park-parking__chevron" />
          </button>
        </section>
      )}

      <section className="prof-section">
        <h3 className="t-title prof-sectitle">Ustawienia</h3>
        <List className="prof-list">
          <ListItem
            icon={<Palette />}
            title="Wygląd aplikacji"
            meta="Motyw jasny, ciemny albo automatyczny"
            trailing={<ChevronRight size={18} className="park-parking__chevron" />}
            onClick={onOpenAppearance}
          />
          <ListItem
            icon={<MapIcon />}
            title="Wygląd mapy"
            meta="Sześć styli, w tym satelita"
            trailing={<ChevronRight size={18} className="park-parking__chevron" />}
            onClick={onOpenMapStyle}
          />
          <ListItem
            icon={<Component />}
            title="Design system"
            meta={`Katalog komponentów i tokenów · v${VERSION}`}
            trailing={<ChevronRight size={18} className="park-parking__chevron" />}
            onClick={() => {
              window.location.href = '/catalog.html'
            }}
          />
        </List>
      </section>

      <p className="t-caption profile-version">Parkove v{VERSION}</p>
    </Modal>
  )
}
