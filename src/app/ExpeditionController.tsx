import { useEffect, useRef } from 'react'
import { collectPoint, recordFix, useGameState } from './state'
import { distanceM } from './geo'
import type { Pt } from './geo'
import { questForPark } from './data/quests'
import type { QuestPoi } from './data/quests'
import { distanceToParkM } from './geo'
import { listMarks } from './photos'
import parksData from './data/parks.json'
import type { ParkFeature } from './ParkSheet'

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

/*
 * Kiedy uznajemy, ze spacer sie skonczyl, tylko nikt tego nie klilknal.
 *
 * Zyczenie Jarka: po wyjsciu z parku okolo kilometra apka ma zapytac, czy to
 * juz koniec, zeby droga powrotna (zwykle autem) nie dopisala sie do trasy.
 *
 * Dwa zabezpieczenia, zeby nie pytac bez powodu: dystans liczymy do GRANICY
 * miejsca, nie do srodka, a pytanie pada dopiero, gdy oddalenie utrzymuje sie
 * przez chwile. Pojedynczy skok GPS o kilometr zdarza sie miedzy blokami.
 */
const AWAY_M = 300
const AWAY_HOLD_MS = 45000
/** dopoki jestes tak blisko granicy, slad liczy sie jako czesc spaceru */
const STILL_THERE_M = 100

/*
 * Druga droga do tego samego pytania: wrociles do auta.
 *
 * Pin „tu stoi auto" stawia sie na poczatku spaceru, wiec sam powrot w to
 * miejsce nie wystarczy: przez pierwsze minuty ciagle sie przy nim krecisz.
 * Dlatego liczy sie dopiero po dwudziestu minutach chodzenia. Wtedy powrot
 * pod auto znaczy dokladnie jedno i nie trzeba czekac, az odjedziesz.
 */
const CAR_MIN_WALK_MS = 20 * 60 * 1000
const CAR_BACK_M = 60

export function ExpeditionController({
  onNear,
  onArrive,
  onFarAway,
}: {
  onNear: (poi: QuestPoi, distance: number) => void
  onArrive: (poi: QuestPoi) => void
  /**
   * Oddaliles sie od miejsca i nie wracasz. `keepTrackPoints` mowi, ile
   * punktow sladu powstalo, zanim wyszedles: tyle warto zapisac.
   */
  onFarAway?: (distance: number, keepTrackPoints: number, reason: 'away' | 'car') => void
}) {
  const { expedition, parks } = useGameState()
  const parkId = expedition?.parkId ?? null
  const collectedRef = useRef<Set<string>>(new Set())
  collectedRef.current = new Set(parkId ? (parks[parkId]?.points ?? []) : [])
  // one heads-up per point per walk, otherwise it fires on every GPS tick
  const warnedRef = useRef<Set<string>>(new Set())
  /* aktualny slad: handler GPS zyje w efekcie [parkId], wiec musi czytac
     przez ref, inaczej domknie stan z pierwszego renderu */
  const expRef = useRef(expedition)
  expRef.current = expedition
  const cbRef = useRef({ onNear, onArrive, onFarAway })
  cbRef.current = { onNear, onArrive, onFarAway }
  /* ile punktow sladu bylo, gdy ostatnio byles przy miejscu */
  const hereAtRef = useRef(0)
  /* od kiedy trwa oddalenie; null = jestes w poblizu */
  const awaySinceRef = useRef<number | null>(null)
  const askedRef = useRef(false)
  const carRef = useRef<Pt | null>(null)

  // a phone in a street of blocks reports positions that hop a few metres
  // sideways while you walk straight; this keeps the drawn line calm
  const smoothRef = useRef<{ pt: Pt; at: number } | null>(null)

  useEffect(() => {
    if (!parkId) return
    warnedRef.current = new Set()
    smoothRef.current = null
    awaySinceRef.current = null
    askedRef.current = false
    hereAtRef.current = 0
    /* gdzie stoi auto tej wyprawy; dociagane w tle, bo siedzi w IndexedDB */
    carRef.current = null
    void listMarks()
      .then((list) => {
        const car = list.find(
          (m) => m.kind === 'car' && m.journeyId === expRef.current?.id && m.coords,
        )
        carRef.current = car?.coords ?? null
      })
      .catch(() => {})
    const quest = questForPark(parkId)
    const feature = (parksData as unknown as { features: ParkFeature[] }).features.find(
      (f) => f.id === parkId,
    )

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

          /*
           * Czy to juz droga powrotna? Liczymy to na SUROWEJ pozycji i przed
           * filtrem predkosci. Filtr odrzuca skoki szybsze niz bieg, wiec
           * odczyty z jadacego auta przepadaja i wlasnie ich tu potrzebujemy:
           * pytanie ma paść, gdy ktos odjezdza, a nie dopiero gdy znow idzie.
           */
          /* podglad w DEV: w terenie nie da sie inaczej sprawdzic, czemu
             pytanie nie padlo (window.__far) */
          if (import.meta.env.DEV) {
            ;(window as unknown as { __far?: unknown }).__far = {
              feature: !!feature,
              cb: !!cbRef.current.onFarAway,
              asked: askedRef.current,
              away: feature ? Math.round(distanceToParkM(raw, feature.geometry)) : null,
              since: awaySinceRef.current,
              held: awaySinceRef.current ? now - awaySinceRef.current : 0,
              here: hereAtRef.current,
            }
          }
          if (feature && cbRef.current.onFarAway && !askedRef.current) {
            const away = distanceToParkM(raw, feature.geometry)
            const track = expRef.current?.track.length ?? 0
            if (away <= STILL_THERE_M) {
              awaySinceRef.current = null
              /*
               * Slad rosnie w recordFix, ktore idzie NIZEJ, wiec tutaj widzimy
               * stan sprzed biezacego punktu. Bierzemy maksimum, bo lepiej
               * zapisac spacer o punkt za dlugi niz uciac go za wczesnie.
               */
              hereAtRef.current = Math.max(hereAtRef.current, track)
            } else if (away >= AWAY_M) {
              if (awaySinceRef.current == null) awaySinceRef.current = now
              else if (now - awaySinceRef.current >= AWAY_HOLD_MS) {
                askedRef.current = true
                cbRef.current.onFarAway(Math.round(away), hereAtRef.current, 'away')
              }
            } else {
              /* miedzy progami: ani nie na miejscu, ani nie na tyle daleko */
              awaySinceRef.current = null
            }

            /* albo po prostu wrociles pod auto, po dobrym spacerze */
            const startedAt = expRef.current?.startedAt ?? now
            if (
              !askedRef.current &&
              carRef.current &&
              now - startedAt >= CAR_MIN_WALK_MS &&
              distanceM(raw, carRef.current) <= CAR_BACK_M
            ) {
              askedRef.current = true
              cbRef.current.onFarAway(Math.round(away), hereAtRef.current, 'car')
            }
          }

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
