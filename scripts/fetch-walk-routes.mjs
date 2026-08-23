// Prawdziwe trasy pieszo od parkingu do miejsca, policzone raz i zapisane.
//
// Powód: w kaflu parkingu rysowaliśmy linię prostą, a Jarek zapytał wprost, czy
// z parkingu faktycznie dojdzie, czy trafi na dwustumetrową skarpę. Linia prosta
// tego nie mówi. Router pieszy z OpenStreetMap chodzi po ścieżkach, dróżkach i
// szlakach, więc jeśli trasa wychodzi, to znaczy, że w danych OSM jest przejście.
//
// Czego to NIE gwarantuje: że ścieżka jest wygodna, otwarta i przejezdna z
// wózkiem. Dlatego w aplikacji piszemy „ścieżkami", a nie „łatwo".
//
// Cel trasy: najbliższe WEJŚCIE NA ŚCIEŻKĘ prowadzącą przez park albo dolinę.
// Pytamy Overpass o pieszą sieć (path, footway, track, steps, pedestrian,
// bridleway, cycleway) LEŻĄCĄ WEWNĄTRZ obrysu miejsca i celujemy w jej punkt
// najbliższy parkingowi. Dzięki temu trasa kończy się tam, gdzie zaczyna się
// spacer, a nie na środku łąki ani na konkretnym punkcie wyprawy trzy kilometry
// dalej.
//
// Uruchomienie: node scripts/fetch-walk-routes.mjs
// Wynik: src/app/data/walk-routes.ts

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const UA = { 'User-Agent': 'Parkove/0.58 (personal Krakow parks project)' }
const ROUTER = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot'

const parksData = JSON.parse(readFileSync(resolve(root, 'src/app/data/parks.json'), 'utf8'))

/** parkingi czytamy z pliku danych, bo to jedyne miejsce, gdzie są */
const parkingSrc = readFileSync(resolve(root, 'src/app/data/parking.ts'), 'utf8')
const parkings = []
{
  let park = null
  for (const line of parkingSrc.split('\n')) {
    const p = line.match(/^  '?([a-z0-9-]+)'?: \[/)
    if (p) park = p[1]
    const id = line.match(/^\s+id: '([^']+)'/)
    if (id) parkings.push({ park, id: id[1], coords: null })
    const c = line.match(/^\s+coords: \[([\d.]+), ([\d.]+)\]/)
    if (c && parkings.length) parkings[parkings.length - 1].coords = [+c[1], +c[2]]
  }
}

/** obrys miejsca, uproszczony do zapytania Overpass */
function ringFor(parkId) {
  const f = parksData.features.find((x) => x.id === parkId)
  if (!f) return null
  const rings =
    f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates.flat()
  const ring = rings[0]
  const step = Math.max(1, Math.ceil(ring.length / 60))
  return ring.filter((_, i) => i % step === 0)
}

const FOOT = '^(path|footway|track|steps|pedestrian|bridleway|cycleway)$'

/** wszystkie punkty pieszej sieci wewnątrz miejsca: to z nich wybieramy wejście */
async function trailPoints(parkId) {
  const ring = ringFor(parkId)
  if (!ring) return []
  const poly = ring.map((c) => `${c[1]} ${c[0]}`).join(' ')
  const q = `[out:json][timeout:90];way(poly:"${poly}")[highway~"${FOOT}"];out geom 800;`
  /*
   * Kilka hostow, bo jeden nie wystarcza. overpass-api.de potrafi nie odpowiadac
   * godzinami, a wtedy `fetch` konczy sie wyjatkiem po dziesieciu sekundach i
   * caly skrypt sie wywraca. Ten sam problem i to samo rozwiazanie, co w
   * build-trails.mjs.
   *
   * NIGDY overpass.osm.ch: to wyciag szwajcarski, dla Polski cicho zwraca 200 i
   * pusty wynik, co jest gorsze od bledu.
   */
  const HOSTS = [
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
  ]
  for (const host of HOSTS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      await sleep(attempt * 2500)
      try {
        const res = await fetch(host, {
          method: 'POST',
          headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'data=' + encodeURIComponent(q),
        })
        const text = await res.text()
        if (!text.trim().startsWith('{')) continue
        const d = JSON.parse(text)
        return (d.elements ?? []).flatMap((e) => (e.geometry ?? []).map((g) => [g.lon, g.lat]))
      } catch {
        /* nastepny host albo nastepna proba */
      }
    }
    console.log(`  overpass ${new URL(host).hostname} nie odpowiada, probuje dalej`)
  }
  console.log('  zaden host overpass nie odpowiedzial: brak sciezek dla tego miejsca')
  return []
}

