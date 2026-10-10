// Place zabaw PER MIEJSCE, z rozmiarem.
//
// Po co (Jarek, 2026-10-10): „gdybyśmy do filtrów dodali parki z placami
// zabaw, z DUŻYMI placami, żeby z perspektywy dzieci można było filtrować".
// nearby.json ma 1700 placów jako punkty, ale nie mówi, który jest w którym
// parku ani jak jest duży. Ten skrypt odpowiada na oba pytania.
//
// Rozmiar: OSM ma większość placów w Krakowie jako poligony (skan 2026-10-10:
// 1153 z geometrią), więc powierzchnię liczymy z obrysu. Plac zmapowany jako
// punkt dostaje `a: null`, czyli „jest, rozmiaru nie znamy", a nie zero.
//
// Przypisanie do miejsca: środek placu w obrysie miejsca albo nie dalej niż
// NEAR_M od jego krawędzi. Bufor jest po to, że plac bywa tuż za płotem parku
// i dla rodzica to wciąż „plac w parku".
//
// Progi: BIG_M2 = 1500 to w Krakowie około setki placów, czyli realny wybór.
// HUGE_M2 = 3000 to niecałe trzydzieści, te największe.
//
// Uruchomienie: npm run playgrounds
// Wynik: src/app/data/playgrounds.json

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PARKS = resolve(root, 'src/app/data/parks.json')
const OUT = resolve(root, 'src/app/data/playgrounds.json')

const NEAR_M = 120
const BIG_M2 = 1500
const HUGE_M2 = 3000

const HOSTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function ask(query) {
  for (const host of HOSTS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      await sleep(attempt * 1800)
      try {
        const res = await fetch(host, {
          method: 'POST',
          headers: {
            'User-Agent': 'Parkove/0.4 (personal Krakow parks project)',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'data=' + encodeURIComponent(query),
        })
        const text = await res.text()
        if (!res.ok || text.trim().startsWith('<')) continue
        return JSON.parse(text)
      } catch {
        /* następny serwer */
      }
    }
  }
  console.warn('  ! żaden serwer Overpass nie odpowiedział')
  return null
}

/* ---- geometria w metrach, wystarczająca na skalę parku ---- */

const toM = (lat0) => {
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180)
  const ky = 111320
  return (p) => [p[0] * kx, p[1] * ky]
}

function ringArea(ring, m) {
  let a = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = m(ring[i])
    const [x2, y2] = m(ring[i + 1])
    a += x1 * y2 - x2 * y1
  }
  return Math.abs(a / 2)
}

function centroid(ring) {
  let x = 0
  let y = 0
  const n = ring.length - 1 || ring.length
  for (let i = 0; i < n; i++) {
    x += ring[i][0]
    y += ring[i][1]
  }
  return [x / n, y / n]
}

function inside(pt, ring) {
  let c = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c
  }
  return c
}

/** odległość punktu od najbliższej krawędzi obrysu, w metrach */
function distToRing(pt, ring, m) {
  const [px, py] = m(pt)
  let best = Infinity
  for (let i = 0; i < ring.length - 1; i++) {
    const [ax, ay] = m(ring[i])
    const [bx, by] = m(ring[i + 1])
    const dx = bx - ax
    const dy = by - ay
    const len2 = dx * dx + dy * dy || 1
    let t = ((px - ax) * dx + (py - ay) * dy) / len2
    t = Math.max(0, Math.min(1, t))
    const ex = ax + t * dx - px
    const ey = ay + t * dy - py
    best = Math.min(best, Math.sqrt(ex * ex + ey * ey))
  }
  return best
}

/* ---- dane ---- */

const parks = JSON.parse(readFileSync(PARKS, 'utf8')).features.filter(
  (f) => !f.properties?.trip && !f.id.startsWith('test-'),
)

/**
 * Zewnętrzne pierścienie miejsca. Cztery miejsca (Błonia, Młynówka, Lotników,
 * Planty Bieńczyckie) są MultiPolygon, czyli kilkoma kawałkami, i każdy kawałek
 * liczy się osobno: plac przy jednym z nich jest placem w parku.
 */
const ringsOf = (f) =>
  f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates.map((p) => p[0]) : [f.geometry.coordinates[0]]

/* bbox ze wszystkich miejsc plus zapas, żeby Miechów i Kamionna też weszły */
let s = 90
let w = 180
let n = -90
let e = -180
for (const f of parks) {
  for (const ring of ringsOf(f)) {
    for (const [lon, lat] of ring) {
      s = Math.min(s, lat)
      n = Math.max(n, lat)
      w = Math.min(w, lon)
      e = Math.max(e, lon)
    }
  }
}
const BBOX = `${(s - 0.01).toFixed(3)},${(w - 0.01).toFixed(3)},${(n + 0.01).toFixed(3)},${(e + 0.01).toFixed(3)}`
console.log(`bbox: ${BBOX}`)

