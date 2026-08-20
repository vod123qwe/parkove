import { useEffect, useRef, useState } from 'react'
import {
  Camera,
  Check,
  ChevronRight,
  Clock,
  Footprints,
  MapPin,
  Mic,
  Pencil,
  StickyNote,
  Play,
  Trash2,
} from 'lucide-react'
import {
  BottomSheet,
  Button,
  IconButton,
  List,
  ListItem,
  NavBar,
  Polaroid,
  Stat,
  StatGrid,
} from '../ds'
import { deleteJourney, updateJourney, useGameState } from './state'
import type { Journey } from './state'
import { questForPark } from './data/quests'
import type { QuestPoi } from './data/quests'
import { updateMark, useMarks } from './photos'
import { PhotoButton } from './PhotoButton'
import { JourneyMap } from './JourneyMap'
import { MemoryViewer } from './MemoryViewer'
import { PoiModal } from './PoiSheet'
import { MemoryPlayer } from './MemoryPlayer'

const fmtDate = (at: number) =>
  new Date(at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })

const fmtClock = (at: number) =>
  new Date(at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${m} min`
}

/**
 * One walk from the journal, on a screen of its own: the route fills the
 * screen and the details ride in a sheet over it, so you can pull the sheet
 * down to look at the map or up to read everything.
 *
 * Anything opened from here (a photo, a recording, a point) opens inside this
 * screen. Opening it behind, on the live map, was the bug that made all of it
 * feel broken.
 */
export function JourneyScreen({
  journey,
  parkName,
  onClose,
}: {
  journey: Journey
  parkName: string
  onClose: () => void
}) {
  const { parks } = useGameState()
  const marks = useMarks().filter((m) => m.journeyId === journey.id)
  const photos = marks.filter((m) => m.kind === 'photo' && m.url)
  const notes = marks.filter((m) => m.kind !== 'photo')

  const [name, setName] = useState(journey.name ?? parkName)
  const [editingName, setEditingName] = useState(false)
  const [note, setNote] = useState(journey.note ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [markId, setMarkId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [poi, setPoi] = useState<QuestPoi | null>(null)
  const [replay, setReplay] = useState(false)

  // dragging the sheet away is a normal way to leave, and it fires no blur:
  // whatever was typed still has to survive that
  const latest = useRef({ name, note })
  latest.current = { name, note }
  useEffect(
    () => () => {
      const n = latest.current.name.trim()
      if (n && n !== journey.name) updateJourney(journey.id, { name: n })
      const written = latest.current.note.trim()
      if (written !== (journey.note ?? '')) updateJourney(journey.id, { note: written })
    },
    // the journey identity is what matters here, not its current fields
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [journey.id],
  )

  const quest = questForPark(journey.parkId)
  const collected = new Set(parks[journey.parkId]?.points ?? [])
  const walked = new Set(journey.points)
  const points = quest?.pois ?? []

  return (
    <div className="jscreen">
      <JourneyMap
        track={journey.track}
        points={points}
        collected={walked}
        marks={marks}
        onSelectMark={setMarkId}
        bottomPadding={Math.round(window.innerHeight * 0.62)}
        placing={!!movingId}
        onPlace={(coords) => {
          if (movingId) void updateMark(movingId, { coords })
          setMovingId(null)
        }}
      />

      <NavBar transparent variant="back" onAction={onClose} className="jscreen__nav" />

      {movingId && (
        <div className="jscreen__placing t-body-sm">Dotknij mapy, żeby przenieść ten pin</div>
      )}

      {/* a card, not a sheet: no grabber, and it can never be thrown away */}
      <BottomSheet open={!movingId} modal={false} onClose={onClose} handle={false} minHeight={216}>
        <div className="journey">
          {editingName ? (
            <input
              className="journey__nameinput"
              value={name}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                setEditingName(false)
                const clean = name.trim()
                if (clean && clean !== journey.name) updateJourney(journey.id, { name: clean })
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              }}
            />
          ) : (
            <div className="journey__namerow">
              <h2 className="t-headline journey__nametext">{name}</h2>
              <IconButton
                aria-label="Zmień nazwę wyprawy"
                variant="tonal"
                onClick={() => setEditingName(true)}
              >
                <Pencil size={18} />
              </IconButton>
            </div>
          )}
          <p className="t-caption journey__when">
            {parkName} · {fmtDate(journey.startedAt)}, {fmtClock(journey.startedAt)}
          </p>

          {journey.track.length > 1 && (
            <Button
              full
              size="lg"
              icon={<Play size={18} />}
              className="journey__replay"
              onClick={() => setReplay(true)}
            >
              Przejdź tę trasę jeszcze raz
            </Button>
          )}

          <StatGrid className="journey__stats">
            <Stat
              icon={<Clock />}
              value={fmtTime(journey.endedAt - journey.startedAt)}
              label="czas"
            />
            <Stat
              icon={<Footprints />}
              value={`${(journey.distanceM / 1000).toFixed(1).replace('.', ',')} km`}
              label="dystans"
            />
            {points.length > 0 && (
              <Stat
                icon={<MapPin />}
                value={`${journey.points.length}/${points.length}`}
                label="punkty"
              />
            )}
            {photos.length > 0 && (
              <Stat icon={<Camera />} value={String(photos.length)} label="zdjęcia" />
            )}
            {notes.length > 0 && (
              <Stat icon={<StickyNote />} value={String(notes.length)} label="notatki" />
            )}
          </StatGrid>

          <h3 className="t-title journey__section">Notatka</h3>
          <textarea
            className="journey__note"
            value={note}
            rows={3}
            placeholder="Jak było? Co zapamiętać z tego spaceru?"
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => {
              if (note !== (journey.note ?? '')) updateJourney(journey.id, { note: note.trim() })
            }}
          />

          <h3 className="t-title journey__section">Zdjęcia</h3>
          {photos.length > 0 && (
            <div className="journey__deck" role="list" aria-label="Zdjęcia z tej wyprawy">
              {photos.map((ph) => (
                <Polaroid
                  key={ph.id}
                  src={ph.url!}
                  caption={ph.caption || undefined}
                  meta={fmtClock(ph.at)}
                  onClick={() => setMarkId(ph.id)}
                />
              ))}
            </div>
          )}
          <PhotoButton
            parkId={journey.parkId}
            journeyId={journey.id}
            coords={journey.track[journey.track.length - 1]}
            label={photos.length ? 'Dodaj kolejne zdjęcie' : 'Dodaj zdjęcie do tej wyprawy'}
            variant="tonal"
            onSaved={setMarkId}
          />

          {notes.length > 0 && (
            <>
              <h3 className="t-title journey__section">Notatki i nagrania</h3>
              <List>
                {notes.map((m) => (
                  <ListItem
                    key={m.id}
                    icon={m.kind === 'audio' ? <Mic /> : <StickyNote />}
                    leadTone="gold"
                    title={
                      m.caption || (m.kind === 'audio' ? 'Nagranie bez podpisu' : 'Pusta notatka')
                    }
                    meta={fmtClock(m.at)}
                    className="-stacked"
                    onClick={() => setMarkId(m.id)}
                    trailing={<ChevronRight size={18} className="park-parking__chevron" />}
                  />
                ))}
              </List>
            </>
          )}

          {points.length > 0 && (
            <>
              <h3 className="t-title journey__section">Punkty</h3>
              <List>
                {points.map((p) => {
                  const onThisWalk = walked.has(p.id)
                  const at = journey.times?.[p.id]
                  const known = collected.has(p.id)
                  return (
                    <ListItem
                      key={p.id}
                      icon={onThisWalk ? <Check /> : <MapPin />}
                      leadTone={onThisWalk ? 'gold' : 'neutral'}
                      title={p.name}
                      meta={
                        onThisWalk
                          ? at
                            ? `zaliczony o ${fmtClock(at)}, przeczytaj jeszcze raz`
                            : 'zaliczony na tej wyprawie'
                          : known
                            ? 'zaliczony innym razem'
                            : 'jeszcze nieodkryty'
                      }
                      className="-stacked"
                      onClick={() => setPoi(p)}
                      trailing={<ChevronRight size={18} className="park-parking__chevron" />}
                    />
                  )
                })}
              </List>
            </>
          )}

          <div className="journey__danger">
            {confirmDelete ? (
              <>
                <Button
                  full
                  variant="ghost"
                  icon={<Trash2 size={18} />}
                  onClick={() => {
                    deleteJourney(journey.id)
                    onClose()
                  }}
                >
                  Tak, usuń wyprawę
                </Button>
                <Button full variant="ghost" onClick={() => setConfirmDelete(false)}>
                  Zostaw
                </Button>
              </>
            ) : (
              <Button full variant="ghost" onClick={() => setConfirmDelete(true)}>
                Usuń tę wyprawę z dziennika
              </Button>
            )}
          </div>
        </div>
      </BottomSheet>

      {markId && !movingId && marks.length > 0 && (
        <MemoryViewer
          marks={marks}
          startId={markId}
          onClose={() => setMarkId(null)}
          onMove={(id) => {
            setMovingId(id)
            setMarkId(null)
          }}
        />
      )}

      {replay && (
        <MemoryPlayer
          journey={journey}
          parkName={parkName}
          points={points}
          marks={marks}
          onClose={() => setReplay(false)}
        />
      )}

      <PoiModal
        poi={poi}
        parkId={journey.parkId}
        collected={poi ? collected.has(poi.id) : false}
        onClose={() => setPoi(null)}
      />
    </div>
  )
}
