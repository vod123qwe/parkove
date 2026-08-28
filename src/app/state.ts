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

/** one GPS reading: where, how sure, which way we are heading */
export type Fix = { coords: Pt; accuracy: number; course: number | null }

export type Expedition = {
  /** shared with the journey it becomes, so photos can point at it */
  id: string
  parkId: string
  /** what the walk gets called in the journal, e.g. "Ruczaj, czwartek" */
  name: string
  startedAt: number
  track: Pt[]
  distanceM: number
  /** poi ids collected during this walk */
  collected: string[]
  /** when each point was reached, so the journal can say at what hour */
  times: Record<string, number>
  /** latest position, null until the first fix arrives */
  where: Fix | null
}

export type Journey = {
  id: string
  parkId: string
  name?: string
  /** written afterwards, at home: what this walk was like */
  note?: string
  startedAt: number
  endedAt: number
  distanceM: number
  /** simplified GPS track */
  track: Pt[]
  points: string[]
  /** poi id -> timestamp, for walks recorded since this became a thing */
  times?: Record<string, number>
}

/** co widac na mapie dla wybranego miejsca */
export type MapFilters = {
  trail: boolean
  play: boolean
  food: boolean
  parking: boolean
}

export const DEFAULT_FILTERS: MapFilters = { trail: true, play: true, food: true, parking: true }

type GameState = {
  parks: Record<string, ParkProgress>
  /** persistent walk log */
  journeys: Journey[]
  /** dilemma answers, keyed "parkId/poiId" -> chosen option index */
  answers: Record<string, number>
  /**
   * Wybrany szlak per miejsce: parkId -> id trasy z data/trails.ts.
   * Zapisywany na stałe, bo wybór robi się w domu przy planowaniu, a w dolinie
   * aplikacja może zostać przeładowana i nie ma jak wybrać ponownie bez sieci.
   */
  trails: Record<string, string>
  /**
   * Filtry mapy. Zapisywane, bo ustawienie ma przeżyć odklikniecie parku: filtry
   * znikają z ekranu razem z wyborem miejsca, ale wracają takie same przy
   * następnym. Parkingi domyślnie włączone, bo to był powód, dla którego filtry
   * powstały: chcę widzieć wszystkie, nie tylko sugerowany.
   */
  filters: MapFilters
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
        trails?: Record<string, string>
        filters?: Partial<MapFilters>
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
      return {
        parks,
        journeys: parsed.journeys ?? [],
        answers: parsed.answers ?? {},
        trails: parsed.trails ?? {},
        filters: { ...DEFAULT_FILTERS, ...(parsed.filters ?? {}) },
        expedition: null,
      }
    }
  } catch {
    // corrupted local state: start fresh rather than crash the app
  }
  return {
    parks: {},
    journeys: [],
    answers: {},
    trails: {},
    filters: { ...DEFAULT_FILTERS },
    expedition: null,
  }
}

let state: GameState = load()
const listeners = new Set<() => void>()

