import { useEffect, useState } from 'react'
import { Navigation2, Square } from 'lucide-react'
import { Card, IconButton } from '../ds'
import { stopExpedition, useGameState } from './state'
import { questForPark } from './data/quests'
import { bearingDeg, distanceM, formatDistance } from './geo'

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${m} min`
}

export function ExpeditionBar({ parkName }: { parkName: string }) {
  const { expedition, parks } = useGameState()
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 10000)
    return () => clearInterval(t)
  }, [])

  if (!expedition) return null
  const quest = questForPark(expedition.parkId)
  const collected = new Set(parks[expedition.parkId]?.points ?? [])
  const km = (expedition.distanceM / 1000).toFixed(1).replace('.', ',')
  const here = expedition.track[expedition.track.length - 1]

  // compass to the nearest remaining point, once GPS gave us a position
  const nearest =
    quest && here
      ? quest.pois
          .filter((p) => !collected.has(p.id))
          .map((p) => ({ p, d: distanceM(here, p.coords), b: bearingDeg(here, p.coords) }))
          .sort((a, b) => a.d - b.d)[0]
      : null

  return (
    <div className="app-expbar">
      <Card className="app-expbar__card">
        <div className="app-expbar__pulse" aria-hidden="true" />
        <div className="app-expbar__text">
          <span className="app-expbar__title">{parkName}</span>
          <span className="t-caption app-expbar__meta">
            {fmtTime(Date.now() - expedition.startedAt)} · {km} km
            {quest ? ` · ${collected.size}/${quest.pois.length} pkt` : ''}
          </span>
        </div>
        {nearest && (
          <div className="app-expbar__compass" title={`Najbliższy: ${nearest.p.name}`}>
            <Navigation2 size={18} style={{ transform: `rotate(${Math.round(nearest.b)}deg)` }} />
            <span className="t-caption">{formatDistance(nearest.d)}</span>
          </div>
        )}
        <IconButton aria-label="Zakończ wyprawę" variant="tonal" onClick={stopExpedition}>
          <Square size={18} />
        </IconButton>
      </Card>
    </div>
  )
}