const dist = (a, b) => {
  const R = 6371000
  const t = (x) => (x * Math.PI) / 180
  const d1 = t(b[1] - a[1])
  const d2 = t(b[0] - a[0])
  const h = Math.sin(d1 / 2) ** 2 + Math.cos(t(a[1])) * Math.cos(t(b[1])) * Math.sin(d2 / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const centre = (id) => {
  const f = parksData.features.find((x) => x.id === id)
  return f?.properties?.center ?? null
}

/** wyrzuć punkty bliższe niż 6 m: linia w kadrze 130 px nie potrzebuje więcej */
function thin(line) {
  const out = [line[0]]
  for (const p of line.slice(1, -1)) if (dist(out[out.length - 1], p) > 6) out.push(p)
  out.push(line[line.length - 1])
  return out.map((p) => [+p[0].toFixed(5), +p[1].toFixed(5)])
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const routes = {}
const trailCache = {}
let ok = 0
let miss = 0
for (const p of parkings) {
  if (!p.coords || !p.park) continue
  if (!(p.park in trailCache)) {
    trailCache[p.park] = await trailPoints(p.park)
    console.log(`  sieć ścieżek ${p.park}: ${trailCache[p.park].length} punktów`)
  }
  const trail = trailCache[p.park]
  const target = trail.length
    ? trail.map((t) => ({ t, d: dist(p.coords, t) })).sort((a, b) => a.d - b.d)[0].t
    : centre(p.park)
  if (!target) {
    console.log(`BRAK CELU ${p.park}/${p.id}`)
    miss++
    continue
  }
  await sleep(1100) // grzecznie: publiczny router społeczności
  const url = `${ROUTER}/${p.coords[0]},${p.coords[1]};${target[0]},${target[1]}?overview=full&geometries=geojson`
  try {
    const res = await fetch(url, { headers: UA })
    const d = await res.json()
    const r = d.routes?.[0]
    if (d.code !== 'Ok' || !r?.geometry?.coordinates?.length) {
      console.log(`BEZ TRASY ${p.park}/${p.id}: ${d.code}`)
      miss++
      continue
    }
    const line = thin(r.geometry.coordinates)
    routes[`${p.park}/${p.id}`] = {
      m: Math.round(r.distance),
      min: Math.max(1, Math.round(r.duration / 60)),
      line,
      trail: trail.length > 0,
    }
    ok++
    console.log(
      `OK   ${(p.park + '/' + p.id).padEnd(38)} ${String(Math.round(r.distance)).padStart(5)} m, ` +
        `${Math.round(r.duration / 60)} min, ${line.length} punktów${trail.length ? '' : ' (bez sieci ścieżek, cel = środek)'}`,
    )
  } catch (e) {
    console.log(`BLAD ${p.park}/${p.id}: ${e.message}`)
    miss++
  }
}

const body = Object.entries(routes)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(
    ([k, v]) =>
      `  '${k}': { m: ${v.m}, min: ${v.min}, trail: ${v.trail}, line: [${v.line.map((p) => `[${p[0]},${p[1]}]`).join(',')}] },`,
  )
  .join('\n')

const NL = String.fromCharCode(10)
writeFileSync(
  resolve(root, 'src/app/data/walk-routes.ts'),
  [
    '// Trasy pieszo od parkingu do najblizszego wejscia na sciezke wewnatrz',
    '// miejsca, policzone raz',
    '// routerem pieszym OpenStreetMap (profil foot) i zapisane, zeby aplikacja',
    '// nie potrzebowala sieci ani uslugi w terenie.',
    '//',
    '// GENEROWANE: scripts/fetch-walk-routes.mjs. Nie edytuj recznie.',
    '//',
    '// Trasa istnieje = w danych OSM jest przejscie sciezkami. To NIE znaczy, ze',
    '// jest wygodne ani otwarte, dlatego w UI mowimy "sciezkami", nie "latwo".',
    '',
    'export type WalkRoute = { m: number; min: number; trail: boolean; line: Array<[number, number]> }',
    '',
    'export const WALK_ROUTES: Record<string, WalkRoute> = {',
    body,
    '}',
    '',
    'export const walkRoute = (parkId: string, spotId: string) =>',
    "  WALK_ROUTES[parkId + '/' + spotId] ?? null",
    '',
  ].join(NL),
)
console.log(`\ntras: ${ok}, bez trasy: ${miss}`)
