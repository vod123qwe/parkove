// Szlaki i trasy spacerowe dla każdego miejsca, policzone raz i zapisane.
//
// Decyzja Jarka (2026-08-22): bierzemy JEDNO I DRUGIE. Jeśli przez miejsce
// przechodzi prawdziwy szlak znakowany z OpenStreetMap, pokazujemy go taki,
// jaki jest w terenie (z kolorem). Jeśli nie ma żadnego, albo obok szlaku,
// dajemy trasę policzoną routerem pieszym przez punkty wyprawy.
//
// Warianty są GOTOWE, bez edycji w aplikacji (też decyzja Jarka): wszystko
// policzone tutaj, zapisane w danych, więc w dolinie bez zasięgu i tak działa.
//
// Co powstaje dla jednego miejsca:
//   1. „Wszystkie punkty"  - pętla od parkingu przez wszystkie punkty wyprawy
//                            (usługa trip OSRM sama układa kolejność),
//   2. „Krótka pętla"      - tylko trzy punkty najbliższe parkingowi, gdy
//                            miejsce ma co najmniej cztery punkty,
//   3. szlaki znakowane    - relacje route=hiking/foot z OSM, przycięte do
//                            obrysu miejsca, z nazwą i kolorem.
//
// Czego to NIE gwarantuje: że szlak jest wygodny, oznakowany w terenie tak,
// jak w danych, i przejezdny z wózkiem. Dlatego w UI mówimy „ścieżkami”, a
// długość podajemy w granicach miejsca, nie całego szlaku.
//
// Uruchomienie:
//   npm run trails                      wszystkie miejsca (dlugo: kilkadziesiat minut)
//   npm run trails -- dolina-bedkowska  jedno miejsce, reszta zostaje z cache
//   npm run trails -- --prune           bez sieci: przelicz same progi na cache
//
// Tryb --prune jest po to, zeby zmiana progu dlugosci nie kosztowala godziny
// pytania Overpassa i OSRM o rzeczy, ktore juz mamy.
//
// Wynik: src/app/data/trails.ts

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const UA = { 'User-Agent': 'Parkove/0.59 (personal Krakow parks project)' }
const OSRM = 'https://routing.openstreetmap.de/routed-foot'
/*
 * Kilka serwerow Overpass, bo glowny bywa nieosiagalny. W biegu 2026-08-22
 * overpass-api.de odpowiadal timeoutem na kazde zapytanie i CALY plik wyszedl
 * bez szlakow znakowanych, po cichu. Teraz probujemy po kolei i mowimy glosno,
 * gdy zaden nie odpowiada.
 *
 * UWAGA: nie dopisuj tu overpass.osm.ch. To wyciag SZWAJCARSKI: na zapytanie o
 * Krakow odpowiada 200 i pusta lista, wiec dane wychodza ciche i falszywe.
 * Serwer, ktory nie odpowiada, jest bezpieczniejszy niz taki, ktory klamie.
 */
const OVERPASS_HOSTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/*
 * Pętle prowadzone RĘCZNIE, punktami kierunkowymi.
 *
 * Jarek o zalewie: „szlak jest dziwny, powinien kierować wokół jeziora,
 * uwzględniając też ew. place zabaw".
 *
 * Pierwsze podejście układało pętlę z samych punktów wyprawy, po kolei, i było
 * błędne z powodu, który widać tylko po zmierzeniu. Router zawsze łączy dwa
 * sąsiednie przystanki NAJKRÓTSZĄ drogą, a najkrótsza droga między dwoma
 * punktami tego samego brzegu nigdy nie prowadzi wokół wody. Trasa sklejała się
 * więc do brzegu zachodniego i chodziła po nim tam i z powrotem: zmierzone 42%
 * długości pokonywane dwa razy, przy 20% dla prawdziwej pętli brzegiem.
 *
 * Dlatego tutaj NIE podajemy przystanków, tylko KIERUNEK: kilka punktów, przez
 * które trasa ma przejść, żeby objechać wodę z obu stron. Przystanki wychodzą
 * potem same, z tego, co pętla naprawdę mija (patrz stopWithin). Jeśli punkt
 * leży na slepym zaułku, nie trafia na listę i dobrze: dla zalewu wciągnięcie
 * piaskowych boisk i młyna wydłużało pętlę z 2,8 do 3,8 km i podnosiło
 * zawracanie do 52%, bo w północno-zachodni narożnik wchodzi się i wychodzi tą
 * samą ścieżką. Te punkty zostają w pętli „przez wszystkie punkty", która po to
 * właśnie jest.
 */
