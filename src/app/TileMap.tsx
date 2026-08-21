import { useLayoutEffect, useRef, useState } from 'react'
import parksData from './data/parks.json'
import { distanceM, formatDistance } from './geo'
import type { Pt } from './geo'
import type { WalkRoute } from './data/walk-routes'

/**
 * Mały kadr prawdziwej mapy, składany z kafli satelitarnych bez drugiej
 * instancji MapLibre.
 *
 * Dlaczego tak: druga mapa GL to drugi kontekst graficzny, a w liście miejsc
 * byłoby ich kilka naraz. Tu liczymy sami rzut Mercatora, wstawiamy kafle jako
 * zwykłe obrazki (leniwie, więc płacimy tylko za widoczne) i na tym rysujemy
 * obrys parku, punkt i linię dojścia. Kafle te same co na dużej mapie, więc
 * service worker ma je już w pamięci.
 *
 * Linia jest prosta i tak ją opisujemy: to kierunek i odległość, nie trasa.
 * Prawdziwą drogę daje przycisk prowadzenia, bo tego nie policzymy offline.
 */
const TILE = 256
const SRC = (z: number, x: number, y: number) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`

const worldX = (lon: number, z: number) => ((lon + 180) / 360) * TILE * 2 ** z
const worldY = (lat: number, z: number) => {
  const s = Math.sin((lat * Math.PI) / 180)
  return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * 2 ** z
}

export function TileMap({
  parkId,
  point,
  route,
  height = 132,
}: {
  parkId: string
  /** miejsce, do którego prowadzimy: parking, kawiarnia, plac zabaw */
  point: Pt
  /**
   * Prawdziwa trasa pieszo, policzona routerem OSM i zapisana w danych. Gdy jest,
   * rysujemy ją zamiast linii prostej, bo tylko ona odpowiada na pytanie „czy tam
   * dojdę”. Bez niej zostaje kierunek i wyraźnie to piszemy.
   */
  route?: WalkRoute | null
  height?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setW(Math.round(el.clientWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const feature = (parksData as { features: Array<{ id: string; geometry: { type: string; coordinates: unknown } }> }).features.find(
    (f) => f.id === parkId,
  )
  const rings: number[][][] = !feature
    ? []
    : feature.geometry.type === 'Polygon'
      ? (feature.geometry.coordinates as number[][][])
      : (feature.geometry.coordinates as number[][][][]).flat()

  /* najbliższy punkt granicy parku: tam kończy się linia dojścia */
  const near = rings
    .flat()
    .map((c) => ({ c: [c[0], c[1]] as Pt, d: distanceM(point, [c[0], c[1]]) }))
    .sort((a, b) => a.d - b.d)[0]

  if (!w || !near) return <div className="app-tilemap" ref={ref} style={{ height }} />

  /* dobierz przybliżenie tak, żeby oba końce linii zmieściły się w kadrze */
  const pad = 26
  const path: Pt[] = route?.line?.length ? (route.line as Pt[]) : [point, near.c]
  const lons = path.map((c) => c[0])
  const lats = path.map((c) => c[1])
  let z = 17
  for (; z > 11; z--) {
    const dx = Math.abs(worldX(Math.max(...lons), z) - worldX(Math.min(...lons), z))
    const dy = Math.abs(worldY(Math.min(...lats), z) - worldY(Math.max(...lats), z))
    if (dx <= w - pad * 2 && dy <= height - pad * 2) break
  }
  const cx = (worldX(Math.min(...lons), z) + worldX(Math.max(...lons), z)) / 2
  const cy = (worldY(Math.min(...lats), z) + worldY(Math.max(...lats), z)) / 2
  const originX = cx - w / 2
  const originY = cy - height / 2
  const px = (c: Pt) => [worldX(c[0], z) - originX, worldY(c[1], z) - originY] as const

  const tiles = []
  for (let tx = Math.floor(originX / TILE); tx <= Math.floor((originX + w) / TILE); tx++) {
    for (let ty = Math.floor(originY / TILE); ty <= Math.floor((originY + height) / TILE); ty++) {
      tiles.push({ tx, ty, left: tx * TILE - originX, top: ty * TILE - originY })
    }
  }

  const a = px(point)
  const b = px(near.c)
  return (
    <div className="app-tilemap" ref={ref} style={{ height }}>
      {tiles.map((t) => (
        <img
          key={`${t.tx}-${t.ty}`}
          src={SRC(z, t.tx, t.ty)}
          alt=""
          loading="lazy"
          style={{ left: t.left, top: t.top }}
        />
      ))}
      <svg viewBox={`0 0 ${w} ${height}`} aria-hidden="true">
        {rings.map((ring, i) => (
          <polygon
            key={i}
            className="app-tilemap__park"
            points={ring.map((c) => px([c[0], c[1]]).map((n) => n.toFixed(1)).join(',')).join(' ')}
          />
        ))}
        {route?.line?.length ? (
          <polyline
            className="app-tilemap__route"
            points={route.line.map((c) => px(c as Pt).map((n) => n.toFixed(1)).join(',')).join(' ')}
          />
        ) : (
          <line className="app-tilemap__walk" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />
        )}
        <circle className="app-tilemap__spot" cx={a[0]} cy={a[1]} r={7} />
      </svg>
      <span className="app-tilemap__label">
        {route
          ? `${formatDistance(route.m)} ścieżkami, około ${route.min} min`
          : `${formatDistance(near.d)} do granicy, w linii prostej`}
      </span>
    </div>
  )
}
