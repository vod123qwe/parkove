import { useEffect, useRef } from 'react'
import { collectPoint, recordFix, useGameState } from './state'
import { distanceM } from './geo'
import type { Pt } from './geo'
import { questForPark } from './data/quests'
import type { QuestPoi } from './data/quests'

/**
 * Headless expedition engine: while an expedition is active it keeps the
 * screen awake (Wake Lock), records the GPS track and watches the distance to
 * every point that is still open. PWA constraint accepted in the brief: this
 * works with the app open and the screen on, like route recording in AllTrails.
 */

/** heads-up range: far enough to start looking around, close enough to mean it */
const NEAR_M = 50
/** the point counts as reached at this distance, unless GPS is vaguer than that */
const ARRIVE_M = 15
/** ...and never further than this, however bad the signal claims to be */
const ARRIVE_MAX_M = 35

export function ExpeditionController({
  onNear,
  onArrive,
}: {
  onNear: (poi: QuestPoi, distance: number) => void
  onArrive: (poi: QuestPoi) => void
}) {
  const { expedition, parks } = useGameState()
  const parkId = expedition?.parkId ?? null
  const collectedRef = useRef<Set<string>>(new Set())
  collectedRef.current = new Set(parkId ? (parks[parkId]?.points ?? []) : [])
  // one heads-up per point per walk, otherwise it fires on every GPS tick
  const warnedRef = useRef<Set<string>>(new Set())
  const cbRef = useRef({ onNear, onArrive })
  cbRef.current = { onNear, onArrive }

  useEffect(() => {
    if (!parkId) return
    warnedRef.current = new Set()
    const quest = questForPark(parkId)

    let watchId: number | null = null
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const pt: Pt = [pos.coords.longitude, pos.coords.latitude]
          const accuracy = pos.coords.accuracy ?? 999
          // the phone reports heading only sometimes, so fall back on the walk
          const course =
            pos.coords.heading != null && !Number.isNaN(pos.coords.heading)
              ? pos.coords.heading
              : null
          recordFix({ coords: pt, accuracy, course })
          if (!quest) return

          const reach = Math.min(Math.max(ARRIVE_M, accuracy), ARRIVE_MAX_M)
          let closest: { poi: QuestPoi; d: number } | null = null
          for (const poi of quest.pois) {
            if (collectedRef.current.has(poi.id)) continue
            const d = distanceM(pt, poi.coords)
            // a point may declare a wider radius than the default reach
            if (d <= Math.max(reach, Math.min(poi.radius, ARRIVE_MAX_M))) {
              collectPoint(parkId, poi.id)
              collectedRef.current.add(poi.id)
              navigator.vibrate?.([90, 60, 180])
              cbRef.current.onArrive(poi)
              return
            }
            if (!closest || d < closest.d) closest = { poi, d }
          }
          if (closest && closest.d <= NEAR_M && !warnedRef.current.has(closest.poi.id)) {
            warnedRef.current.add(closest.poi.id)
            navigator.vibrate?.(40)
            cbRef.current.onNear(closest.poi, closest.d)
          }
        },
        () => {
          // GPS errors during a walk are transient; the walk goes on
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
      )
    }

    let lock: { release: () => Promise<void> } | null = null
    const acquireLock = async () => {
      try {
        const nav = navigator as Navigator & {
          wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> }
        }
        lock = (await nav.wakeLock?.request('screen')) ?? null
      } catch {
        // wake lock is best effort: without it the walk still works, the screen may dim
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') void acquireLock()
    }
    void acquireLock()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId)
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release().catch(() => {})
    }
    // collectedRef is a ref on purpose: re-subscribing the GPS watch on every collect is wasteful
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkId])

  return null
}
