import { useMemo, useState } from 'react'
import { Award, ChevronRight, Footprints, Palette, Pencil, Route, Sparkles, Trees } from 'lucide-react'
import { Button, Carousel, List, ListItem, Modal, Polaroid, Stamp, Stat, StatGrid } from '../ds'
import { useGameState } from './state'
import { usePhotos } from './photos'
import { getName, greeting, initials, setName as saveName } from './profile'
import { KIND_META } from './kinds'
import { questForPark } from './data/quests'
import { isParkComplete } from './progress'
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
  visitedCount,
  onOpenStamps,
  onOpenLooks,
  onGoToPark,
  onOpenJourney,
  onOpenStamp,
}: {
  open: boolean
  onClose: () => void
  parks: ParkFeature[]
  visitedCount: number
  onOpenStamps: () => void
  /* jeden ekran wygladu zamiast dwoch wejsc */
  onOpenLooks: () => void
  onGoToPark: (parkId: string) => void
  /** open one past walk: its route lands on the map, details in a sheet */
  onOpenJourney: (journeyId: string) => void
  /** one sticker up close, on its own page */
  onOpenStamp: (parkId: string) => void
}) {
  const { parks: progress, journeys } = useGameState()
  const photos = usePhotos().filter((m) => m.kind === 'photo' && m.url)
  const [name, setNameState] = useState(getName)
  const [editing, setEditing] = useState(false)

  const parkName = (id: string) => parks.find((p) => p.id === id)?.properties.name ?? id

  const km = useMemo(
    () => journeys.reduce((s, j) => s + j.distanceM, 0) / 1000,
    [journeys],
  )

  /*
   * A stamp is a finished place, the same rule the ceremony after a walk uses.
   * Visiting is a different, lower bar: that one shows up as a filled square on
   * the board above and as the colour on the map.
   */
  const earned = useMemo(
    () =>
      parks
        .filter((p) => isParkComplete(p.id, progress))
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

        {/* the city as a board: one square per place, filled once you have been */}
        <div className="prof-cover">
          <div className="prof-cover__head">
            <div className="prof-cover__text">
              <p className="t-body-strong">Gdzie już byłeś</p>
              <p className="t-body-sm park-muted">
                {visitedCount} z {parks.length} miejsc · {km.toFixed(1).replace('.', ',')} km w
                parkach
              </p>
            </div>
          </div>
          <div className="prof-cover__grid" aria-hidden="true">
            {parks.map((p) => (
              <span key={p.id} className={progress[p.id] ? 'is-on' : undefined} />
            ))}
          </div>
        </div>

        <StatGrid cols={3} className="prof-stats">
          <Stat icon={<Award />} value={String(earned.length)} label="pieczątki" />
          <Stat icon={<Footprints />} value={String(journeys.length)} label="wyprawy" />
          <Stat icon={<Route />} value={km.toFixed(1).replace('.', ',')} label="kilometry" />
        </StatGrid>
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
                onClick={() => onOpenStamp(p.id)}
              />
            ))}
          </Carousel>
        ) : (
          <p className="t-body-sm park-muted prof-empty">
            Pieczątkę dostaniesz za przejście miejsca, nie za samo wejście.
          </p>
        )}
      </section>

      <section className="prof-section">
        <h3 className="t-title prof-sectitle">Zdjęcia z wypraw</h3>
        {photos.length ? (
          <Carousel fade={false} className="prof-photos" aria-label="Zdjęcia z wypraw">
            {photos.map((ph, i) => (
              <Polaroid
                key={ph.id}
                src={ph.url!}
                caption={ph.caption || undefined}
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
          <h3 className="t-title prof-sectitle">Moje wyprawy</h3>
          <List className="prof-list">
            {[...journeys]
              .sort((a, b) => b.startedAt - a.startedAt)
              .map((j) => (
                <ListItem
                  key={j.id}
                  icon={<Footprints />}
                  leadTone="accent"
                  title={j.name ?? parkName(j.parkId)}
                  meta={`${fmtDate(j.startedAt)} · ${(j.distanceM / 1000).toFixed(1).replace('.', ',')} km · ${fmtDuration(j.endedAt - j.startedAt)}${j.points.length ? ` · ${j.points.length} pkt` : ''}`}
                  onClick={() => {
                    onOpenJourney(j.id)
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

      {/*
        Ustawienia wyszly z profilu do menu (2026-08-22). Profil jest o tym, co
        zrobiles: piecztaki, wyprawy, zdjecia. Numer wersji i katalog komponentow
        nie mialy tu czego szukac. Zostaje jedno skrocenie: wyglad, bo o nim
        czlowiek mysli patrzac na wlasne zdjecia.
      */}
      <section className="prof-section">
        <List className="prof-list">
          <ListItem
            icon={<Palette />}
            title="Wygląd"
            meta="Motyw i styl mapy, z podglądem"
            trailing={<ChevronRight size={18} className="park-parking__chevron" />}
            onClick={onOpenLooks}
          />
        </List>
      </section>

    </Modal>
  )
}
