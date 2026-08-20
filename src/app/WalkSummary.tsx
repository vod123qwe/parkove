import { Camera, Clock, Footprints, Lock, MapPin, StickyNote } from 'lucide-react'
import { Button, Modal, Stamp, Stat, StatGrid } from '../ds'
import { useGameState } from './state'
import type { Journey } from './state'
import { questForPark } from './data/quests'
import { isParkComplete } from './progress'
import { useMarks } from './photos'

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${m} min`
}

/**
 * What the walk added up to, shown once it is already saved. The badge is the
 * point of this screen: earned it stands in colour, unearned it stands pale
 * with the exact number of points still missing. A locked badge with a number
 * on it is an invitation; a hidden one is nothing.
 */
export function WalkSummary({
  journey,
  parkName,
  onOpenJourney,
  onClose,
}: {
  journey: Journey
  parkName: string
  onOpenJourney: () => void
  onClose: () => void
}) {
  const { parks } = useGameState()
  const marks = useMarks().filter((m) => m.journeyId === journey.id)
  const quest = questForPark(journey.parkId)
  const collected = new Set(parks[journey.parkId]?.points ?? [])
  const total = quest?.pois.length ?? 0
  const missed = (quest?.pois ?? []).filter((p) => !collected.has(p.id))
  const complete = isParkComplete(journey.parkId, parks)
  const photos = marks.filter((m) => m.kind === 'photo').length
  const notes = marks.length - photos

  return (
    <Modal open onClose={onClose} title="Wyprawa zapisana" action="close">
      <div className="summary">
        <h2 className="t-headline summary__name">{journey.name ?? parkName}</h2>
        <p className="t-caption summary__where">{parkName}</p>

        <StatGrid className="summary__stats">
          <Stat icon={<Clock />} value={fmtTime(journey.endedAt - journey.startedAt)} label="czas" />
          <Stat
            icon={<Footprints />}
            value={`${(journey.distanceM / 1000).toFixed(1).replace('.', ',')} km`}
            label="dystans"
          />
          {total > 0 && (
            <Stat icon={<MapPin />} value={`${journey.points.length}/${total}`} label="punkty" />
          )}
          {photos > 0 && <Stat icon={<Camera />} value={String(photos)} label="zdjęcia" />}
          {notes > 0 && <Stat icon={<StickyNote />} value={String(notes)} label="notatki" />}
        </StatGrid>

        <div className={`summary__badge${complete ? ' -earned' : ''}`}>
          <Stamp
            parkId={journey.parkId}
            name={parkName}
            earned={complete}
            size="lg"
            fallback={<MapPin />}
          />
          <div className="summary__badgetext">
            <span className="t-title">{complete ? 'Pieczątka zdobyta' : 'Pieczątka zablokowana'}</span>
            {complete ? (
              <p className="t-body-sm summary__hint">
                Komplet punktów w tym miejscu. Naklejka jest już w gablocie w profilu.
              </p>
            ) : (
              <p className="t-body-sm summary__hint">
                Brakuje {missed.length} z {total} punktów:{' '}
                {missed
                  .slice(0, 3)
                  .map((p) => p.name)
                  .join(', ')}
                {missed.length > 3 ? ` i ${missed.length - 3} więcej` : ''}. Wróć tu kiedyś, postęp
                jest zapisany.
              </p>
            )}
          </div>
          {!complete && <Lock size={18} className="summary__lock" />}
        </div>

        <div className="summary__actions">
          <Button full size="lg" icon={<Footprints size={18} />} onClick={onOpenJourney}>
            Otwórz w historii
          </Button>
          <Button full variant="ghost" onClick={onClose}>
            Gotowe
          </Button>
        </div>
      </div>
    </Modal>
  )
}
