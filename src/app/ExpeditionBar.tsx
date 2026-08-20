import { useEffect, useState } from 'react'
import { StickyNote, Square } from 'lucide-react'
import { Card } from '../ds'
import { useGameState } from './state'
import { PhotoButton } from './PhotoButton'
import { VoiceButton } from './VoiceButton'
import { addMark } from './photos'

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${m} min`
}

/**
 * The action row of a walk. Progress and the next point live in the top
 * status card, so this one only carries what the thumb needs: a camera, the
 * effort so far, and the way out.
 */
export function ExpeditionBar({
  onRequestStop,
  onPhoto,
  onMark,
  onHint,
}: {
  /** ending is irreversible, so the bar only asks for it */
  onRequestStop: () => void
  /** a picture only gets a notice: writing can wait */
  onPhoto?: (markId: string) => void
  /** a note or a recording opens right away, because it needs words */
  onMark?: (markId: string) => void
  onHint?: (message: string) => void
}) {
  const { expedition } = useGameState()
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 10000)
    return () => clearInterval(t)
  }, [])

  if (!expedition) return null
  const km = (expedition.distanceM / 1000).toFixed(1).replace('.', ',')
  const here = expedition.where?.coords ?? expedition.track[expedition.track.length - 1]

  return (
    <div className="app-expbar">
      <Card className="app-expbar__card">
        <PhotoButton
          parkId={expedition.parkId}
          journeyId={expedition.id}
          coords={here}
          onSaved={onPhoto}
          label=""
          full={false}
          variant="tonal"
          className="app-expbar__icon"
        />
        <VoiceButton
          parkId={expedition.parkId}
          journeyId={expedition.id}
          coords={here}
          onSaved={onMark}
          onHint={onHint}
        />
        <button
          className="app-voicebtn"
          aria-label="Zostaw notatkę w tym miejscu"
          onClick={async () => {
            const saved = await addMark({
              kind: 'note',
              parkId: expedition.parkId,
              journeyId: expedition.id,
              coords: here,
              caption: '',
            })
            onMark?.(saved.id)
          }}
        >
          <StickyNote size={20} />
        </button>
        <span className="t-caption app-expbar__meta">
          {fmtTime(Date.now() - expedition.startedAt)} · {km} km
        </span>
        <button
          className="app-expbar__stop"
          aria-label="Zakończ wyprawę"
          onClick={onRequestStop}
        >
          <Square size={16} />
          Koniec
        </button>
      </Card>
    </div>
  )
}