const RINGS = {
  'zalew-nowohucki': {
    id: 'wokol-wody',
    name: 'Pętla wokół wody',
    /* zachodni pomost, tężnia na północy, wschodni brzeg, fontanny od południa */
    via: [
      [20.0504, 50.08071],
      [20.05154, 50.08135],
      [20.0561, 50.079],
      [20.05245, 50.0773],
    ],
    stopWithin: 60,
  },
}

const parksData = JSON.parse(readFileSync(resolve(root, 'src/app/data/parks.json'), 'utf8'))

/* ---------- dane wejściowe czytane z plików TS, bo tam mieszkają ---------- */

/** punkty wyprawy: id, nazwa i współrzędne. Uwaga: część plików ma "..." */
function readQuests() {
  const out = {}
  for (const file of ['src/app/data/quests.ts', 'src/app/data/quests-dolinki.ts']) {
    let park = null
    for (const line of readFileSync(resolve(root, file), 'utf8').split('\n')) {
      const p = line.match(/^\s+parkId: ['"]([a-z0-9-]+)['"]/)
      if (p) {
        park = p[1]
        out[park] = out[park] ?? []
        continue
      }
      if (!park) continue
      const id = line.match(/^\s{8}id: ['"]([^'"]+)['"]/)
      if (id) out[park].push({ id: id[1], name: null, coords: null })
      const last = out[park][out[park].length - 1]
      if (!last) continue
      const nm = line.match(/^\s{8}name: ['"]([^'"]+)['"]/)
      if (nm && !last.name) last.name = nm[1]
      const c = line.match(/^\s{8}coords: \[(-?[\d.]+), (-?[\d.]+)\]/)
      if (c) last.coords = [+c[1], +c[2]]
    }
  }
  for (const [k, v] of Object.entries(out)) out[k] = v.filter((x) => x.coords)
  return out
}

/** pierwszy parking miejsca = sugerowany start */
function readParkingStarts() {
  const src = readFileSync(resolve(root, 'src/app/data/parking.ts'), 'utf8')
  const out = {}
  let park = null
  let pending = false
  for (const line of src.split('\n')) {
    const p = line.match(/^  '?([a-z0-9-]+)'?: \[/)
    if (p) {
      park = p[1]
      pending = true
      continue
    }
    if (!park || !pending) continue
    const c = line.match(/^\s+coords: \[(-?[\d.]+), (-?[\d.]+)\]/)
    if (c) {
      out[park] = [+c[1], +c[2]]
      pending = false
    }
  }
  return out
}

/* ---------- geometria ---------- */

const R = 6371000
const rad = (d) => (d * Math.PI) / 180
function dist(a, b) {
  const dLat = rad(b[1] - a[1])
  const dLng = rad(b[0] - a[0])
  const la = rad(a[1])
  const lb = rad(b[1])
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la) * Math.cos(lb) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
const lineLength = (line) => line.reduce((s, p, i) => (i ? s + dist(line[i - 1], p) : 0), 0)

function ringsFor(parkId) {
  const f = parksData.features.find((x) => x.id === parkId)
  if (!f) return null
  return f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates.flat()
}

/** obrys uproszczony do zapytania Overpass (poly: nie lubi tysiąca punktów) */
function polyFor(parkId) {
  const rings = ringsFor(parkId)
  if (!rings?.length) return null
  const ring = rings[0]
  const step = Math.max(1, Math.ceil(ring.length / 60))
  return ring
    .filter((_, i) => i % step === 0)
    .map((c) => `${c[1].toFixed(5)} ${c[0].toFixed(5)}`)
    .join(' ')
}

function inPolygon(pt, rings) {
  // pierwszy pierścień to obrys, dalsze to dziury: nieparzysta liczba trafień = w środku
  let inside = false
  for (const ring of rings) {
    let hit = false
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i]
      const [xj, yj] = ring[j]
      if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi)
        hit = !hit
    }
    if (hit) inside = !inside
  }
  return inside
}