function commit(next: GameState, persist = true) {
  state = next
  if (persist)
    localStorage.setItem(
      KEY,
      JSON.stringify({
        parks: state.parks,
        journeys: state.journeys,
        answers: state.answers,
        trails: state.trails,
        filters: state.filters,
      }),
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
    exp && exp.parkId === parkId
      ? { ...exp, collected: [...exp.collected, poiId], times: { ...exp.times, [poiId]: Date.now() } }
      : exp
  commit({ ...state, parks, expedition })
}

export const answerKey = (parkId: string, poiId: string) => `${parkId}/${poiId}`

export function answerDilemma(parkId: string, poiId: string, option: number) {
  commit({ ...state, answers: { ...state.answers, [answerKey(parkId, poiId)]: option } })
}

/**
 * Wybór szlaku dla miejsca. Ten sam klik włącza i wyłącza, bo wariantów jest
 * kilka i przełączanie ma być jednym dotknięciem, bez osobnego „wyczyść".
 */
export function chooseTrail(parkId: string, trailId: string | null) {
  const trails = { ...state.trails }
  if (!trailId || trails[parkId] === trailId) delete trails[parkId]
  else trails[parkId] = trailId
  commit({ ...state, trails })
}

export function setFilter(key: keyof MapFilters, on: boolean) {
  commit({ ...state, filters: { ...state.filters, [key]: on } })
}

export function startExpedition(parkId: string, name: string) {
  const startedAt = Date.now()
  commit(
    {
      ...state,
      expedition: {
        id: `j-${startedAt}`,
        parkId,
        name,
        startedAt,
        track: [],
        distanceM: 0,
        collected: [],
        times: {},
        where: null,
      },
    },
    false,
  )
}

/**
 * Konczy wyprawe i zapisuje ja w dzienniku.
 *
 * `keepTrackPoints` obcina slad do podanej liczby punktow. Sluzy do jednego:
 * kiedy apka sama zauwazy, ze oddalasz sie od parku, i potwierdzisz, ze to
 * juz koniec, droga powrotna (czesto autem) NIE ma trafic do dziennika jako
 * czesc spaceru. Kontroler pamieta, ile punktow slad mial, gdy byles jeszcze
 * na miejscu, i to jest ta liczba. Dystans liczymy wtedy od nowa, bo licznik
 * biegl dalej razem z jazda.
 */
export function stopExpedition(opts?: { keepTrackPoints?: number }) {
  const exp = state.expedition
  if (!exp) return
  const cut = opts?.keepTrackPoints
  const track = cut != null && cut >= 0 && cut < exp.track.length ? exp.track.slice(0, cut) : exp.track
  const distance =
    track === exp.track
      ? exp.distanceM
      : track.reduce((sum, pt, i) => (i ? sum + distanceM(track[i - 1], pt) : 0), 0)
  // a walk earns a journal entry when it produced anything: movement or points
  const worthKeeping = track.length > 4 || exp.collected.length > 0
  const journeys = worthKeeping
    ? [
        ...state.journeys,
        {
          id: exp.id,
          parkId: exp.parkId,
          name: exp.name,
          startedAt: exp.startedAt,
          endedAt: Date.now(),
          distanceM: Math.round(distance),
          track: simplifyTrack(track),
          points: exp.collected,
          times: exp.times,
        },
      ]
    : state.journeys
  commit({ ...state, journeys, expedition: null })
}

/** a reading this vague would drag the drawn line through buildings */
const USABLE_ACCURACY_M = 25

/**
 * Every GPS reading lands here: it always updates where we are (even a vague
 * one is better than nothing for the dot), but only a decent one is allowed to
 * extend the drawn path and the distance walked.
 */
export function recordFix(fix: Fix) {
  const exp = state.expedition
  if (!exp) return
  const last = exp.track[exp.track.length - 1]
  const moved = last ? distanceM(last, fix.coords) : Infinity
  // ignore jitter below 5 m so the distance does not inflate while standing still
  const extend = fix.accuracy <= USABLE_ACCURACY_M && moved >= 5
  commit(
    {
      ...state,
      expedition: {
        ...exp,
        where: fix,
        track: extend ? [...exp.track, fix.coords] : exp.track,
        distanceM: extend && last ? exp.distanceM + moved : exp.distanceM,
      },
    },
    false,
  )
}

/** used by the dev simulation, which has no GPS to speak of */
/** a walk stays editable: its name and note can be written long after */
export function updateJourney(id: string, patch: Partial<Pick<Journey, 'name' | 'note'>>) {
  commit({
    ...state,
    journeys: state.journeys.map((j) => (j.id === id ? { ...j, ...patch } : j)),
  })
}

export function deleteJourney(id: string) {
  commit({ ...state, journeys: state.journeys.filter((j) => j.id !== id) })
}

export function appendTrackPoint(pt: Pt) {
  recordFix({ coords: pt, accuracy: 5, course: null })
}
