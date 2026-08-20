import { useEffect, useState } from 'react'
import { Square } from 'lucide-react'
import { Card } from '../ds'
import { useGameState } from './state'
import { PhotoButton } from './PhotoButton'

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
}: {
  /** ending is irreversible, so the bar only asks for it */
  onRequestStop: () => void
  onPhoto?: (photoId: string) => void
}) {
  const { expedition } = useGameState()
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 10000)
    return () => clearInterval(t)
  }, [])

  if (!expedition) return null
  const km = (expedition.distanceM / 1000).toFixed(1).replace('.', ',')

  return (
    <div className="app-expbar">
      <Card className="app-expbar__card">
        <PhotoButton
          parkId={expedition.parkId}
          journeyId={expedition.id}
          coords={expedition.where?.coords ?? expedition.track[expedition.track.length - 1]}
          onSaved={onPhoto}
          label="Zdjęcie"
          full={false}
          variant="tonal"
          className="app-expbar__photo"
        />
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
