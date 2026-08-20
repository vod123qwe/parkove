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
/** on foot this is already a run: a faster jump is the GPS lying, not a step */
const MAX_WALK_SPEED = 6

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

  // a phone in a street of blocks reports positions that hop a few metres
  // sideways while you walk straight; this keeps the drawn line calm
  const smoothRef = useRef<{ pt: Pt; at: number } | null>(null)

  useEffect(() => {
    if (!parkId) return
    warnedRef.current = new Set()
    smoothRef.current = null
    const quest = questForPark(parkId)

    let watchId: number | null = null
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const raw: Pt = [pos.coords.longitude, pos.coords.latitude]
          const accuracy = pos.coords.accuracy ?? 999
          // the phone reports heading only sometimes, so fall back on the walk
          const course =
            pos.coords.heading != null && !Number.isNaN(pos.coords.heading)
              ? pos.coords.heading
              : null

          const now = Date.now()
          const prev = smoothRef.current
          let pt = raw
          if (prev) {
            const dt = (now - prev.at) / 1000
            const moved = distanceM(prev.pt, raw)
            // a jump too fast to walk is noise; the next reading is a second away
            if (dt > 0 && dt < 20 && moved / dt > MAX_WALK_SPEED) return
            // a sharp reading leads, a vague one only nudges
            const alpha = Math.min(0.7, Math.max(0.25, 10 / Math.max(accuracy, 5)))
            pt = [
              prev.pt[0] + (raw[0] - prev.pt[0]) * alpha,
              prev.pt[1] + (raw[1] - prev.pt[1]) * alpha,
            ]
          }
          smoothRef.current = { pt, at: now }

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