/** rzadszy zapis linii: 6 m wystarcza na mapie i mocno skraca plik danych */
function thin(line, minStep = 6) {
  const out = []
  for (const p of line) {
    const c = [+p[0].toFixed(5), +p[1].toFixed(5)]
    if (!out.length || dist(out[out.length - 1], c) >= minStep) out.push(c)
  }
  const last = line[line.length - 1]
  const lastC = [+last[0].toFixed(5), +last[1].toFixed(5)]
  if (out.length && dist(out[out.length - 1], lastC) > 1) out.push(lastC)
  return out
}

/* ---------- router ---------- */

async function osrm(service, coords, extra = '') {
  const url = `${OSRM}/${service}/v1/foot/${coords
    .map((c) => `${c[0]},${c[1]}`)
    .join(';')}?overview=full&geometries=geojson${extra}`
  for (let attempt = 1; attempt <= 3; attempt++) {
    await sleep(attempt * 900)
    try {
      const res = await fetch(url, { headers: UA })
      if (!res.ok) continue
      const d = await res.json()
      const trip = (d.trips ?? d.routes ?? [])[0]
      if (trip) return { trip, waypoints: d.waypoints ?? [] }
    } catch {
      /* następna próba */
    }
  }
  return null
}

/** pętla od startu przez podane punkty, kolejność układa usługa trip */
/**
 * Pętla prowadzona punktami kierunkowymi, z przystankami wyliczonymi z trasy.
 *
 * Różnica wobec loopThrough jest zasadnicza. Tam przystanki są WEJŚCIEM i router
 * dobiera kolejność (usługa trip). Tu wejściem jest KSZTAŁT, a przystanki są
 * WYNIKIEM: bierzemy te punkty wyprawy, które gotowa trasa naprawdę mija, i
 * układamy je w kolejności, w jakiej się je spotyka. Dzięki temu żaden punkt nie
 * wykrzywia pętli, a lista przystanków nie kłamie o tym, co się zobaczy.
 */
async function ringThrough(start, pois, ring) {
  const coords = [start, ...ring.via, start]
  const r = await osrm('route', coords)
  if (!r) return null
  const line = r.trip.geometry.coordinates

  /* dla każdego punktu: jak blisko trasy leży i w którym jej metrze */
  const near = []
  for (const poi of pois) {
    let best = Infinity
    let at = 0
    let run = 0
    for (let i = 0; i < line.length - 1; i++) {
      const d = dist(poi.coords, line[i])
      if (d < best) {
        best = d
        at = run
      }
      run += dist(line[i], line[i + 1])
    }
    if (best <= (ring.stopWithin ?? 60)) near.push({ id: poi.id, at })
  }
  near.sort((a, b) => a.at - b.at)

  return {
    m: Math.round(r.trip.distance),
    min: Math.max(1, Math.round(r.trip.duration / 60)),
    stops: near.map((n) => n.id),
    line: thin(line),
  }
}

async function loopThrough(start, pois) {
  const coords = [start, ...pois.map((p) => p.coords)]
  const r = await osrm('trip', coords, '&roundtrip=true&source=first')
  if (!r) return null
  // waypoint_index mówi, w jakiej kolejności router odwiedza punkty
  const order = r.waypoints
    .map((w, i) => ({ i, at: w.waypoint_index }))
    .filter((w) => w.i > 0)
    .sort((a, b) => a.at - b.at)
    .map((w) => pois[w.i - 1].id)
  return {
    m: Math.round(r.trip.distance),
    min: Math.max(1, Math.round(r.trip.duration / 60)),
    stops: order,
    line: thin(r.trip.geometry.coordinates),
  }
}

