// Fetches the curated Parkove park list from OpenStreetMap (Overpass API)
// and writes src/app/data/parks.json as GeoJSON (simplified boundaries).
// Run: node scripts/fetch-parks.mjs
// Curation lives in WANTED below; unmatched entries are reported, not invented.

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// id, display name, kind, OSM name regex (case-insensitive)
const WANTED = [
  ['park-jordana', 'Park Jordana', 'park', 'Henryka Jordana|Park Jordana'],
  ['blonia', 'Błonia', 'meadow', '^Błonia( krakowskie)?$'],
  ['planty', 'Planty', 'park', '^Planty$'],
  ['las-wolski', 'Las Wolski', 'forest', 'Las Wolski'],
  ['zakrzowek', 'Park Zakrzówek', 'nature', 'Zakrzówek'],
  ['bednarskiego', 'Park Bednarskiego', 'park', 'Bednarskiego'],
  ['krakowski', 'Park Krakowski', 'park', '^Park Krakowski'],
  ['lotnikow', 'Park Lotników Polskich', 'park', 'Park (im\\. )?Lotników( Polskich)?'],
  ['jerzmanowskich', 'Park Jerzmanowskich', 'park', 'Jerzmanowskich'],
  ['decjusza', 'Park Decjusza', 'park', 'Decjusza'],
  ['skalki-twardowskiego', 'Skałki Twardowskiego', 'nature', 'Twardowskiego'],
  ['kopiec-kosciuszki', 'Kopiec Kościuszki', 'mound', 'Kopiec Kościuszki'],
  ['kopiec-krakusa', 'Kopiec Krakusa', 'mound', 'Kopiec Krak(us)?a'],
  ['kopiec-wandy', 'Kopiec Wandy', 'mound', 'Kopiec Wandy'],
  ['kopiec-pilsudskiego', 'Kopiec Piłsudskiego', 'mound', 'Kopiec (Józefa )?Piłsudskiego|Kopiec Niepodległości'],
  ['szymborskiej', 'Park Wisławy Szymborskiej', 'park', 'Szymborskiej'],
  ['reduta', 'Park Reduta', 'park', '^Park Reduta$'],
  ['zaczarowanej-dorozki', 'Park Zaczarowanej Dorożki', 'park', 'Zaczarowanej Dorożki'],
  ['dabie', 'Park Dąbie', 'park', '^Park Dąbie$'],
  ['ratuszowy', 'Park Ratuszowy', 'park', '^Park Ratuszowy$'],
  ['szwedzki', 'Park Szwedzki', 'park', '^Park Szwedzki$'],
  ['wyspianskiego', 'Park Wyspiańskiego', 'park', 'Wyspiańskiego'],
  ['mlynowka', 'Młynówka Królewska', 'park', 'Młynówka Królewska'],
  ['krowoderski', 'Park Krowoderski', 'park', '^Park Krowoderski$'],
  ['tysiaclecia', 'Park Tysiąclecia', 'park', '^Park Tysiąclecia$'],
  ['solvay', 'Park Solvay', 'park', '^Park Solvay'],
  ['macka-i-doroty', 'Park Maćka i Doroty', 'park', 'Maćka i Doroty'],
  ['lilli-wenedy', 'Park Lilli Wenedy', 'park', 'Lilli Wenedy'],
  ['duchacki', 'Park Duchacki', 'park', '^Park Duchacki$'],
  ['kurdwanow', 'Park Kurdwanów', 'park', '^Park Kurdwanów$'],
  ['rzaka', 'Park Rżąka', 'park', 'Rżąka'],
  ['aleksandry', 'Park Aleksandry', 'park', '^Park Aleksandry$'],
  ['bagry', 'Zalew Bagry', 'water', 'Bagry'],
  ['laki-nowohuckie', 'Łąki Nowohuckie', 'nature', 'Łąki Nowohuckie'],
  ['grzegorzecki', 'Park Grzegórzecki', 'park', '^Park Grzegórzecki$'],
  ['stacja-wisla', 'Park Stacja Wisła', 'park', 'Stacja Wisła'],
  ['planty-bienczyckie', 'Planty Bieńczyckie', 'park', 'Planty Bieńczyckie'],
  ['zielony-jar', 'Park Zielony Jar', 'park', 'Zielony Jar'],
  ['wisniowy-sad', 'Park Wiśniowy Sad', 'park', 'Wiśniowy Sad'],
  ['strzelecki', 'Park Strzelecki', 'park', '^Park Strzelecki$'],
  ['zeromskiego', 'Park Żeromskiego', 'park', 'Żeromskiego'],
  ['ogrod-botaniczny', 'Ogród Botaniczny UJ', 'garden', '^Ogród Botaniczny'],
  ['jalu-kurka', 'Park Jalu Kurka', 'park', 'Jalu Kurka'],
  ['przylasek-rusiecki', 'Przylasek Rusiecki', 'water', 'Przylasek Rusiecki'],
  ['lasek-mogilski', 'Lasek Mogilski', 'forest', 'Lasek Mogilski'],
  ['panienskie-skaly', 'Panieńskie Skały', 'nature', 'Panieńskie Skały'],
  ['witkowice', 'Park Leśny Witkowice', 'forest', 'Park Leśny Witkowice'],
  ['wadow', 'Park Wadów', 'park', '^Park Wadów'],
  // beyond the city limits, added on request
  ['skawina-pilsudskiego', 'Park Miejski w Skawinie', 'park', 'Park Miejski im\\. Józefa Piłsudskiego'],
  ['skawina-blonia', 'Błonia Skawińskie', 'meadow', 'Błonia Skawińskie'],
]

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const bigRegex = WANTED.map(([, , , rx]) => `(${rx})`).join('|')
const query = `
[out:json][timeout:120];
(
  area["name"="Kraków"]["boundary"="administrative"]["admin_level"="6"];
  area["name"="Skawina"]["boundary"="administrative"];
)->.a;
nwr["name"~"${bigRegex}",i](area.a);
out body geom;
`

