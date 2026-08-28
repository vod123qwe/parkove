// Park Miejski w Miechowie, 30 km na polnoc od Krakowa.
//
// Zakres: SAM PARK plus przylegajacy Ogrod Zen (decyzja Jarka: „skup sie
// glownie na parku, nie na calym miescie"). Pierwsza wersja obejmowala tez
// bazylike i rynek, czyli 57 ha polowy miasta; historia klasztoru zostaje,
// ale jako to, DOKAD prowadza tunele, a nie jako osobne punkty w miescie.
//
//   node scripts/add-miechow.mjs [--dry]
//
// Geometria: obrys Parku Miejskiego z OSM plus punkty starego miasta,
// domkniete otoczka wypukla z buforem. Skrypt jest idempotentny.

import { readFileSync, writeFileSync } from 'node:fs'

const ID = 'miechow'
const PAD = 40 // m bufora, zeby granica nie ciela chodnikow wokol parku

/* nic poza obrysem: park i Ogrod Zen wystarcza */
const ALSO = []

const query = `[out:json][timeout:120];
(
  way["leisure"="park"]["name"="Park Miejski"](50.352,20.030,50.362,20.045);
  way["leisure"="park"]["name"~"Ogr.d Zen"](50.352,20.030,50.362,20.045);
);
out geom tags;`

const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'application/json',
    'User-Agent': 'Parkove/0.4 (personal Krakow parks project)',
  },
  body: 'data=' + encodeURIComponent(query),
  signal: AbortSignal.timeout(150000),
})
if (!res.ok) {
  console.log(`Overpass nie odpowiada (HTTP ${res.status})`)
  process.exit(1)
}
const data = await res.json()

const pts = [...ALSO]
for (const el of data.elements) {
  console.log(`  z OSM: ${el.tags?.name ?? el.tags?.amenity ?? '(bez nazwy)'} (${el.geometry?.length ?? 0} pkt)`)
  for (const p of el.geometry ?? []) pts.push([p.lon, p.lat])
}
if (pts.length < 10) {
  console.log('za malo punktow, cos poszlo nie tak')
  process.exit(1)
}

const toRad = (d) => (d * Math.PI) / 180
const latM = 111320

function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1])
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
  const half = (list) => {
    const out = []
    for (const q of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop()
      out.push(q)
    }
    out.pop()
    return out
  }
  return [...half(p), ...half([...p].reverse())]
}

const ring = hull(pts)
const mid = [
  ring.reduce((s, c) => s + c[0], 0) / ring.length,
  ring.reduce((s, c) => s + c[1], 0) / ring.length,
]
const lonM = 111320 * Math.cos(toRad(mid[1]))
const padded = ring.map(([x, y]) => {
  const dx = (x - mid[0]) * lonM
  const dy = (y - mid[1]) * latM
  const len = Math.hypot(dx, dy) || 1
  return [
    Number((x + ((dx / len) * PAD) / lonM).toFixed(6)),
    Number((y + ((dy / len) * PAD) / latM).toFixed(6)),
  ]
})
padded.push(padded[0])

const areaHa = (() => {
  let a = 0
  for (let i = 0; i < padded.length - 1; i++) {
    a += padded[i][0] * lonM * (padded[i + 1][1] * latM) - padded[i + 1][0] * lonM * (padded[i][1] * latM)
  }
  return Math.abs(a / 2) / 10000
})()

const path = 'src/app/data/parks.json'
const parks = JSON.parse(readFileSync(path, 'utf8'))
const before = parks.features.length
parks.features = parks.features.filter((f) => f.id !== ID)
parks.features.push({
  type: 'Feature',
  id: ID,
  properties: {
    id: ID,
    name: 'Park Miejski w Miechowie',
    kind: 'park',
    areaHa: Number(areaHa.toFixed(1)),
    center: [Number(mid[0].toFixed(6)), Number(mid[1].toFixed(6))],
  },
  geometry: { type: 'Polygon', coordinates: [padded] },
})
console.log(`wierzcholkow: ${padded.length - 1} | ${areaHa.toFixed(1)} ha | srodek ${mid.map((n) => n.toFixed(5)).join(', ')}`)
if (process.argv.includes('--dry')) process.exit(0)
writeFileSync(path, JSON.stringify(parks, null, 2) + String.fromCharCode(10))
console.log(`zapisane: ${parks.features.length} miejsc (bylo ${before})`)
