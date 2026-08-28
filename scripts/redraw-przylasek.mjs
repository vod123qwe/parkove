// Przerysowuje obrys Przylasku Rusieckiego z obiektow OSM.
//
// Bylo: 18 ha, czyli praktycznie sam zbiornik nr 1. Jarek zglosil, ze to blad,
// bo caly sens tego miejsca to zespol pozwirowych jeziorek, plaze i to, co
// mozna obejsc dookola. Teraz obrys bierze glowna grupe zbiornikow wokol
// kapieliska razem z plazami, pomostami i parkingami, a domyka go otoczka
// wypukla z buforem.
//
// Zbiorniki 5, 7 i 9 zostaja POZA: leza 850 do 1030 m na zachod i rozciagaly
// obszar do 1,85 km, czyli poza to, co da sie potraktowac jako jedno wejscie.
//
//   node scripts/redraw-przylasek.mjs [--dry]

import { readFileSync, writeFileSync } from 'node:fs'

const PARK = 'przylasek-rusiecki'
const CENTER = [20.1591, 50.0492]
const REACH = 900 // m: dokad siega "jedno miejsce"
const PAD = 70 // m bufora wokol otoczki, zeby brzeg nie ciac sciezek

const query = `[out:json][timeout:120];
(
  way(around:${REACH},${CENTER[1]},${CENTER[0]})["natural"="water"];
  relation(around:${REACH},${CENTER[1]},${CENTER[0]})["natural"="water"];
  way(around:${REACH},${CENTER[1]},${CENTER[0]})["natural"="beach"];
  way(around:${REACH},${CENTER[1]},${CENTER[0]})["leisure"~"swimming_area|playground"];
  node(around:${REACH},${CENTER[1]},${CENTER[0]})["leisure"~"swimming_area|playground"];
  way(around:${REACH},${CENTER[1]},${CENTER[0]})["man_made"="pier"];
  node(around:${REACH},${CENTER[1]},${CENTER[0]})["man_made"="pier"];
  way(around:${REACH},${CENTER[1]},${CENTER[0]})["amenity"="parking"];
);
out geom;`

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
  console.log(`Overpass nie odpowiada (HTTP ${res.status}), obrys zostaje jaki byl`)
  process.exit(1)
}
const data = await res.json()

const toRad = (d) => (d * Math.PI) / 180
const metersBetween = (a, b) => {
  const dLat = toRad(b[1] - a[1])
  const dLon = toRad(b[0] - a[0])
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2
  return 6371000 * 2 * Math.asin(Math.sqrt(s))
}

/* zbieramy punkty, ale tylko te w zasiegu: pojedynczy daleki zbiornik
   rozciagal caly obrys i robil z miejsca pas dlugosci dwoch kilometrow */
const pts = []
for (const el of data.elements) {
  const geoms = el.geometry ? [el.geometry] : el.members?.map((m) => m.geometry).filter(Boolean) ?? []
  if (!geoms.length && el.lat != null) geoms.push([{ lat: el.lat, lon: el.lon }])
  for (const g of geoms)
    for (const p of g) {
      const c = [p.lon, p.lat]
      if (metersBetween(CENTER, c) <= REACH) pts.push(c)
    }
}
console.log(`punktow w zasiegu ${REACH} m: ${pts.length}`)

/** otoczka wypukla (monotone chain) */
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
/* bufor: kazdy wierzcholek odsuwamy od srodka o PAD metrow */
const latM = 111320
const lonM = 111320 * Math.cos(toRad(CENTER[1]))
const mid = [
  ring.reduce((s, c) => s + c[0], 0) / ring.length,
  ring.reduce((s, c) => s + c[1], 0) / ring.length,
]
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

/** pole wielokata w hektarach */
const areaHa = (() => {
  let a = 0
  for (let i = 0; i < padded.length - 1; i++) {
    const [x1, y1] = padded[i]
    const [x2, y2] = padded[i + 1]
    a += (x1 * lonM) * (y2 * latM) - (x2 * lonM) * (y1 * latM)
  }
  return Math.abs(a / 2) / 10000
})()

const path = 'src/app/data/parks.json'
const parks = JSON.parse(readFileSync(path, 'utf8'))
const feature = parks.features.find((f) => f.id === PARK)
if (!feature) {
  console.log(`nie ma miejsca ${PARK} w parks.json`)
  process.exit(1)
}
const wasHa = feature.properties.areaHa
console.log(`wierzcholkow: ${padded.length - 1} | ${wasHa} ha -> ${areaHa.toFixed(1)} ha`)

if (process.argv.includes('--dry')) process.exit(0)
feature.geometry = { type: 'Polygon', coordinates: [padded] }
feature.properties.areaHa = Number(areaHa.toFixed(1))
feature.properties.center = [
  Number(mid[0].toFixed(6)),
  Number(mid[1].toFixed(6)),
]
writeFileSync(path, JSON.stringify(parks, null, 2) + String.fromCharCode(10))
console.log('obrys zapisany')