// Tags that make an element a plausible green area (filters out streets, stops, shops).
const AREA_TAGS = ['leisure', 'landuse', 'natural', 'man_made', 'historic', 'boundary', 'tourism']
const KIND_FIT = {
  park: (t) => t.leisure === 'park' || t.leisure === 'garden',
  garden: (t) => t.leisure === 'garden' || t.leisure === 'park',
  meadow: (t) => t.landuse === 'meadow' || t.natural === 'grassland' || t.leisure === 'park',
  forest: (t) => t.landuse === 'forest' || t.natural === 'wood' || t.leisure === 'park',
  mound: (t) => t.man_made === 'mound' || !!t.historic || t.tourism === 'attraction' || t.leisure === 'park',
  nature: (t) => t.leisure === 'park' || t.leisure === 'nature_reserve' || !!t.natural || t.boundary === 'protected_area',
  water: (t) => t.natural === 'water' || t.leisure === 'park',
}

const dist2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2

function simplify(points, tol) {
  // Douglas-Peucker on [lng,lat]
  if (points.length <= 4) return points
  const sqTol = tol * tol
  const sqSegDist = (p, a, b) => {
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
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()
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

function ringArea(ring) {
  // planar shoelace scaled to meters (good enough at Kraków latitude)
  const mLat = 111132
  const mLng = 111320 * Math.cos((50.06 * Math.PI) / 180)
  let s = 0
  for (let i = 0; i < ring.length - 1; i++) {
    s += ring[i][0] * mLng * ring[i + 1][1] * mLat - ring[i + 1][0] * mLng * ring[i][1] * mLat
  }
  return Math.abs(s / 2)
}

function centroidOf(ring) {
  let x = 0
  let y = 0
  for (const p of ring) {
    x += p[0]
    y += p[1]
  }
  return [+(x / ring.length).toFixed(6), +(y / ring.length).toFixed(6)]
}

function wayToRing(geometry) {
  return geometry.map((g) => [g.lon, g.lat])
}

function circleRing(lng, lat, radiusM) {
  const mLat = 111132
  const mLng = 111320 * Math.cos((lat * Math.PI) / 180)
  const ring = []
  for (let i = 0; i <= 32; i++) {
    const a = (i / 32) * 2 * Math.PI
    ring.push([lng + (Math.cos(a) * radiusM) / mLng, lat + (Math.sin(a) * radiusM) / mLat])
  }
  return ring
}

function assembleRings(members) {
  // join outer member ways end-to-end into closed rings
  const segs = members
    .filter((m) => m.type === 'way' && (m.role === 'outer' || m.role === '') && m.geometry)
    .map((m) => wayToRing(m.geometry))
  const rings = []
  const EPS = 1e-9
  while (segs.length) {
    let ring = segs.shift()
    let extended = true
    while (extended && dist2(ring[0], ring[ring.length - 1]) > EPS) {
      extended = false
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i]
        const end = ring[ring.length - 1]
        if (dist2(end, s[0]) < EPS) ring = ring.concat(s.slice(1))
        else if (dist2(end, s[s.length - 1]) < EPS) ring = ring.concat(s.slice(0, -1).reverse())
        else continue
        segs.splice(i, 1)
        extended = true
        break
      }
    }
    if (dist2(ring[0], ring[ring.length - 1]) > EPS) ring.push(ring[0])
    if (ring.length >= 4) rings.push(ring)
  }
  return rings
}

