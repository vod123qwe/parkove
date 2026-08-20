import { useEffect, useRef } from 'react'
import { appendTrackPoint, collectPoint, useGameState } from './state'
import { distanceM } from './geo'
import type { Pt } from './geo'
import { questForPark } from './data/quests'
import type { QuestPoi } from './data/quests'

/**
 * Headless expedition engine: while an expedition is active it keeps the
 * screen awake (Wake Lock), records the GPS track and detects quest POIs
 * in radius. PWA constraint accepted in the brief: works with the app
 * open and the screen on, like route recording in AllTrails.
 */
export function ExpeditionController({ onReveal }: { onReveal: (poi: QuestPoi) => void }) {
  const { expedition, parks } = useGameState()
  const parkId = expedition?.parkId ?? null
  const collectedRef = useRef<Set<string>>(new Set())
  collectedRef.current = new Set(parkId ? (parks[parkId]?.points ?? []) : [])

  useEffect(() => {
    if (!parkId) return
    const quest = questForPark(parkId)

    let watchId: number | null = null
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const pt: Pt = [pos.coords.longitude, pos.coords.latitude]
          appendTrackPoint(pt)
          if (!quest) return
          for (const poi of quest.pois) {
            if (collectedRef.current.has(poi.id)) continue
            if (distanceM(pt, poi.coords) <= poi.radius) {
              collectPoint(parkId, poi.id)
              navigator.vibrate?.([80, 40, 160])
              onReveal(poi)
              break
            }
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
  }, [parkId, onReveal])

  return null
}
