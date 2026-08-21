// Audyt współrzędnych punktów: porównuje każdy POI z tym, co OpenStreetMap ma
// w tym parku, i wypisuje te, które stoją daleko od pasującego obiektu.
//
// Powód: część współrzędnych wpisano bez weryfikacji. W terenie znaczy to, że
// apka prowadzi w złe miejsce (Skawina: pomnik 165 m, dąb 205 m; Zakrzówek:
// kąpielisko 760 m).
//
// Uruchomienie: node scripts/audit-poi-coords.mjs [--only=park-id]
// Wynik: raport na stdout + cache odpowiedzi OSM w .tmp/osm-cache.json

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CACHE = resolve(root, '.tmp/osm-cache.json')
mkdirSync(dirname(CACHE), { recursive: true })
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}

const parks = JSON.parse(readFileSync(resolve(root, 'src/app/data/parks.json'), 'utf8'))
const byId = new Map(parks.features.map((f) => [f.id, f]))

/** wyciągnij punkty z modułów questów bez importowania TypeScriptu */
function readPois() {
  const out = []
  for (const file of ['src/app/data/quests.ts', 'src/app/data/quests-dolinki.ts']) {
    const s = readFileSync(resolve(root, file), 'utf8')
    const coords = [...s.matchAll(/coords:\s*\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]/g)]
    let prev = 0
    for (const m of coords) {
      const win = s.slice(prev, m.index)
      prev = m.index + m[0].length
      const parkId = [...s.slice(0, m.index).matchAll(/parkId:\s*'([^']+)'/g)].pop()?.[1]
      const id = [...win.matchAll(/\bid:\s*'([^']+)'/g)].pop()?.[1]
      const name = [...win.matchAll(/\bname:\s*['"]([^'"]*)['"]/g)].pop()?.[1]
      const category = [...win.matchAll(/\bcategory:\s*'([^']+)'/g)].pop()?.[1]
      if (parkId && id) out.push({ parkId, id, name: name ?? '?', category, lon: +m[1], lat: +m[2] })
    }
  }
  return out
}

/** słowo w nazwie punktu -> jakie obiekty OSM mogą nim być */
const CLASSES = [
  { words: ['pomnik', 'obelisk', 'popiersie', 'tablica', 'mogiła', 'grób', 'krzyż', 'kapliczka', 'figura'], match: (t) => t.historic === 'memorial' || t.historic === 'monument' || t.historic === 'wayside_cross' || t.historic === 'wayside_shrine' || t.historic === 'tomb' || t.memorial },
  { words: ['dąb', 'dab', 'drzewo', 'lipa', 'platan', 'buk', 'sosna', 'kasztanowiec', 'wiąz'], match: (t) => t.natural === 'tree' },
  { words: ['kąpielisko', 'kapielisko', 'basen', 'pomost', 'plaża', 'plaza', 'przystań'], match: (t) => ['swimming_area', 'water_park', 'beach_resort', 'marina'].includes(t.leisure) || t.man_made === 'pier' || t.amenity === 'public_bath' },
  { words: ['staw', 'zalew', 'jezioro', 'starorzecze', 'woda', 'sadzawka', 'zbiornik', 'fosa'], match: (t) => t.natural === 'water' || t.water },
  { words: ['fontanna', 'wodospad', 'źródło', 'zrodlo'], match: (t) => t.amenity === 'fountain' || t.waterway === 'waterfall' || t.natural === 'spring' },
  { words: ['kościół', 'kosciol', 'kaplica', 'cerkiew', 'sanktuarium', 'klasztor'], match: (t) => t.amenity === 'place_of_worship' || t.historic === 'church' || t.building === 'church' || t.building === 'chapel' },
  { words: ['pałac', 'palac', 'dworek', 'dwór', 'willa', 'spichlerz', 'kamienica', 'teatr', 'muzeum', 'sokół', 'sokol', 'zamek'], match: (t) => (t.building && t.name) || ['theatre', 'museum', 'community_centre', 'arts_centre'].includes(t.amenity) || t.historic === 'manor' || t.historic === 'castle' },
  { words: ['widok', 'widokowy', 'taras', 'panorama', 'punkt widokowy'], match: (t) => t.tourism === 'viewpoint' },
  { words: ['jaskinia', 'schronisko', 'szczelina', 'grota'], match: (t) => t.natural === 'cave_entrance' },
  { words: ['skała', 'skala', 'turnia', 'filar', 'mur', 'baszta', 'ostaniec', 'brama'], match: (t) => ['rock', 'bare_rock', 'cliff', 'arch'].includes(t.natural) || t.sport === 'climbing' },
  { words: ['plac zabaw', 'zabaw', 'huśtawki'], match: (t) => t.leisure === 'playground' },
  { words: ['kopiec', 'kurhan'], match: (t) => t.historic === 'tumulus' || t.natural === 'peak' || t.man_made === 'mound' },
]