async function fetchOverpass() {
  let lastErr
  for (const url of ENDPOINTS) {
    try {
      console.log('querying', url)
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'Parkove/0.2 (personal Krakow parks project)',
        },
        body: 'data=' + encodeURIComponent(query),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      lastErr = e
      console.warn('endpoint failed:', e.message)
    }
  }
  throw lastErr
}

const data = await fetchOverpass()
console.log('elements:', data.elements.length)

const candidates = new Map() // wantedId -> [{rings, tags}]
for (const el of data.elements) {
  const name = el.tags?.name
  if (!name) continue
  if (!AREA_TAGS.some((t) => el.tags[t])) continue
  const wanted = WANTED.find(([, , , rx]) => new RegExp(rx, 'i').test(name))
  if (!wanted) continue
  let rings = []
  if (el.type === 'way' && el.geometry) {
    const ring = wayToRing(el.geometry)
    if (dist2(ring[0], ring[ring.length - 1]) > 1e-9) continue // open way, not an area
    rings = [ring]
  } else if (el.type === 'relation' && el.members) {
    rings = assembleRings(el.members)
  } else if (el.type === 'node' && wanted[2] === 'mound') {
    // mounds are often mapped as a summit node only: approximate with a circle
    rings = [circleRing(el.lon, el.lat, 80)]
  }
  if (!rings.length) continue
  const list = candidates.get(wanted[0]) ?? []
  list.push({ rings, tags: el.tags })
  candidates.set(wanted[0], list)
}

const features = []
const missing = []
for (const [id, name, kind] of WANTED) {
  const list = candidates.get(id)
  if (!list) {
    missing.push(`${id} (${name})`)
    continue
  }
  const fit = KIND_FIT[kind]
  const scored = list
    .map((c) => ({
      ...c,
      fit: fit(c.tags) ? 1 : 0,
      area: c.rings.reduce((s, r) => s + ringArea(r), 0),
    }))
    .sort((a, b) => b.fit - a.fit || b.area - a.area)
  const best = scored[0]
  const rings = best.rings
    .map((r) => simplify(r, 0.00008))
    .filter((r) => r.length >= 4)
    .map((r) => r.map(([x, y]) => [+x.toFixed(6), +y.toFixed(6)]))
    .sort((a, b) => ringArea(b) - ringArea(a))
  if (!rings.length) {
    missing.push(
      `${id} (${name}, degenerate geometry from tags: ${JSON.stringify(best.tags).slice(0, 120)})`,
    )
    continue
  }
  const areaHa = +(rings.reduce((s, r) => s + ringArea(r), 0) / 10000).toFixed(1)
  features.push({
    type: 'Feature',
    id,
    properties: { id, name, kind, areaHa, center: centroidOf(rings[0]) },
    geometry:
      rings.length === 1
        ? { type: 'Polygon', coordinates: rings }
        : { type: 'MultiPolygon', coordinates: rings.map((r) => [r]) },
  })
}

features.sort((a, b) => a.properties.name.localeCompare(b.properties.name, 'pl'))

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../src/app/data/parks.json')
mkdirSync(dirname(out), { recursive: true })
const fc = { type: 'FeatureCollection', generated: new Date().toISOString().slice(0, 10), features }
writeFileSync(out, JSON.stringify(fc))
console.log(`matched ${features.length}/${WANTED.length}, wrote ${(JSON.stringify(fc).length / 1024).toFixed(0)} KB`)
if (missing.length) console.log('missing:\n  ' + missing.join('\n  '))