const data = await ask(`[out:json][timeout:240];nwr[leisure=playground](${BBOX});out geom;`)
if (!data) process.exit(1)

/* każdy plac: środek, powierzchnia (null gdy punkt), nazwa */
const spots = []
for (const el of data.elements ?? []) {
  const t = el.tags ?? {}
  let ring = null
  if (el.type === 'way' && el.geometry?.length > 3) ring = el.geometry.map((p) => [p.lon, p.lat])
  if (el.type === 'relation') {
    /* bierzemy największy zewnętrzny pierścień; place jako relacje to rzadkość */
    let best = null
    for (const mb of el.members ?? []) {
      if (mb.role === 'inner' || !mb.geometry) continue
      if (!best || mb.geometry.length > best.length) best = mb.geometry
    }
    if (best?.length > 3) ring = best.map((p) => [p.lon, p.lat])
  }
  let c
  let a = null
  if (ring) {
    if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ring.push(ring[0])
    c = centroid(ring)
    a = Math.round(ringArea(ring, toM(c[1])))
  } else if (el.lat != null) {
    c = [el.lon, el.lat]
  } else if (el.center) {
    c = [el.center.lon, el.center.lat]
  } else continue
  const spot = { c: [+c[0].toFixed(5), +c[1].toFixed(5)], a }
  const name = t.name ?? t['name:pl']
  if (name && name.length < 48 && !/^plac zabaw$/i.test(name)) spot.n = name
  spots.push(spot)
}
console.log(`placów w bbox: ${spots.length}, z powierzchnią: ${spots.filter((x) => x.a != null).length}`)

/* przypisanie do miejsc */
const out = {}
let assigned = 0
for (const f of parks) {
  const rings = ringsOf(f)
  const m = toM(rings[0][0][1])
  /* szybki odrzut po bbox miejsca, żeby nie liczyć odległości do 2000 placów */
  const all = rings.flat()
  const lats = all.map((p) => p[1])
  const lons = all.map((p) => p[0])
  const pad = (NEAR_M + 50) / 111320
  const bs = Math.min(...lats) - pad
  const bn = Math.max(...lats) + pad
  const bw = Math.min(...lons) - pad * 1.6
  const be = Math.max(...lons) + pad * 1.6
  const items = []
  for (const sp of spots) {
    const [lon, lat] = sp.c
    if (lat < bs || lat > bn || lon < bw || lon > be) continue
    let d = Infinity
    for (const ring of rings) {
      if (inside(sp.c, ring)) {
        d = 0
        break
      }
      d = Math.min(d, distToRing(sp.c, ring, m))
    }
    d = Math.round(d)
    if (d > NEAR_M) continue
    items.push({ ...sp, d })
  }
  if (!items.length) continue
  items.sort((x, y) => (y.a ?? -1) - (x.a ?? -1))
  const sized = items.filter((x) => x.a != null)
  const max = sized.length ? sized[0].a : null
  out[f.id] = {
    n: items.length,
    /* null = są place, ale żaden nie ma obrysu w OSM, więc rozmiaru nie znamy */
    max,
    sum: sized.reduce((acc, x) => acc + x.a, 0),
    big: sized.filter((x) => x.a >= BIG_M2).length,
    huge: sized.filter((x) => x.a >= HUGE_M2).length,
    items,
  }
  assigned += items.length
}

const result = {
  generated: new Date().toISOString().slice(0, 10),
  source: 'scripts/build-playgrounds.mjs',
  nearM: NEAR_M,
  bigM2: BIG_M2,
  hugeM2: HUGE_M2,
  parks: out,
}
writeFileSync(OUT, JSON.stringify(result))

const rows = Object.entries(out).sort((a, b) => (b[1].max ?? 0) - (a[1].max ?? 0))
console.log(`\nmiejsc z placem: ${rows.length} z ${parks.length}, placów przypisanych: ${assigned}`)
console.log(`z dużym placem (>= ${BIG_M2} m2): ${rows.filter(([, v]) => v.big).length}`)
console.log('\nnajwiększe place per miejsce:')
for (const [id, v] of rows.slice(0, 20)) {
  console.log(`  ${id.padEnd(24)} n=${String(v.n).padStart(2)}  max ${String(v.max ?? '?').padStart(5)} m2  suma ${String(v.sum).padStart(6)} m2  ${v.huge ? 'OGROMNY' : v.big ? 'duży' : ''}`)
}
console.log(`\nzapisane: ${OUT}`)
