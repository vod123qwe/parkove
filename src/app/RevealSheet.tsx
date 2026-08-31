import { Sparkles } from 'lucide-react'
import { BottomSheet, Button, ProgressRing } from '../ds'
import { Dilemma } from './Dilemma'
import { PhotoButton } from './PhotoButton'
import { questForPark } from './data/quests'
import type { QuestPoi } from './data/quests'
import { useGameState } from './state'
import { distanceM, formatDistance } from './geo'
import { revealNow } from './reveal'

export function RevealSheet({
  parkId,
  poi,
  onClose,
  onReadMore,
  onPhotoSaved,
}: {
  parkId: string
  poi: QuestPoi | null
  onClose: () => void
  onReadMore: (poi: QuestPoi) => void
  /** a fresh picture opens its own sheet, where the caption gets written */
  onPhotoSaved: (photoId: string) => void
}) {
  const { parks } = useGameState()
  if (!poi) return null
  const quest = questForPark(parkId)
  if (!quest) return null
  const collected = new Set(parks[parkId]?.points ?? [])
  const done = collected.size
  const total = quest.pois.length
  const next = quest.pois
    .filter((p) => !collected.has(p.id))
    .map((p) => ({ p, d: distanceM(poi.coords, p.coords) }))
    .sort((a, b) => a.d - b.d)[0]

  return (
    <BottomSheet open onClose={onClose} title={poi.name}>
      <p className="reveal-kicker t-caption">
        <Sparkles size={14} /> Odkryte: punkt {done} z {total}
      </p>
      <p className="t-body reveal-story">{revealNow(poi)}</p>
      {poi.dilemma && <Dilemma parkId={parkId} poiId={poi.id} dilemma={poi.dilemma} />}
      <div className="reveal-footer">
        <ProgressRing value={(done / total) * 100} label={`${done}/${total}`} />
        <div className="reveal-next">
          {next ? (
            <>
              <p className="t-body-strong">Następny: {next.p.name}</p>
              <p className="t-body-sm park-muted">
                {formatDistance(next.d)} stąd · {next.p.teaser}
              </p>
            </>
          ) : (
            <p className="t-body-strong">Komplet! Cały park zahaczony. 🏅</p>
          )}
        </div>
      </div>
      <Button full size="lg" onClick={onClose}>
        {next ? 'Idziemy dalej' : 'Wracamy w chwale'}
      </Button>
      <PhotoButton
        parkId={parkId}
        poiId={poi.id}
        onSaved={onPhotoSaved}
        label="Zrób zdjęcie tego miejsca"
        variant="tonal"
        className="park-devbtn"
      />
      <Button full variant="ghost" onClick={() => onReadMore(poi)} className="park-devbtn">
        Czytaj więcej o tym miejscu
      </Button>
    </BottomSheet>
  )
}
