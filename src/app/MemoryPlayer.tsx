import { useEffect, useRef, useState } from 'react'
import { Map as MapGL } from 'maplibre-gl'
import { ChevronLeft, Mic, Pause, StickyNote } from 'lucide-react'
import { CINEMATIC } from './data/mapstyles'
import { buildTimeline, metresAt, pointAt, walkedSoFar } from './memory'
import type { Timeline } from './memory'
import { buildPhotoImage, buildPinImages, pinColors, pinImageId } from './pins'
import type { Journey } from './state'
import type { WalkMark } from './photos'
import type { QuestPoi } from './data/quests'
import { bearingDeg, distanceM } from './geo'

/** how far ahead of the marker a memory counts as "we are passing it" */
const REACH_M = 22
/** the camera aims at a point this far up the route, so it turns before you do */
const LOOKAHEAD_M = 28
/** how long the camera takes to settle on a new heading, in ms */
const TURN_TAU = 420
/**
 * At the top the dial should skim a whole walk in under a minute, but the
 * bottom half has to stay usable, so the throttle is squared: half travel is
 * a tenth of the top speed.
 */
const MAX_RATE = 90
/** travel of the handle, in pixels, from the middle to either end */
const DIAL_THROW = 96

/** a walk is usually minutes, so read it as mm:ss until it passes an hour */
const fmtClock = (ms: number) => {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

type Memory =
  | { kind: 'mark'; id: string; at: number; mark: WalkMark & { url?: string } }
  | { kind: 'poi'; id: string; at: number; poi: QuestPoi }

/**
 * Walking the same route again, at whatever speed you feel like. The dial in
 * the corner is a throttle, not a scrubber: push it up and your past self
 * starts moving, push further and the walk speeds up, pull below the middle
 * and it runs backwards. Memories arrive as you reach the places they were
 * left at, which is the whole point of doing it this way.
 */
export function MemoryPlayer({
  journey,
  parkName,
  points,
  marks,
  onClose,
}: {
  journey: Journey
  parkName: string
  points: QuestPoi[]
  marks: Array<WalkMark & { url?: string }>
  onClose: () => void
}) {
  const holder = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapGL | null>(null)
  const readyRef = useRef(false)
  const lineRef = useRef<Timeline | null>(null)
  const rateRef = useRef(0)
  const elapsedRef = useRef(0)
  const bearingRef = useRef<number | null>(null)
  const seenRef = useRef<Set<string>>(new Set())

  const [rate, setRate] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [memory, setMemory] = useState<Memory | null>(null)

  const timeline = (lineRef.current ??= buildTimeline(journey, points))
  const track = journey.track

  // memories in the order they were left, each at its distance along the walk
  const stops = useRef<Array<{ id: string; metres: number; body: Memory }>>([])
  if (stops.current.length === 0) {
    const list: Array<{ id: string; metres: number; body: Memory }> = []
    const atMetres = (coords: [number, number]) => {
      let best = 0
      let bestD = Infinity
      for (let i = 0; i < track.length; i++) {
        const d = distanceM(track[i], coords)
        if (d < bestD) {
          bestD = d
          best = i
        }
      }
      return bestD <= 120 ? timeline.dist[best] : -1
    }
    for (const m of marks) {
      if (!m.coords) continue
      const metres = atMetres(m.coords)
      if (metres >= 0) list.push({ id: m.id, metres, body: { kind: 'mark', id: m.id, at: m.at, mark: m } })
    }
    for (const p of points) {
      if (!journey.points.includes(p.id)) continue
      const metres = atMetres(p.coords)
      if (metres >= 0)
        list.push({ id: p.id, metres, body: { kind: 'poi', id: p.id, at: journey.times?.[p.id] ?? 0, poi: p } })
    }
    stops.current = list.sort((a, b) => a.metres - b.metres)
  }

  // ---- the map, built once ----
  useEffect(() => {
    if (!holder.current || track.length === 0) return
    const map = new MapGL({
      container: holder.current,
      style: CINEMATIC,
      center: track[0],
      zoom: 16.6,
      pitch: 58,
      bearing: 0,
      attributionControl: { compact: true },
      interactive: false,
    })
    mapRef.current = map

    map.on('load', async () => {
      const colors = pinColors()
      for (const [id, img] of await buildPinImages(colors)) {
        if (!map.hasImage(id)) map.addImage(id, img)
      }
      for (const m of marks) {
        if (m.kind !== 'photo' || !m.blob) continue
        const id = `photo-${m.id}`
        if (map.hasImage(id)) continue
        try {
          map.addImage(id, await buildPhotoImage(m.blob, '#ffffff'))
        } catch {
          // a picture that will not decode simply gets no pin
        }
      }

      map.addSource('mem-ahead', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: track },
        } as never,
      })
      map.addLayer({
        id: 'mem-ahead-line',
        type: 'line',
        source: 'mem-ahead',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#ffffff', 'line-width': 4, 'line-opacity': 0.45 },
      })

      map.addSource('mem-done', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: [track[0], track[0]] },
        } as never,
      })
      map.addLayer({
        id: 'mem-done-line',
        type: 'line',
        source: 'mem-done',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#8ce563', 'line-width': 6 },
      })

      map.addSource('mem-stops', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stops.current.map((s) => ({
            type: 'Feature',
            properties: {
              icon:
                s.body.kind === 'mark'
                  ? s.body.mark.kind === 'photo'
                    ? `photo-${s.body.mark.id}`
                    : pinImageId(s.body.mark.kind, s.body.mark.kind)
                  : pinImageId(s.body.poi.category, 'done'),
            },
            geometry: {
              type: 'Point',
              coordinates:
                s.body.kind === 'mark' ? (s.body.mark.coords as [number, number]) : s.body.poi.coords,
            },
          })),
        } as never,
      })
      map.addLayer({
        id: 'mem-stop-pins',
        type: 'symbol',
        source: 'mem-stops',
        layout: {
          'icon-image': ['get', 'icon'] as never,
          'icon-size': 0.46,
          'icon-allow-overlap': true,
          'icon-pitch-alignment': 'viewport',
        },
      })

      map.addSource('mem-me', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'Point', coordinates: track[0] },
        } as never,
      })
      map.addLayer({
        id: 'mem-me-dot',
        type: 'circle',
        source: 'mem-me',
        paint: {
          'circle-radius': 9,
          'circle-color': '#8ce563',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#0f1a0d',
        },
      })

      readyRef.current = true
      draw(0)
    })

    return () => {
      map.remove()
      mapRef.current = null
      readyRef.current = false
    }
    // built once: a replay shows one finished walk that cannot change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- moving through the walk ----
  const draw = (ms: number, dt = 0) => {
    const map = mapRef.current
    if (!map || !readyRef.current) return
    const metres = metresAt(timeline, ms)
    const { at, bearing: segment } = pointAt(track, timeline.dist, metres)

    // aim at where the route goes next, not at the step underfoot: a corner
    // then reads as a turn of the head instead of a cut
    const ahead = pointAt(track, timeline.dist, metres + LOOKAHEAD_M).at
    const target =
      Math.abs(ahead[0] - at[0]) + Math.abs(ahead[1] - at[1]) > 1e-7
        ? bearingDeg(at, ahead)
        : segment
    if (bearingRef.current == null) bearingRef.current = target
    else {
      // shortest way round, eased by time rather than by frames
      let delta = ((target - bearingRef.current + 540) % 360) - 180
      const k = dt > 0 ? 1 - Math.exp(-dt / TURN_TAU) : 1
      bearingRef.current += delta * k
    }
    const bearing = bearingRef.current
    ;(map.getSource('mem-me') as { setData: (d: unknown) => void } | undefined)?.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: at },
    } as never)
    ;(map.getSource('mem-done') as { setData: (d: unknown) => void } | undefined)?.setData({
      type: 'Feature',
      properties: {},
      geometry: { type: 'LineString', coordinates: walkedSoFar(track, timeline.dist, metres) },
    } as never)
    map.jumpTo({ center: at, bearing, zoom: 16.6, pitch: 58 })

    // a memory shows up when we reach where it was left
    const hit = stops.current.find(
      (s) => Math.abs(s.metres - metres) <= REACH_M && !seenRef.current.has(s.id),
    )
    if (hit) {
      seenRef.current.add(hit.id)
      setMemory(hit.body)
      navigator.vibrate?.(25)
    }
  }

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = now - last
      last = now
      const r = rateRef.current
      if (r !== 0) {
        const next = Math.max(0, Math.min(timeline.totalMs, elapsedRef.current + dt * r))
        if (next !== elapsedRef.current) {
          elapsedRef.current = next
          setElapsed(next)
          draw(next, dt)
          // rewinding should let a memory happen again on the way back
          if (r < 0) {
            const metres = metresAt(timeline, next)
            for (const s of stops.current) {
              if (s.metres > metres + REACH_M) seenRef.current.delete(s.id)
            }
          }
        }
        if (next === timeline.totalMs || next === 0) {
          posRef.current = 0
          setPos(0)
          rateRef.current = 0
          setRate(0)
        }
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- the dial: a throttle that stays where you leave it ----
  const posRef = useRef(0)
  const [pos, setPos] = useState(0)
  const dragFrom = useRef<{ y: number; pos: number } | null>(null)

  /** the handle moves in a straight line, the speed rises as its square */
  const applyPos = (next: number) => {
    const p = Math.abs(next) < 0.06 ? 0 : Math.max(-1, Math.min(1, next))
    posRef.current = p
    setPos(p)
    const r = Math.sign(p) * MAX_RATE * p * p
    rateRef.current = r
    setRate(r)
  }

  const onDialDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragFrom.current = { y: e.clientY, pos: posRef.current }
  }
  const onDialMove = (e: React.PointerEvent) => {
    const from = dragFrom.current
    if (!from) return
    applyPos(from.pos + (from.y - e.clientY) / DIAL_THROW)
  }
  const onDialUp = () => {
    dragFrom.current = null
  }

  const done = elapsed >= timeline.totalMs
  const fmtRate = (r: number) => (Math.abs(r) >= 10 ? Math.round(Math.abs(r)) : Math.abs(r).toFixed(1))

  return (
    <div className="memplay">
      <div ref={holder} className="memplay__map" />

      <div className="memplay__top">
        <button className="memplay__back" aria-label="Wyjdź ze wspomnień" onClick={onClose}>
          <ChevronLeft size={20} />
        </button>
        <div className="memplay__title">
          <span className="t-body-strong">{journey.name ?? parkName}</span>
          <span className="t-caption memplay__sub">{parkName}</span>
        </div>
      </div>

      <div className="memplay__clock">
        <span className="t-caption memplay__clocklabel">czas wyprawy</span>
        <span className="memplay__time">{fmtClock(elapsed)}</span>
        <span className="t-caption memplay__clocklabel">
          {done ? 'koniec trasy' : rate === 0 ? 'przesuń suwak' : `${rate > 0 ? '' : '−'}${fmtRate(rate)}×`}
        </span>
      </div>

      {memory && (
        <div className="memplay__card">
          <button
            className="memplay__cardclose"
            aria-label="Schowaj wspomnienie"
            onClick={() => setMemory(null)}
          >
            ×
          </button>
          {memory.kind === 'mark' ? (
            memory.mark.kind === 'photo' && memory.mark.url ? (
              <>
                <img className="memplay__photo" src={memory.mark.url} alt={memory.mark.caption} />
                {memory.mark.caption && <p className="t-body memplay__cap">{memory.mark.caption}</p>}
              </>
            ) : memory.mark.kind === 'audio' && memory.mark.url ? (
              <>
                <span className="memplay__kind">
                  <Mic size={16} /> Notatka głosowa
                </span>
                <audio src={memory.mark.url} controls autoPlay className="memplay__audio" />
              </>
            ) : (
              <>
                <span className="memplay__kind">
                  <StickyNote size={16} /> Notatka
                </span>
                <p className="memplay__note">{memory.mark.caption || 'Pusta notatka'}</p>
              </>
            )
          ) : (
            <>
              <span className="memplay__kind">Punkt wyprawy</span>
              <p className="t-body-strong memplay__poiname">{memory.poi.name}</p>
              <p className="t-body-sm memplay__cap">{memory.poi.teaser}</p>
            </>
          )}
        </div>
      )}

      <div
        className="memplay__dial"
        onPointerDown={onDialDown}
        onPointerMove={onDialMove}
        onPointerUp={onDialUp}
        onPointerCancel={onDialUp}
      >
        <div className="memplay__dialtrack" aria-hidden="true">
          {Array.from({ length: 21 }, (_, i) => (
            <span key={i} className={i === 10 ? '-mid' : undefined} />
          ))}
        </div>
        <button
          className="memplay__handle"
          style={{ transform: `translateY(${-pos * DIAL_THROW}px)` }}
          aria-label="Suwak przewijania wyprawy"
          onClick={() => applyPos(0)}
        >
          {rate === 0 ? <span className="memplay__grip" /> : <Pause size={16} />}
        </button>
        <span className="t-caption memplay__dialhint">
          {rate === 0 ? 'przesuń w górę' : rate > 0 ? 'idziesz' : 'wracasz'}
        </span>
      </div>
    </div>
  )
}
