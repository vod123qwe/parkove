import { bearingDeg, distanceM } from './geo'
import type { Pt } from './geo'
import type { Journey } from './state'
import type { QuestPoi } from './data/quests'

/**
 * The timeline of a replay. The walk was not recorded with a stamp on every
 * step, so the pace is even between anchors, and the anchors are the moments
 * we do know: the start, the end, and the minute each point was reached.
 * That is enough for the replay to pass the monument when you really did.
 */
export type Timeline = {
  /** cumulative distance along the track, one per point */
  dist: number[]
  totalM: number
  totalMs: number
  /** sorted [elapsedMs, metres] pairs the interpolation runs between */
  anchors: Array<[number, number]>
}

export function buildTimeline(journey: Journey, points: QuestPoi[]): Timeline {
  const track = journey.track
  const dist: number[] = [0]
  for (let i = 1; i < track.length; i++) {
    dist.push(dist[i - 1] + distanceM(track[i - 1], track[i]))
  }
  const totalM = dist[dist.length - 1] ?? 0
  const totalMs = Math.max(1000, journey.endedAt - journey.startedAt)

  const anchors: Array<[number, number]> = [[0, 0]]
  for (const poi of points) {
    const at = journey.times?.[poi.id]
    if (!at) continue
    const elapsed = at - journey.startedAt
    if (elapsed <= 0 || elapsed >= totalMs) continue
    // where on the track that point was closest: that is where we were
    let best = 0
    let bestD = Infinity
    for (let i = 0; i < track.length; i++) {
      const d = distanceM(track[i], poi.coords)
      if (d < bestD) {
        bestD = d
        best = i
      }
    }
    anchors.push([elapsed, dist[best]])
  }
  anchors.push([totalMs, totalM])
  anchors.sort((a, b) => a[0] - b[0])

  // an anchor that would make the walk go backwards is worse than no anchor
  const clean: Array<[number, number]> = [anchors[0]]
  for (const a of anchors.slice(1)) {
    const prev = clean[clean.length - 1]
    if (a[0] > prev[0] && a[1] >= prev[1]) clean.push(a)
  }
  if (clean[clean.length - 1][0] < totalMs) clean.push([totalMs, totalM])

  return { dist, totalM, totalMs, anchors: clean }
}

/** metres walked by this point in the replay */
export function metresAt(t: Timeline, elapsedMs: number) {
  const ms = Math.max(0, Math.min(t.totalMs, elapsedMs))
  for (let i = 1; i < t.anchors.length; i++) {
    const [t1, d1] = t.anchors[i]
    const [t0, d0] = t.anchors[i - 1]
    if (ms <= t1) {
      const span = t1 - t0 || 1
      return d0 + ((ms - t0) / span) * (d1 - d0)
    }
  }
  return t.totalM
}

/** position and heading after walking this many metres */
export function pointAt(track: Pt[], dist: number[], metres: number): { at: Pt; bearing: number } {
  if (track.length === 0) return { at: [0, 0], bearing: 0 }
  if (track.length === 1) return { at: track[0], bearing: 0 }
  const m = Math.max(0, Math.min(dist[dist.length - 1], metres))
  let i = 1
  while (i < dist.length - 1 && dist[i] < m) i++
  const span = dist[i] - dist[i - 1] || 1
  const f = (m - dist[i - 1]) / span
  const a = track[i - 1]
  const b = track[i]
  return {
    at: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f],
    bearing: bearingDeg(a, b),
  }
}

/** the walked part of the route, for the bright line behind the marker */
export function walkedSoFar(track: Pt[], dist: number[], metres: number): Pt[] {
  if (track.length < 2) return track
  const out: Pt[] = []
  for (let i = 0; i < track.length; i++) {
    if (dist[i] <= metres) out.push(track[i])
    else break
  }
  const head = pointAt(track, dist, metres).at
  if (out.length === 0) return [track[0], head]
  out.push(head)
  return out
}

/** the other way round: at what point in the walk were we this far along */
export function msAtMetres(t: Timeline, metres: number) {
  const m = Math.max(0, Math.min(t.totalM, metres))
  for (let i = 1; i < t.anchors.length; i++) {
    const [t1, d1] = t.anchors[i]
    const [t0, d0] = t.anchors[i - 1]
    if (m <= d1) {
      const span = d1 - d0 || 1
      return t0 + ((m - d0) / span) * (t1 - t0)
    }
  }
  return t.totalMs
}
