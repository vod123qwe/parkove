// Szczegóły kawiarni, restauracji i placów zabaw, żeby na liście było widać, CO
// to za miejsce, a nie tylko że jest.
//
// Źródło: Nominatim reverse z `extratags` w punkcie każdego miejsca. To obejście:
// właściwą drogą jest Overpass, bo wyposażenie placu zabaw (huśtawki,
// zjeżdżalnia, piaskownica) leży w OSM jako OSOBNE węzły wewnątrz obszaru placu,
// a reverse zwraca tylko sam obszar. Overpass był 2026-08-21 nieosiągalny ze
// wszystkich trzech lustr, więc bierzemy to, co jest: nawierzchnia i dostęp dla
// placów, kuchnia, ogródek, na wynos i godziny dla gastronomii.
//
// Uruchomienie: node scripts/fetch-amenity-details.mjs
// Wynik: .tmp/amenity-details.json

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const out = resolve(root, '.tmp/amenity-details.json')
mkdirSync(dirname(out), { recursive: true })
const done = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : {}

const src = readFileSync(resolve(root, 'src/app/data/amenities.ts'), 'utf8')
const spots = []
let park = null
for (const line of src.split('\n')) {
  const p = line.match(/^  '?([a-z0-9-]+)'?:\s*\[/)
  if (p) park = p[1]
  const m = line.match(/\{ id: '([^']+)', name: "([^"]*)", kind: '([^']+)', coords: \[([\d.]+), ([\d.]+)\]/)
  if (m && park) {
    spots.push({ park, id: m[1], name: m[2], kind: m[3], lon: +m[4], lat: +m[5] })
  }
}
console.log(`miejsc do sprawdzenia: ${spots.length}\n`)

/** tylko to, co mówi COŚ o miejscu; resztę wyrzucamy */
const KEEP = [
  'surface',
  'access',
  'fenced',
  'wheelchair',
  'min_age',
  'max_age',
  'shade',
  'lit',
  'opening_hours',
  'cuisine',
  'outdoor_seating',
  'takeaway',
  'diet:vegetarian',
  'internet_access',
  'dog',
  'website',
  'description',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let hit = 0
for (const s of spots) {
  const key = `${s.park}/${s.id}`
  if (done[key]) continue
  await sleep(1400) // Nominatim: jedno zapytanie na sekundę, z zapasem
  const url =
    'https://nominatim.openstreetmap.org/reverse?' +
    new URLSearchParams({
      lat: String(s.lat),
      lon: String(s.lon),
      format: 'jsonv2',
      zoom: '18',
      extratags: '1',
    })
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'parkove-dev/0.52 (jarek local)' } })
    const d = await res.json()
    const et = d.extratags ?? {}
    const kept = Object.fromEntries(Object.entries(et).filter(([k]) => KEEP.includes(k)))
    /*
     * Kontrola trafienia: reverse potrafi oddać budynek albo cały park zamiast
     * naszego miejsca. Bierzemy tylko wtedy, gdy typ obiektu zgadza się z tym,
     * czego szukamy.
     */
    const wantsPlay = s.kind === 'playground'
    const okType = wantsPlay
      ? d.type === 'playground'
      : ['cafe', 'restaurant', 'fast_food', 'ice_cream', 'bar', 'pub', 'bakery'].includes(d.type)
    done[key] = okType
      ? { ok: true, type: d.type, name: d.name || null, tags: kept }
      : { ok: false, got: `${d.category}/${d.type}` }
    if (okType && Object.keys(kept).length) hit++
    console.log(
      `${okType ? 'OK  ' : 'MISS'} ${key.padEnd(42)} ${d.type ?? '?'} ${JSON.stringify(kept).slice(0, 70)}`,
    )
  } catch (e) {
    console.log(`BLAD ${key}: ${e.message}`)
  }
  writeFileSync(out, JSON.stringify(done, null, 1))
}
writeFileSync(out, JSON.stringify(done, null, 1))
const withTags = Object.values(done).filter((d) => d.ok && Object.keys(d.tags ?? {}).length).length
console.log(`\ntrafionych: ${Object.values(done).filter((d) => d.ok).length}, z tego z tagami: ${withTags}`)
