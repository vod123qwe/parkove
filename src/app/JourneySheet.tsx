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
  Trash2,
} from 'lucide-react'
import { BottomSheet, Button, List, ListItem, Polaroid, Stat, StatGrid } from '../ds'
import { deleteJourney, updateJourney, useGameState } from './state'
import type { Journey } from './state'
import { questForPark } from './data/quests'
import { useMarks } from './photos'
import { PhotoButton } from './PhotoButton'

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
 * A walk after the fact, with its route drawn on the map behind this sheet.
 * Everything here is editable, because a walk gets its meaning at home: the
 * name, a note, and pictures added later from the camera roll.
 */
export function JourneySheet({
  journey,
  parkName,
  onClose,
  onOpenPhoto,
}: {
  journey: Journey
  parkName: string
  onClose: () => void
  onOpenPhoto: (markId: string) => void
}) {
  const { parks } = useGameState()
  const marks = useMarks().filter((m) => m.journeyId === journey.id)
  const photos = marks.filter((m) => m.kind === 'photo' && m.url)
  const notes = marks.filter((m) => m.kind !== 'photo')

  const [name, setName] = useState(journey.name ?? parkName)
  const [editingName, setEditingName] = useState(false)
  const [note, setNote] = useState(journey.note ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

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
    <BottomSheet open modal={false} onClose={onClose} title="Wyprawa">
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
          <button className="journey__name" onClick={() => setEditingName(true)}>
            <span className="t-headline">{name}</span>
            <Pencil size={15} />
          </button>
        )}
        <p className="t-caption journey__when">
          {parkName} · {fmtDate(journey.startedAt)}, {fmtClock(journey.startedAt)}
        </p>

        <StatGrid className="journey__stats">
          <Stat icon={<Clock />} value={fmtTime(journey.endedAt - journey.startedAt)} label="czas" />
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
          <div className="journey__photos">
            {photos.map((ph) => (
              <Polaroid
                key={ph.id}
                src={ph.url!}
                caption={ph.caption || undefined}
                onClick={() => onOpenPhoto(ph.id)}
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
          onSaved={onOpenPhoto}
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
                  title={m.caption || (m.kind === 'audio' ? 'Nagranie bez podpisu' : 'Pusta notatka')}
                  meta={fmtClock(m.at)}
                  className="-stacked"
                  onClick={() => onOpenPhoto(m.id)}
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
              {points.map((poi) => {
                const onThisWalk = walked.has(poi.id)
                const at = journey.times?.[poi.id]
                return (
                  <ListItem
                    key={poi.id}
                    icon={onThisWalk ? <Check /> : <MapPin />}
                    leadTone={onThisWalk ? 'gold' : 'neutral'}
                    title={poi.name}
                    meta={
                      onThisWalk
                        ? at
                          ? `zaliczony o ${fmtClock(at)}`
                          : 'zaliczony na tej wyprawie'
                        : collected.has(poi.id)
                          ? 'zaliczony innym razem'
                          : 'jeszcze nieodkryty'
                    }
                    className="-stacked"
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
  )
}