/* ---------- szlaki znakowane z OSM ---------- */

const COLOUR_PL = {
  yellow: 'żółty',
  red: 'czerwony',
  blue: 'niebieski',
  green: 'zielony',
  black: 'czarny',
  white: 'biały',
}

let overpassDown = 0
async function overpass(query) {
  for (const host of OVERPASS_HOSTS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      await sleep(attempt * 2200)
      try {
        const res = await fetch(host, {
          method: 'POST',
          headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'data=' + encodeURIComponent(query),
        })
        if (!res.ok) continue
        return await res.json()
      } catch {
        /* nastepny serwer */
      }
    }
  }
  overpassDown++
  console.warn('  ! Overpass nie odpowiada, szlaki znakowane nieznane dla tego miejsca')
  return null
}

/** kawałki drogi wewnątrz obrysu, zszyte w jedną linię od najdłuższego kawałka */
function stitch(ways, rings) {
  const pieces = []
  for (const w of ways) {
    let run = []
    for (const g of w.geometry ?? []) {
      const pt = [g.lon, g.lat]
      if (inPolygon(pt, rings)) run.push(pt)
      else {
        if (run.length > 1) pieces.push(run)
        run = []
      }
    }
    if (run.length > 1) pieces.push(run)
  }
  if (!pieces.length) return null
  pieces.sort((a, b) => lineLength(b) - lineLength(a))
  const chain = pieces.shift()
  let joined = true
  while (joined && pieces.length) {
    joined = false
    for (let i = 0; i < pieces.length; i++) {
      const p = pieces[i]
      const head = chain[0]
      const tail = chain[chain.length - 1]
      const gap = 40
      if (dist(tail, p[0]) < gap) chain.push(...p)
      else if (dist(tail, p[p.length - 1]) < gap) chain.push(...[...p].reverse())
      else if (dist(head, p[p.length - 1]) < gap) chain.unshift(...p)
      else if (dist(head, p[0]) < gap) chain.unshift(...[...p].reverse())
      else continue
      pieces.splice(i, 1)
      joined = true
      break
    }
  }
  return chain
}

async function markedTrails(parkId) {
  const poly = polyFor(parkId)
  const rings = ringsFor(parkId)
  if (!poly || !rings) return []
  const rels = await overpass(
    `[out:json][timeout:120];rel(poly:"${poly}")[type=route][route~"^(hiking|foot)$"];out tags;`,
  )
  const list = (rels?.elements ?? []).filter((e) => e.type === 'relation')
  const out = []
  for (const rel of list.slice(0, 6)) {
    const geom = await overpass(
      `[out:json][timeout:120];rel(id:${rel.id});way(r)(poly:"${poly}");out geom 900;`,
    )
    const ways = (geom?.elements ?? []).filter((e) => e.type === 'way')
    const line = stitch(ways, rings)
    if (!line) continue
    const m = Math.round(lineLength(line))
    if (m < 250) continue
    const tags = rel.tags ?? {}
    const colourRaw = (tags.colour ?? tags.color ?? tags['osmc:symbol'] ?? '')
      .split(':')[0]
      .toLowerCase()
    const colour = COLOUR_PL[colourRaw] ? colourRaw : null
    // W terenie szukasz KOLORU, nie nazwy, więc kolor jest nazwą wiersza, a
    // nazwa z OSM (często długa albo w dziwnym przypadku) idzie do podpisu.
    const osmName = tags.name && tags.name.length < 70 ? tags.name : null
    const noteBits = []
    if (osmName) noteBits.push(osmName)
    if (tags.ref) noteBits.push(tags.ref)
    out.push({
      id: 'osm-' + rel.id,
      name: colour ? `Szlak ${COLOUR_PL[colour]}` : (osmName ?? 'Szlak pieszy'),
      colour,
      m,
      min: Math.max(1, Math.round(m / 70)),
      line: thin(line),
      note: noteBits.length ? noteBits.join(', ') : null,
    })
  }
  // dwa szlaki tą samą ścieżką (kolor plus szlak długodystansowy): zostaw jeden
  const kept = []
  for (const t of out.sort((a, b) => b.m - a.m)) {
    const twin = kept.find(
      (k) => Math.abs(k.m - t.m) / Math.max(k.m, t.m) < 0.05 && dist(k.line[0], t.line[0]) < 120,
    )
    if (!twin) kept.push(t)
  }
  return kept.slice(0, 3)
}

