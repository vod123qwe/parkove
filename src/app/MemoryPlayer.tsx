import { useEffect, useRef, useState } from 'react'
import { Map as MapGL } from 'maplibre-gl'
import { ChevronLeft, Layers, Pause } from 'lucide-react'
import type { CSSProperties } from 'react'
import { WavePlayer } from './WavePlayer'
import { MemoryViewer } from './MemoryViewer'
import { PoiModal } from './PoiSheet'
import { REPLAY_LOOKS, replayStyle } from './data/mapstyles'
import type { ReplayLook } from './data/mapstyles'
import { buildTimeline, metresAt, msAtMetres, noteType, pointAt, walkedSoFar } from './memory'
import type { Timeline } from './memory'
import { buildPhotoImage, buildPinImages, pinColors, pinImageId } from './pins'
import type { Journey } from './state'
import type { WalkMark } from './photos'
import type { QuestPoi } from './data/quests'
import { bearingDeg, distanceM } from './geo'
import { useDarkChrome } from './screen'

/** how far ahead of the marker a memory counts as "we are passing it" */
const REACH_M = 22
/**
 * Approaching a memory the walk eases off, but only close to it: with points
 * every eighty metres a wide window turned the whole replay into a crawl.
 */
const SLOW_M = 30
/** and it never drops below a third of the speed you asked for */
const SLOW_FLOOR = 0.35
/** and it stands still this long when the memory lands */
const DWELL_MS = 1100
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
const DIAL_THROW = 130
/** how long the walk takes to reach the speed you asked for: it spins up */
const RATE_TAU = 480
/** how far the arc opens to each side, in degrees */
const DIAL_SWEEP = 52
/** the circle everything on the dial is drawn around, in viewBox units */
const DIAL_CX = 150
const DIAL_CY = 210
const DIAL_R = 176

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
  points,
  marks,
  onClose,
}: {
  journey: Journey
  points: QuestPoi[]
  marks: Array<WalkMark & { url?: string }>
  onClose: () => void
}) {
  const holder = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MapGL | null>(null)
  const readyRef = useRef(false)
  const lineRef = useRef<Timeline | null>(null)
  /** what the dial asks for, and what the walk is actually doing right now */
  const targetRef = useRef(0)
  const rateRef = useRef(0)
  const elapsedRef = useRef(0)
  const bearingRef = useRef<number | null>(null)
  const seenRef = useRef<Set<string>>(new Set())
  const dwellUntil = useRef(0)

  const [elapsed, setElapsed] = useState(0)
  const [memory, setMemory] = useState<Memory | null>(null)
  const [look, setLook] = useState<ReplayLook>('topo')
  useDarkChrome()
  const [looksOpen, setLooksOpen] = useState(false)
  /** whatever the memory was opened into: the full screen version of it */
  const [openMark, setOpenMark] = useState<string | null>(null)
  const [openPoi, setOpenPoi] = useState<QuestPoi | null>(null)
  /** a tap that closed an overlay must not carry on to the button underneath */
  const closedAt = useRef(0)
  const shut = (fn: () => void) => {
    closedAt.current = performance.now()
    fn()
  }

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
      style: replayStyle('topo'),
      center: track[0],
      zoom: 16.6,
      pitch: 58,
      bearing: 0,
      attributionControl: { compact: true },
      // no panning or zooming by hand: the dial and the pins drive this map,
      // but taps still have to arrive, so the handlers are switched off one by one
      dragPan: false,
      dragRotate: false,
      scrollZoom: false,
      touchZoomRotate: false,
      doubleClickZoom: false,
      keyboard: false,
      boxZoom: false,
    })
    mapRef.current = map
    if (import.meta.env.DEV) {
      // a debug handle, the same as the main map has
      ;(window as unknown as { __pkReplay?: MapGL }).__pkReplay = map
    }
    // the bottom third carries the memory, so the walker rides above centre
    map.setPadding({ top: 0, left: 0, right: 0, bottom: Math.round(window.innerHeight * 0.44) })

    const paintOnce = async () => {
      const colors = pinColors()
      const trail = {
        line: colors.trailEdge,
        fill: colors.trailFill,
        me: colors.trailMe,
      }
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

      map.addSource('mem-track', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: track[0] } } as never,
      })
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
        paint: { 'line-color': trail.line, 'line-width': 6 },
      })

      map.addSource('mem-stops', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: stops.current.map((s) => ({
            type: 'Feature',
            properties: {
              markId: s.id,
              icon:
                s.body.kind === 'mark'
                  ? s.body.mark.kind === 'photo'
                    ? `photo-${s.body.mark.id}`
                    : pinImageId(s.body.mark.kind, 'replay')
                  : pinImageId(s.body.poi.category, 'replay'),
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
        id: 'mem-stop-hit',
        type: 'circle',
        source: 'mem-stops',
        paint: { 'circle-radius': 26, 'circle-color': 'transparent' },
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
          // the classic blue puck: the stops are green, so I am not
          'circle-color': trail.me,
          'circle-stroke-width': 3,
          'circle-stroke-color': '#ffffff',
        },
      })

      readyRef.current = true
      draw(elapsedRef.current)
    }

    /*
     * styledata fires several times per style and painting is async, so it
     * needs a latch. The latch has to be released even when the style is
     * swapped mid-paint and an add throws: without the finally, one failed
     * paint locked the map out of ever drawing the route again.
     */
    let painting = false
    /** a broken style must not be retried forever; reset on every new style */
    let tries = 0
    const paint = async () => {
      if (painting || tries > 6 || map.getSource('mem-track')) return
      painting = true
      tries++
      try {
        await paintOnce()
      } catch {
        // the style changed under us; the next styledata will call again
      } finally {
        painting = false
      }
    }
    ;(map as unknown as { __paint: () => void }).__paint = paint

    map.on('load', () => void paint())
    // setStyle wipes our layers, and 'style.load' is unreliable in v5
    map.on('styledata', () => {
      tries = 0
      if (map.isStyleLoaded() && !map.getSource('mem-track')) void paint()
    })
    /*
     * A heavy look (raised ground, a whole vector city) is still settling when
     * styledata arrives, so that call finds the style unready and there is no
     * second one. 'idle' means everything has landed: if the walk is not on the
     * map by then, it never will be, so paint it.
     */
    map.on('idle', () => {
      if (!map.getSource('mem-track')) void paint()
    })

    // tapping a pin walks you there: the marker travels, then stops and speaks
    map.on('click', (e) => {
      if (!map.getLayer('mem-stop-hit')) return
      const hit = map.queryRenderedFeatures(e.point, { layers: ['mem-stop-hit'] })[0]
      const id = hit?.properties?.markId
      if (!id) return
      const stop = stops.current.find((x) => x.id === String(id))
      if (stop) travelTo(stop)
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
      // a beat of stillness, so arriving somewhere actually feels like arriving
      dwellUntil.current = performance.now() + DWELL_MS
    }
  }

  /** an animated walk to a chosen memory, ignoring the throttle while it runs */
  const trip = useRef<{ from: number; to: number; t0: number; dur: number; stop: string } | null>(
    null,
  )
  const travelTo = (stop: { id: string; metres: number; body: Memory }) => {
    const to = msAtMetres(timeline, stop.metres)
    const from = elapsedRef.current
    const gap = Math.abs(to - from)
    targetRef.current = 0
    rateRef.current = 0
    posRef.current = 0
    setPos(0)
    trip.current = {
      from,
      to,
      t0: performance.now(),
      // near things are a step, far things a proper walk, but never a slog
      dur: Math.max(600, Math.min(1600, 600 + gap / 60)),
      stop: stop.id,
    }
    setMemory(stop.body)
  }

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const step = (now: number) => {
      const dt = now - last
      last = now

      // a walk does not jump to a speed: it gathers it, and it coasts down
      const target = targetRef.current
      if (rateRef.current !== target) {
        const k = 1 - Math.exp(-dt / RATE_TAU)
        rateRef.current += (target - rateRef.current) * k
        if (Math.abs(target - rateRef.current) < 0.04) rateRef.current = target
      }

      // travelling to a pin the walker was sent to: nothing else moves it
      const going = trip.current
      if (going) {
        const p = Math.min(1, (now - going.t0) / going.dur)
        // ease in and out: it sets off, covers ground, and lands softly
        const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2
        const next = going.from + (going.to - going.from) * e
        elapsedRef.current = next
        setElapsed(next)
        draw(next, dt)
        if (p >= 1) {
          seenRef.current.add(going.stop)
          dwellUntil.current = now + DWELL_MS
          trip.current = null
        }
        raf = requestAnimationFrame(step)
        return
      }

      let r = rateRef.current
      // standing at a memory: the walk holds itself still for a moment
      if (now < dwellUntil.current) r = 0
      if (r > 0) {
        // approaching something you left: slow down, the way you would
        const metresNow = metresAt(timeline, elapsedRef.current)
        let nearest = Infinity
        for (const stop of stops.current) {
          if (seenRef.current.has(stop.id)) continue
          const gap = stop.metres - metresNow
          if (gap >= 0 && gap < nearest) nearest = gap
        }
        if (nearest < SLOW_M) {
          const t = Math.max(0, nearest / SLOW_M)
          r *= SLOW_FLOOR + (1 - SLOW_FLOOR) * t * t
        }
      }
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
          targetRef.current = 0
          rateRef.current = 0
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
  const dragFrom = useRef<{ x: number; pos: number } | null>(null)

  /** the handle rides the arc; the speed it asks for rises as its square */
  const applyPos = (next: number) => {
    const p = Math.abs(next) < 0.05 ? 0 : Math.max(-1, Math.min(1, next))
    posRef.current = p
    setPos(p)
    targetRef.current = Math.sign(p) * MAX_RATE * p * p
  }

  const onDialDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(tween.current)
    trip.current = null
    try {
      // capture keeps the drag alive outside the arc; losing it is survivable
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // some engines refuse: the drag still works through this element
    }
    dragFrom.current = { x: e.clientX, pos: posRef.current }
  }
  const onDialMove = (e: React.PointerEvent) => {
    const from = dragFrom.current
    if (!from) return
    // sideways along the arc: right walks on, left walks back
    applyPos(from.pos + (e.clientX - from.x) / DIAL_THROW)
  }
  const onDialUp = () => {
    dragFrom.current = null
  }

  /**
   * Pausing lets the handle spring back rather than teleport: it overshoots
   * the middle by a hair and settles, which is what makes it feel sprung.
   */
  const tween = useRef(0)
  const centre = () => {
    cancelAnimationFrame(tween.current)
    const from = posRef.current
    if (from === 0) return
    const t0 = performance.now()
    const DUR = 360
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / DUR)
      const eased = 1 - Math.pow(1 - p, 3)
      const overshoot = Math.sin(p * Math.PI) * 0.05 * -Math.sign(from)
      applyPos(from * (1 - eased) + overshoot)
      if (p < 1) tween.current = requestAnimationFrame(step)
      else applyPos(0)
    }
    tween.current = requestAnimationFrame(step)
  }

  return (
    <div className="memplay">
      <div ref={holder} className="memplay__map" />

      <div className="memplay__floor" aria-hidden="true">
        <span style={{ '--b': '1px', '--from': '0%', '--to': '38%' } as CSSProperties} />
        <span style={{ '--b': '3px', '--from': '24%', '--to': '66%' } as CSSProperties} />
        <span style={{ '--b': '7px', '--from': '48%', '--to': '88%' } as CSSProperties} />
        <span style={{ '--b': '12px', '--from': '70%', '--to': '100%' } as CSSProperties} />
      </div>

      <button
        className="memplay__back"
        aria-label="Wyjdź ze wspomnień"
        onClick={() => {
          if (performance.now() - closedAt.current < 500) return
          onClose()
        }}
      >
        <ChevronLeft size={20} />
      </button>

      <button
        className="memplay__look"
        aria-label="Zmień wygląd mapy"
        onClick={() => setLooksOpen((v) => !v)}
      >
        <Layers size={19} />
      </button>

      {looksOpen && (
        <div className="memplay__looks">
          {REPLAY_LOOKS.map((l) => (
            <button
              key={l.id}
              className={`memplay__lookopt${l.id === look ? ' -on' : ''}`}
              onClick={() => {
                setLooksOpen(false)
                if (l.id === look) return
                setLook(l.id)
                readyRef.current = false
                const map = mapRef.current
                if (!map) return
                // the raised ground survives a style swap unless it is dropped
                try {
                  map.setTerrain(null)
                } catch {
                  // no terrain to drop
                }
                map.setStyle(replayStyle(l.id))
              }}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}

      <div className="memplay__bottom">
        {memory && (
          <button
            className="memplay__memory"
            onClick={() => {
              // stop where we are: reading is not walking
              targetRef.current = 0
              rateRef.current = 0
              posRef.current = 0
              setPos(0)
              if (memory.kind === 'mark') setOpenMark(memory.id)
              else setOpenPoi(memory.poi)
            }}
          >
            {memory.kind === 'mark' ? (
              memory.mark.kind === 'photo' && memory.mark.url ? (
                <>
                  <img className="memplay__snap" src={memory.mark.url} alt={memory.mark.caption} />
                  {memory.mark.caption && <p className="memplay__said">{memory.mark.caption}</p>}
                </>
              ) : memory.mark.kind === 'audio' && memory.mark.url ? (
                <>
                  <WavePlayer src={memory.mark.url} blob={memory.mark.blob} autoPlay />
                  {memory.mark.caption && <p className="memplay__said">{memory.mark.caption}</p>}
                </>
              ) : (
                <p
                  className="memplay__postit"
                  style={noteType(memory.mark.caption || 'Pusta notatka')}
                >
                  {memory.mark.caption || 'Pusta notatka'}
                </p>
              )
            ) : (
              <>
                <p className="t-body-strong memplay__poiname">{memory.poi.name}</p>
                <p className="t-body-sm memplay__teaser">{memory.poi.teaser}</p>
                <span className="memplay__more">czytaj więcej</span>
              </>
            )}
          </button>
        )}

        <div className="memplay__clock">
          <span className="memplay__time">{fmtClock(elapsed).replace(':', ' : ')}</span>
          <span className="memplay__clocklabel">czas wyprawy</span>
        </div>

        <div
          className="memplay__dial"
          onPointerDown={onDialDown}
          onPointerMove={onDialMove}
          onPointerUp={onDialUp}
          onPointerCancel={onDialUp}
        >
          {/* ticks and the arc live under a shadow that eats their ends */}
          <div className="memplay__arcwrap">
            <svg className="memplay__arc" viewBox="0 0 300 110" aria-hidden="true">
              {/*
                * The fade lives here rather than in a CSS mask: a gradient in
                * user space around the same centre the ticks radiate from
                * dissolves every tick along its own length, at exactly the
                * right radius, whatever size the dial ends up.
                */}
              <defs>
                <radialGradient
                  id="pk-tick-fade"
                  gradientUnits="userSpaceOnUse"
                  cx={DIAL_CX}
                  cy={DIAL_CY}
                  r={DIAL_R + 35}
                >
                  <stop offset="0.84" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="0.9" stopColor="#ffffff" stopOpacity="0.18" />
                  <stop offset="0.95" stopColor="#ffffff" stopOpacity="0.55" />
                  <stop offset="1" stopColor="#ffffff" stopOpacity="0.95" />
                </radialGradient>
              </defs>
              <path
                d="M 11.3 101.6 A 176 176 0 0 1 288.7 101.6"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
              {Array.from({ length: 61 }, (_, i) => {
                const at = (i / 60) * 2 - 1
                const a = at * DIAL_SWEEP * (Math.PI / 180)
                return (
                  <line
                    key={i}
                    x1={DIAL_CX + Math.sin(a) * (DIAL_R + 1)}
                    y1={DIAL_CY - Math.cos(a) * (DIAL_R + 1)}
                    x2={DIAL_CX + Math.sin(a) * (DIAL_R + 35)}
                    y2={DIAL_CY - Math.cos(a) * (DIAL_R + 35)}
                    stroke="url(#pk-tick-fade)"
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                )
              })}
            </svg>
          </div>

          {/* the handle sits above that shadow, so it never dims */}
          <svg className="memplay__handlelayer" viewBox="0 0 300 110" aria-hidden="true">
            <g transform={`rotate(${pos * DIAL_SWEEP} ${DIAL_CX} ${DIAL_CY})`}>
              <rect
                x={DIAL_CX - 34}
                y={DIAL_CY - DIAL_R - 19}
                width="68"
                height="38"
                rx="19"
                fill="var(--trail-fill)"
                stroke="var(--trail-edge)"
                strokeWidth="3"
              />
              {[-3.5, 3.5].map((dx) =>
                [-3.5, 3.5].map((dy) => (
                  <rect
                    key={`${dx}${dy}`}
                    x={DIAL_CX + dx - 1.5}
                    y={DIAL_CY - DIAL_R + dy - 1.5}
                    width="3"
                    height="3"
                    rx="0.8"
                    fill="#ffffff"
                  />
                )),
              )}
            </g>
          </svg>

        </div>

        <button className="memplay__pause" aria-label="Zatrzymaj przewijanie" onClick={centre}>
          <Pause size={20} />
        </button>

        {openMark && (
          <MemoryViewer
            marks={marks}
            startId={openMark}
            onClose={() => shut(() => setOpenMark(null))}
          />
        )}

        <PoiModal
          poi={openPoi}
          parkId={journey.parkId}
          collected
          onClose={() => shut(() => setOpenPoi(null))}
        />
      </div>
    </div>
  )
}
