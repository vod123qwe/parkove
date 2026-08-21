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
// Cel trasy: najbliższy punkt wyprawy tego miejsca, a gdy quest nie istnieje,
// środek parku. Dzięki temu parking przy jaskini prowadzi do jaskini, a nie do
// wodospadu trzy kilometry dalej.
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

/** punkty wypraw: cel trasy to najbliższy z nich */
const questSrc =
  readFileSync(resolve(root, 'src/app/data/quests.ts'), 'utf8') +
  readFileSync(resolve(root, 'src/app/data/quests-dolinki.ts'), 'utf8')
const pois = {}
{
  const re = /parkId: '([^']+)'([\s\S]*?)(?=\n  \{|\n\]|$)/g
  let m
  while ((m = re.exec(questSrc))) {
    const list = [...m[2].matchAll(/coords: \[\s*([\d.]+),\s*([\d.]+)\s*\]/g)].map((c) => [+c[1], +c[2]])
    pois[m[1]] = (pois[m[1]] ?? []).concat(list)
  }
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
let ok = 0
let miss = 0
for (const p of parkings) {
  if (!p.coords || !p.park) continue
  const targets = pois[p.park] ?? []
  const target = targets.length
    ? targets.map((t) => ({ t, d: dist(p.coords, t) })).sort((a, b) => a.d - b.d)[0].t
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
    const straight = dist(p.coords, target)
    routes[`${p.park}/${p.id}`] = {
      m: Math.round(r.distance),
      min: Math.max(1, Math.round(r.duration / 60)),
      line,
    }
    ok++
    console.log(
      `OK   ${(p.park + '/' + p.id).padEnd(38)} ${String(Math.round(r.distance)).padStart(5)} m ` +
        `(prosto ${Math.round(straight)} m, obejście ${Math.round((r.distance / straight - 1) * 100)}%), ` +
        `${Math.round(r.duration / 60)} min, ${line.length} punktów`,
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
      `  '${k}': { m: ${v.m}, min: ${v.min}, line: [${v.line.map((p) => `[${p[0]},${p[1]}]`).join(',')}] },`,
  )
  .join('\n')

const NL = String.fromCharCode(10)
writeFileSync(
  resolve(root, 'src/app/data/walk-routes.ts'),
  [
    '// Trasy pieszo od parkingu do najblizszego punktu miejsca, policzone raz',
    '// routerem pieszym OpenStreetMap (profil foot) i zapisane, zeby aplikacja',
    '// nie potrzebowala sieci ani uslugi w terenie.',
    '//',
    '// GENEROWANE: scripts/fetch-walk-routes.mjs. Nie edytuj recznie.',
    '//',
    '// Trasa istnieje = w danych OSM jest przejscie sciezkami. To NIE znaczy, ze',
    '// jest wygodne ani otwarte, dlatego w UI mowimy "sciezkami", nie "latwo".',
    '',
    'export type WalkRoute = { m: number; min: number; line: Array<[number, number]> }',
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