/* ---------- główna pętla ---------- */

const quests = readQuests()
const starts = readParkingStarts()
const argv = process.argv.slice(2)
const pruneOnly = argv.includes('--prune')
const only = argv.filter((a) => !a.startsWith('--'))
const parks = pruneOnly
  ? []
  : Object.keys(quests).filter((p) => (only.length ? only.includes(p) : true))

/*
 * Cache obok wyniku. Bieg dla jednego miejsca ma poprawic JEGO wiersze, a nie
 * wyczyscic wszystkie inne, i po zerwaniu polaczenia z Overpass nie chcemy
 * liczyc od zera.
 */
const CACHE = resolve(root, 'scripts/.trails-cache.json')
const result = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}
for (const parkId of parks) {
  const pois = quests[parkId]
  if (!pois?.length) continue
  const feature = parksData.features.find((f) => f.id === parkId)
  const start = starts[parkId] ?? feature?.properties?.center ?? pois[0].coords
  const trails = []

  /*
   * Prog 600 m. Kopiec Wandy dostal w pierwszym biegu "trase" na 200 m, a
   * przejscie miedzy dwoma punktami na kopcu nie jest szlakiem i tylko zasmieca
   * wybor. Male miejsca po prostu nie maja wariantow.
   */
  /*
   * Pętla ułożona ręcznie idzie PIERWSZA, bo jest lepszą propozycją niż wynik
   * optymalizacji: prowadzi brzegiem i mija po drodze to, po co się tu przyszło.
   */
  const ring = RINGS[parkId]
  if (ring) {
    const r = await ringThrough(start, pois, ring)
    if (r) {
      trails.push({ id: ring.id, name: ring.name, kind: 'points', ...r })
      console.log(`  ${ring.id}: ${r.m} m, mija ${r.stops.length} punktów (${r.stops.join(', ')})`)
    }
  }

  const full = await loopThrough(start, pois)
  if (full && full.m >= 600)
    trails.push({
      id: 'punkty-wszystkie',
      name: pois.length > 2 ? 'Pętla przez wszystkie punkty' : 'Trasa przez punkty',
      kind: 'points',
      ...full,
    })

  /*
   * Krotszy wariant tylko wtedy, gdy pelna petla jest naprawde dluga. Skawina
   * dostala w pierwszym biegu "krotka petle" na 200 m, co nie jest spacerem,
   * tylko przejsciem przez skwer.
   */
  if (!ring && pois.length >= 4 && full && full.m > 2500) {
    const near = [...pois].sort((a, b) => dist(start, a.coords) - dist(start, b.coords)).slice(0, 3)
    const short = await loopThrough(start, near)
    if (short && short.m >= 700 && short.m < full.m * 0.7)
      trails.push({ id: 'punkty-krotka', name: 'Krótka pętla', kind: 'points', ...short })
  }

  const marked = await markedTrails(parkId)
  for (const t of marked) trails.push({ ...t, kind: 'osm' })

  if (trails.length) result[parkId] = trails
  else delete result[parkId]
  writeFileSync(CACHE, JSON.stringify(result), 'utf8')
  const sum = trails.map((t) => `${t.kind}:${(t.m / 1000).toFixed(1)}km`).join(' ')
  console.log(`${parkId.padEnd(24)} ${trails.length} ${sum}`)
}

/*
 * Progi na koniec, takze w trybie --prune: warianty policzone przy starszym
 * progu maja wypasc bez ponownego pytania sieci.
 */
