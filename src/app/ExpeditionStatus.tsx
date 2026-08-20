import { Navigation2 } from 'lucide-react'
import { Card, ProgressRing } from '../ds'
import { useGameState } from './state'
import { questForPark } from './data/quests'
import { bearingDeg, distanceM, formatDistance } from './geo'

/**
 * The top card during a walk. It replaces the city percentage on purpose:
 * while walking, the only numbers that matter are this walk's points and
 * which way the next one is.
 */
export function ExpeditionStatus() {
  const { expedition, parks } = useGameState()
  if (!expedition) return null

  const quest = questForPark(expedition.parkId)
  const collected = new Set(parks[expedition.parkId]?.points ?? [])
  const total = quest?.pois.length ?? 0
  const done = quest ? quest.pois.filter((p) => collected.has(p.id)).length : 0
  const here = expedition.where?.coords ?? expedition.track[expedition.track.length - 1]

  const next =
    quest && here
      ? quest.pois
          .filter((p) => !collected.has(p.id))
          .map((p) => ({ p, d: distanceM(here, p.coords), b: bearingDeg(here, p.coords) }))
          .sort((a, b) => a.d - b.d)[0]
      : null

  return (
    <Card className="app-hud__card app-expstatus">
      <ProgressRing value={total ? (done / total) * 100 : 0} size="sm" />
      <div className="app-hud__text">
        <span className="app-expstatus__title">
          <span className="app-expstatus__live" aria-hidden="true" />
          {expedition.name}
        </span>
        <span className="t-caption app-expstatus__next">
          {total > 0 && <strong className="app-expstatus__count">{done}/{total}</strong>}
          {next ? (
            <>
              <Navigation2
                size={12}
                className="app-expstatus__arrow"
                style={{ transform: `rotate(${Math.round(next.b)}deg)` }}
                aria-hidden="true"
              />
              {next.p.name} · {formatDistance(next.d)}
            </>
          ) : !here ? (
            'szukam sygnału GPS'
          ) : total > 0 ? (
            'komplet punktów, kończysz kiedy chcesz'
          ) : (
            'nagrywam spacer'
          )}
        </span>
      </div>
    </Card>
  )
}
