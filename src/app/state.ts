import { useSyncExternalStore } from 'react'
import { distanceM, simplifyTrack } from './geo'
import type { Pt } from './geo'

export type ParkProgress = {
  visits: number
  firstAt: string
  lastAt: string
  /** collected quest POI ids */
  points: string[]
}

export type Expedition = {
  parkId: string
  startedAt: number
  track: Pt[]
  distanceM: number
  /** poi ids collected during this walk */
  collected: string[]
}

export type Journey = {
  id: string
  parkId: string
  startedAt: number
  endedAt: number
  distanceM: number
  /** simplified GPS track */
  track: Pt[]
  points: string[]
}

type GameState = {
  parks: Record<string, ParkProgress>
  /** persistent walk log */
  journeys: Journey[]
  /** dilemma answers, keyed "parkId/poiId" -> chosen option index */
  answers: Record<string, number>
  /** volatile: not persisted, a refresh ends the walk (collected points survive) */
  expedition: Expedition | null
}

const KEY = 'parkove-v1'

function load(): GameState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as {
        parks?: Record<string, Partial<ParkProgress>>
        journeys?: Journey[]
        answers?: Record<string, number>
      }
      const parks: Record<string, ParkProgress> = {}
      for (const [id, p] of Object.entries(parsed.parks ?? {})) {
        parks[id] = {
          visits: p.visits ?? 1,
          firstAt: p.firstAt ?? new Date().toISOString(),
          lastAt: p.lastAt ?? new Date().toISOString(),
          points: p.points ?? [],
        }
      }
      return { parks, journeys: parsed.journeys ?? [], answers: parsed.answers ?? {}, expedition: null }
    }
  } catch {
    // corrupted local state: start fresh rather than crash the app
  }
  return { parks: {}, journeys: [], answers: {}, expedition: null }
}

let state: GameState = load()
const listeners = new Set<() => void>()

function commit(next: GameState, persist = true) {
  state = next
  if (persist)
    localStorage.setItem(
      KEY,
      JSON.stringify({ parks: state.parks, journeys: state.journeys, answers: state.answers }),
    )
  listeners.forEach((l) => l())
}

export function getState() {
  return state
}

export function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export function useGameState() {
  return useSyncExternalStore(subscribe, getState)
}

function touchPark(parks: GameState['parks'], parkId: string, countVisit: boolean) {
  const now = new Date().toISOString()
  const prev = parks[parkId]
  const next: ParkProgress = prev
    ? { ...prev, visits: countVisit ? prev.visits + 1 : prev.visits, lastAt: now }
    : { visits: 1, firstAt: now, lastAt: now, points: [] }
  return { ...parks, [parkId]: next }
}

export function checkIn(parkId: string) {
  commit({ ...state, parks: touchPark(state.parks, parkId, true) })
}

/** collecting a point implies being in the park: first collect also marks it visited */
export function collectPoint(parkId: string, poiId: string) {
  let parks = state.parks[parkId] ? state.parks : touchPark(state.parks, parkId, false)
  const park = parks[parkId]
  if (park.points.includes(poiId)) return
  parks = { ...parks, [parkId]: { ...park, points: [...park.points, poiId], lastAt: new Date().toISOString() } }
  const exp = state.expedition
  const expedition =
    exp && exp.parkId === parkId ? { ...exp, collected: [...exp.collected, poiId] } : exp
  commit({ ...state, parks, expedition })
}

export const answerKey = (parkId: string, poiId: string) => `${parkId}/${poiId}`

export function answerDilemma(parkId: string, poiId: string, option: number) {
  commit({ ...state, answers: { ...state.answers, [answerKey(parkId, poiId)]: option } })
}

export function startExpedition(parkId: string) {
  commit(
    { ...state, expedition: { parkId, startedAt: Date.now(), track: [], distanceM: 0, collected: [] } },
    false,
  )
}

export function stopExpedition() {
  const exp = state.expedition
  if (!exp) return
  // a walk earns a journal entry when it produced anything: movement or points
  const worthKeeping = exp.track.length > 4 || exp.collected.length > 0
  const journeys = worthKeeping
    ? [
        ...state.journeys,
        {
          id: `j-${exp.startedAt}`,
          parkId: exp.parkId,
          startedAt: exp.startedAt,
          endedAt: Date.now(),
          distanceM: Math.round(exp.distanceM),
          track: simplifyTrack(exp.track),
          points: exp.collected,
        },
      ]
    : state.journeys
  commit({ ...state, journeys, expedition: null })
}

export function appendTrackPoint(pt: Pt) {
  const exp = state.expedition
  if (!exp) return
  const last = exp.track[exp.track.length - 1]
  // ignore GPS jitter below 3 m so distance does not inflate while standing still
  if (last && distanceM(last, pt) < 3) return
  const added = last ? distanceM(last, pt) : 0
  commit(
    { ...state, expedition: { ...exp, track: [...exp.track, pt], distanceM: exp.distanceM + added } },
    false,
  )
}