const MIN_M = 600
for (const [park, trails] of Object.entries(result)) {
  const kept = trails.filter((t) => t.kind === 'osm' || t.m >= MIN_M)
  const short = trails.length - kept.length
  if (short) console.log(`${park.padEnd(24)} usuniete krotkie warianty: ${short}`)
  if (kept.length) result[park] = kept
  else delete result[park]
}
writeFileSync(CACHE, JSON.stringify(result), 'utf8')

/* ---------- zapis ---------- */

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const body = Object.entries(result)
  .map(([park, trails]) => {
    const rows = trails
      .map((t) => {
        const bits = [
          `id: '${t.id}'`,
          `name: '${esc(t.name)}'`,
          `kind: '${t.kind}'`,
          `m: ${t.m}`,
          `min: ${t.min}`,
        ]
        if (t.colour) bits.push(`colour: '${t.colour}'`)
        if (t.stops?.length) bits.push(`stops: [${t.stops.map((s) => `'${s}'`).join(', ')}]`)
        if (t.note) bits.push(`note: '${esc(t.note)}'`)
        bits.push(`line: [${t.line.map((c) => `[${c[0]},${c[1]}]`).join(',')}]`)
        return `    { ${bits.join(', ')} },`
      })
      .join('\n')
    return `  '${park}': [\n${rows}\n  ],`
  })
  .join('\n')

const header = `// Szlaki i trasy spacerowe per miejsce.
//
// GENEROWANE: scripts/build-trails.mjs. Nie edytuj ręcznie.
//
// kind 'osm'    = prawdziwy szlak znakowany z OpenStreetMap, przycięty do
//                 obrysu miejsca. Długość dotyczy odcinka W GRANICACH miejsca.
// kind 'points' = trasa policzona routerem pieszym przez punkty wyprawy,
//                 pętla od sugerowanego parkingu.
//
// Warianty są gotowe i nieedytowalne w aplikacji, żeby działały bez sieci.

export type TrailKind = 'osm' | 'points'

export type Trail = {
  id: string
  name: string
  kind: TrailKind
  /** metry: dla szlaku znakowanego tylko odcinek wewnątrz miejsca */
  m: number
  min: number
  /** kolor szlaku znakowanego, angielska nazwa z OSM */
  colour?: string
  /** kolejność punktów wyprawy, tak jak ułożył ją router */
  stops?: string[]
  note?: string
  line: Array<[number, number]>
}

export const TRAILS: Record<string, Trail[]> = {
${body}
}

export const trailsFor = (parkId: string): Trail[] => TRAILS[parkId] ?? []

export const trailById = (parkId: string, id: string | null) =>
  (id ? trailsFor(parkId).find((t) => t.id === id) : null) ?? null

/** żółty, czerwony...: do etykiety obok nazwy */
export const COLOUR_PL: Record<string, string> = {
  yellow: 'żółty',
  red: 'czerwony',
  blue: 'niebieski',
  green: 'zielony',
  black: 'czarny',
  white: 'biały',
}

/** kolor linii na mapie; szlak znakowany dostaje swój, trasa liczona akcent */
export const TRAIL_INK: Record<string, string> = {
  yellow: '#e8b710',
  red: '#e0463c',
  blue: '#2f7ad6',
  green: '#2f9e57',
  black: '#333333',
  white: '#f2f2f2',
}
`

writeFileSync(resolve(root, 'src/app/data/trails.ts'), header, 'utf8')
const markedCount = Object.values(result)
  .flat()
  .filter((t) => t.kind === 'osm').length
console.log(
  `
zapisane: ${Object.keys(result).length} miejsc, szlakow znakowanych: ${markedCount}`,
)
if (overpassDown)
  console.warn(
    `UWAGA: ${overpassDown} zapytan do Overpass nie doszlo, szlaki znakowane sa NIEPELNE. ` +
      'Przelicz te miejsca ponownie: node scripts/build-trails.mjs <parkId ...>',
  )
if (!markedCount)
  console.warn(
    'UWAGA: zero szlakow znakowanych w calym pliku. Dla dolinek jurajskich to niemozliwe, ' +
      'wiec Overpass albo nie odpowiadal, albo odpowiadal z niepelnego wyciagu.',
  )