const strip = (s) => s.toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => 'acelnoszz'['ąćęłńóśźż'.indexOf(c)])
const classesFor = (name) => {
  const n = strip(name)
  return CLASSES.filter((c) => c.words.some((w) => n.includes(strip(w))))
}

const R = 6371000
const metres = (a, b) => {
  const p1 = (a.lat * Math.PI) / 180
  const p2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin((p2 - p1) / 2) ** 2 +
    Math.cos(p1) * Math.cos(p2) * Math.sin(((b.lon - a.lon) * Math.PI) / 360) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const bboxOf = (feature, padDeg = 0.0015) => {
  const rings =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates[0]]
      : feature.geometry.coordinates.map((p) => p[0])
  let s = 90, w = 180, n = -90, e = -180
  for (const ring of rings)
    for (const [x, y] of ring) {
      s = Math.min(s, y); n = Math.max(n, y); w = Math.min(w, x); e = Math.max(e, x)
    }
  return `${s - padDeg},${w - padDeg},${n + padDeg},${e + padDeg}`
}

// kumi bywa nieosiagalny, a .de rzuca 504 i dziala przy nastepnej probie,
// wiec cierpliwosc jest tu wazniejsza niz liczba serwerow
const EPS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchPark(parkId, bbox) {
  if (cache[parkId]) return cache[parkId]
  const q = `[out:json][timeout:150];
(
  node["historic"](${bbox});
  way["historic"](${bbox});
  node["memorial"](${bbox});
  node["natural"~"^(tree|water|spring|cave_entrance|rock|bare_rock|peak|arch)$"](${bbox});
  way["natural"~"^(water|rock|bare_rock|arch|cliff)$"](${bbox});
  node["amenity"~"^(fountain|place_of_worship|theatre|museum|community_centre|arts_centre|public_bath)$"](${bbox});
  way["amenity"~"^(fountain|place_of_worship|theatre|museum|community_centre|arts_centre|public_bath)$"](${bbox});
  node["leisure"~"^(playground|swimming_area|water_park|beach_resort|marina)$"](${bbox});
  way["leisure"~"^(playground|swimming_area|water_park|beach_resort|marina)$"](${bbox});
  node["tourism"~"^(viewpoint|attraction|artwork)$"](${bbox});
  node["man_made"~"^(pier|mound|obelisk)$"](${bbox});
  way["man_made"~"^(pier|mound)$"](${bbox});
  way["building"]["name"](${bbox});
  node["waterway"="waterfall"](${bbox});
  node["sport"="climbing"](${bbox});
);
out tags center;`
  let last
  for (let attempt = 0; attempt < 8; attempt++) {
    for (const ep of EPS) {
      try {
        const res = await fetch(ep, { method: 'POST', body: new URLSearchParams({ data: q }) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        if (!text.startsWith('{')) throw new Error('nie JSON: ' + text.slice(0, 40))
        const json = JSON.parse(text)
        const rows = (json.elements ?? [])
          .map((e) => {
            const c = e.center ?? { lat: e.lat, lon: e.lon }
            return c?.lat ? { name: e.tags?.name ?? null, tags: e.tags ?? {}, lat: c.lat, lon: c.lon } : null
          })
          .filter(Boolean)
        cache[parkId] = rows
        writeFileSync(CACHE, JSON.stringify(cache))
        return rows
      } catch (e) {
        last = e
        await sleep(8000)
      }
    }
  }
  throw last
}

// tryb bez sieci: precyzja wspolrzednych. Wpisane z reki maja 3-4 miejsca po
// przecinku (~11 do 110 m siatka), wziete z OSM maja 5-6. To najtanszy sposob
// znalezienia punktow, ktorych nikt nie zweryfikowal.
if (process.argv.includes('--precision')) {
  const decimals = (n) => {
    const s = String(n).replace(/0+$/, '')
    return s.includes('.') ? s.split('.')[1].length : 0
  }
  const rows = readPois()
    .map((p) => ({ ...p, prec: Math.min(decimals(p.lat), decimals(p.lon)) }))
    .filter((p) => p.prec <= 4)
    .sort((a, b) => a.prec - b.prec || a.parkId.localeCompare(b.parkId))
  console.log(`punktow wpisanych z reki: ${rows.length} z ${readPois().length}
`)
  for (const r of rows) {
    console.log(
      `${r.prec} miejsc  ${r.parkId.padEnd(22)} ${r.id.padEnd(22)} ${(r.name ?? '').slice(0, 30).padEnd(30)} ${r.lat},${r.lon}`,
    )
  }
  process.exit(0)
}

const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7)
const pois = readPois().filter((p) => !only || p.parkId === only)
const parkIds = [...new Set(pois.map((p) => p.parkId))]

console.log(`punktow: ${pois.length}, parkow: ${parkIds.length}\n`)
const report = []
for (const parkId of parkIds) {
  const feature = byId.get(parkId)
  if (!feature) {
    console.log(`BRAK PARKU ${parkId}`)
    continue
  }
  const fresh = !cache[parkId]
  let rows
  try {
    rows = await fetchPark(parkId, bboxOf(feature))
  } catch (e) {
    console.log(`BLAD ${parkId}: ${e.message}`)
    continue
  }
  for (const poi of pois.filter((p) => p.parkId === parkId)) {
    const cls = classesFor(poi.name)
    if (!cls.length) {
      report.push({ ...poi, verdict: 'brak klasy', dist: null })
      continue
    }
    const cands = rows.filter((r) => cls.some((c) => c.match(r.tags)))
    if (!cands.length) {
      report.push({ ...poi, verdict: 'brak kandydata w OSM', dist: null })
      continue
    }
    let best = null
    for (const r of cands) {
      const d = metres(poi, r)
      if (!best || d < best.d) best = { d, r }
    }
    report.push({
      ...poi,
      verdict: best.d > 60 ? 'DALEKO' : 'ok',
      dist: Math.round(best.d),
      match: best.r.name ?? Object.entries(best.r.tags).slice(0, 2).map(([k, v]) => `${k}=${v}`).join(' '),
      matchLat: best.r.lat,
      matchLon: best.r.lon,
    })
  }
  if (fresh) await sleep(4000)
}

const far = report.filter((r) => r.verdict === 'DALEKO').sort((a, b) => b.dist - a.dist)
console.log(`=== DALEKO OD PASUJACEGO OBIEKTU (${far.length}) ===`)
for (const r of far) {
  console.log(
    `${String(r.dist).padStart(5)} m  ${r.parkId.padEnd(22)} ${r.id.padEnd(20)} ${(r.name ?? '').slice(0, 26).padEnd(26)} nasze ${r.lat},${r.lon} -> OSM ${r.matchLat},${r.matchLon} (${(r.match ?? '').slice(0, 30)})`,
  )
}
const noCand = report.filter((r) => r.verdict === 'brak kandydata w OSM')
const noClass = report.filter((r) => r.verdict === 'brak klasy')
console.log(`\nok: ${report.filter((r) => r.verdict === 'ok').length}`)
console.log(`bez kandydata w OSM: ${noCand.length}`)
console.log(`bez rozpoznanej klasy nazwy: ${noClass.length}`)
writeFileSync(resolve(root, '.tmp/poi-audit.json'), JSON.stringify(report, null, 1))
console.log('\npelny raport: .tmp/poi-audit.json')
