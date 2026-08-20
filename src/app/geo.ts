export type Pt = [number, number] // [lng, lat]
export type ParkGeometry =
  | { type: 'Polygon'; coordinates: Pt[][] }
  | { type: 'MultiPolygon'; coordinates: Pt[][][] }

function pointInRing(pt: Pt, ring: Pt[]) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersects = yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi
    if (intersects) inside = !inside
  }
  return inside
}

/** outer rings only: holes inside a park still count as being in the park */
export function pointInPark(pt: Pt, geometry: ParkGeometry) {
  if (geometry.type === 'Polygon') return pointInRing(pt, geometry.coordinates[0])
  return geometry.coordinates.some((poly) => pointInRing(pt, poly[0]))
}

export function distanceM(a: Pt, b: Pt) {
  const R = 6371000
  const dLat = ((b[1] - a[1]) * Math.PI) / 180
  const dLng = ((b[0] - a[0]) * Math.PI) / 180
  const la = (a[1] * Math.PI) / 180
  const lb = (b[1] * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** approximate distance to the park boundary: nearest polygon vertex */
export function distanceToParkM(pt: Pt, geometry: ParkGeometry) {
  if (pointInPark(pt, geometry)) return 0
  const rings = geometry.type === 'Polygon' ? [geometry.coordinates[0]] : geometry.coordinates.map((p) => p[0])
  let min = Infinity
  for (const ring of rings) for (const v of ring) min = Math.min(min, distanceM(pt, v))
  return min
}

export function formatDistance(m: number) {
  if (m < 950) return `${Math.round(m / 10) * 10} m`
  return `${(m / 1000).toFixed(1).replace('.', ',')} km`
}

/** initial bearing a -> b in degrees, 0 = north, clockwise */
export function bearingDeg(a: Pt, b: Pt) {
  const la = (a[1] * Math.PI) / 180
  const lb = (b[1] * Math.PI) / 180
  const dLng = ((b[0] - a[0]) * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(lb)
  const x = Math.cos(la) * Math.sin(lb) - Math.sin(la) * Math.cos(lb) * Math.cos(dLng)
  return (Math.atan2(y, x) * 180) / Math.PI
}

/** Douglas-Peucker line simplification for stored tracks */
export function simplifyTrack(points: Pt[], tol = 0.00005): Pt[] {
  if (points.length <= 4) return points
  const sqTol = tol * tol
  const sqSegDist = (p: Pt, a: Pt, b: Pt) => {
    let x = a[0]
    let y = a[1]
    let dx = b[0] - x
    let dy = b[1] - y
    if (dx !== 0 || dy !== 0) {
      const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy)
      if (t > 1) {
        x = b[0]
        y = b[1]
      } else if (t > 0) {
        x += dx * t
        y += dy * t
      }
    }
    dx = p[0] - x
    dy = p[1] - y
    return dx * dx + dy * dy
  }
  const keep = new Array(points.length).fill(false)
  keep[0] = keep[points.length - 1] = true
  const stack: Array<[number, number]> = [[0, points.length - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()!
    let maxD = 0
    let idx = -1
    for (let i = first + 1; i < last; i++) {
      const d = sqSegDist(points[i], points[first], points[last])
      if (d > maxD) {
        maxD = d
        idx = i
      }
    }
    if (maxD > sqTol && idx > 0) {
      keep[idx] = true
      stack.push([first, idx], [idx, last])
    }
  }
  return points.filter((_, i) => keep[i])
}
