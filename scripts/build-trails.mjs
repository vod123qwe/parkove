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
// Co powstaje dla jednego miejsca (od 2026-08-24 BEZ parkingu w trasie,
// decyzja Jarka: parking dokłada się ręcznie w kreatorze w aplikacji):
//   1. pętla po parku      - punktami kierunkowymi z obrysu (compassVia),
//                            brana tylko, gdy naprawdę jest pętlą (backtrack),
//   2. „Przez cały park"   - przejście od krańca do krańca: dwa najdalsze
//                            punkty wyprawy jako końce, reszta po drodze,
//   3. „Wszystkie punkty"  - pętla od pierwszego punktu wyprawy przez resztę
//                            (usługa trip OSRM sama układa kolejność),
//   4. „Krótka pętla"      - trzy punkty leżące najbliżej SIEBIE, gdy pełna
//                            pętla jest długa,
//   5. szlaki znakowane    - relacje route=hiking/foot z OSM, przycięte do
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
//   npm run trails -- --points          przelicz TYLKO trasy points (bez Overpass);
//                                       szlaki znakowane zostaja z cache
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
      const res = await fetch(url, { headers: UA, signal: AbortSignal.timeout(20000) })
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
 * Ile procent długości trasy przebiega drugi raz tą samą ścieżką.
 *
 * Miara istnieje, bo „dziwny szlak" trzeba czymś zmierzyć, zanim się go poprawi.
 * Kalibracja z zalewu, tą samą metodą: prawdziwa pętla brzegiem 20%, pętla z
 * dojściem od parkingu 27%, trasa tam i z powrotem 89%. Progi poniżej stoją na
 * tych liczbach, nie na przeczuciu.
 *
 * Uwaga na interpretację: przy DWÓCH punktach wysoki wynik nie jest wadą, tylko
 * geometrią. Między dwoma punktami nie ma pętli, jest droga tam i droga wracająca
 * tą samą ścieżką. Dlatego próba pętli niżej wymaga co najmniej trzech
 * przystanków.
 */
function backtrack(line) {
  let total = 0
  let twice = 0
  const mid = (i) => [(line[i][0] + line[i + 1][0]) / 2, (line[i][1] + line[i + 1][1]) / 2]
  for (let i = 0; i < line.length - 1; i++) {
    const seg = dist(line[i], line[i + 1])
    total += seg
    const a = mid(i)
    for (let j = 0; j < line.length - 1; j++) {
      if (Math.abs(i - j) < 4) continue
      if (dist(a, mid(j)) < 12) {
        twice += seg
        break
      }
    }
  }
  return total > 0 ? twice / total : 1
}

/** najblizszy punkt sieci pieszej: OSRM sam mowi, gdzie jest sciezka */
async function snapToPath(pt) {
  try {
    const res = await fetch(`${OSRM}/nearest/v1/foot/${pt[0]},${pt[1]}?number=1`, {
      headers: UA,
      // bez limitu czasu jedno ciche zapytanie zawiesza caly bieg, sprawdzone
      signal: AbortSignal.timeout(12000),
    })
    if (!res.ok) return null
    const w = (await res.json()).waypoints?.[0]
    if (!w) return null
    return { at: w.location, away: w.distance }
  } catch {
    return null
  }
}

/**
 * Punkty kierunkowe z OBRYSU miejsca, PRZYKLEJONE do ścieżek.
 *
 * Sześć kierunków, każdy cofnięty do 75% drogi od środka do krawędzi, i każdy
 * przyklejony do najbliższej ścieżki pieszej. Przyklejanie jest tu całą różnicą
 * i widać to na wodzie: punkt kierunkowy nad jeziorem wypada w wodzie, a router
 * bez pytania dociąga go najkrótszą drogą, czyli przez most albo w ogóle poza
 * park. Zapytany wprost, gdzie jest ścieżka, odpowiada „na brzegu".
 *
 * Kandydat, do którego najbliższa ścieżka jest dalej niż 150 m, wypada: nie ma
 * sensu ciągnąć tam trasy tylko po to, żeby kółko było okrągłe.
 */
async function compassVia(feature) {
  const c = feature.properties?.center
  const rings = feature.geometry?.coordinates
  if (!c || !rings) return null
  const outer = feature.geometry.type === 'MultiPolygon' ? rings[0][0] : rings[0]
  if (!outer || outer.length < 8) return null
  const via = []
  for (const want of [0, 60, 120, 180, 240, 300]) {
    let best = null
    let bestGap = 999
    for (const p of outer) {
      const ang = (Math.atan2(p[1] - c[1], p[0] - c[0]) * 180) / Math.PI
      const gap = Math.abs(((ang - want + 540) % 360) - 180)
      if (gap < bestGap) {
        bestGap = gap
        best = p
      }
    }
    if (!best) continue
    const raw = [c[0] + (best[0] - c[0]) * 0.75, c[1] + (best[1] - c[1]) * 0.75]
    const snap = await snapToPath(raw)
    if (snap && snap.away <= 150) via.push(snap.at)
  }
  return via.length >= 4 ? via : null
}

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
const argv = process.argv.slice(2)
const pruneOnly = argv.includes('--prune')
/*
 * Tryb --points: przelicz same trasy liczone routerem (bez Overpass).
 * Powstał przy zmianie strategii "bez parkingu": punktowe trasy trzeba było
 * przełożyć wszystkim naraz, a szlaki znakowane nie miały się czego bać.
 */
const pointsOnly = argv.includes('--points')
/*
 * Tryb --rings: policz SAME pętle i wmieszaj je w to, co już mamy.
 *
 * Powstał z dwóch powodów. Pełny bieg pyta Overpass o szlaki znakowane dla
 * każdego miejsca i przy niedostępnym serwerze płaci kilkadziesiąt sekund na
 * park, czyli trzy kwadranse za coś, co potrzebuje siedmiu pytań do routera.
 * Drugi powód jest ważniejszy: pełny bieg PRZELICZA wiersz miejsca od zera, więc
 * dokładanie jednej trasy nie powinno w ogóle dotykać szlaków znakowanych.
 */
const ringsOnly = argv.includes('--rings')
const only = argv.filter((a) => !a.startsWith('--'))
const parks =
  pruneOnly || ringsOnly
    ? []
    : Object.keys(quests).filter((p) => (only.length ? only.includes(p) : true))

/* najdalsza para punktów: końce przejścia przez cały park */
function farthestPair(pois) {
  let best = null
  for (let i = 0; i < pois.length; i++)
    for (let j = i + 1; j < pois.length; j++) {
      const d = dist(pois[i].coords, pois[j].coords)
      if (!best || d > best.d) best = { a: i, b: j, d }
    }
  return best
}

/* trójka punktów najbliżej SIEBIE: krótka pętla bez oglądania się na parking */
function tightestTriple(pois) {
  let best = null
  for (let i = 0; i < pois.length; i++)
    for (let j = i + 1; j < pois.length; j++)
      for (let k = j + 1; k < pois.length; k++) {
        const sum =
          dist(pois[i].coords, pois[j].coords) +
          dist(pois[j].coords, pois[k].coords) +
          dist(pois[i].coords, pois[k].coords)
        if (!best || sum < best.sum) best = { pts: [pois[i], pois[j], pois[k]], sum }
      }
  return best?.pts ?? null
}

/** przejście z krańca na kraniec: source i destination stałe, środek układa trip */
async function walkAcross(pois) {
  if (pois.length < 3) return null
  const pair = farthestPair(pois)
  if (!pair || pair.d < 550) return null
  const ends = [pois[pair.a], pois[pair.b]]
  const middle = pois.filter((_, i) => i !== pair.a && i !== pair.b)
  const coords = [ends[0].coords, ...middle.map((p) => p.coords), ends[1].coords]
  const r = await osrm('trip', coords, '&roundtrip=false&source=first&destination=last')
  if (!r) return null
  const order = r.waypoints
    .map((w, i) => ({ i, at: w.waypoint_index }))
    .sort((a, b) => a.at - b.at)
    .map((w) => (w.i === 0 ? ends[0] : w.i === coords.length - 1 ? ends[1] : middle[w.i - 1]).id)
  return {
    m: Math.round(r.trip.distance),
    min: Math.max(1, Math.round(r.trip.duration / 60)),
    stops: order,
    line: thin(r.trip.geometry.coordinates),
  }
}

/*
 * Cache obok wyniku. Bieg dla jednego miejsca ma poprawic JEGO wiersze, a nie
 * wyczyscic wszystkie inne, i po zerwaniu polaczenia z Overpass nie chcemy
 * liczyc od zera.
 */
const CACHE = resolve(root, 'scripts/.trails-cache.json')
const result = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}
for (const parkId of pointsOnly ? Object.keys(quests).filter((p) => (only.length ? only.includes(p) : true)) : parks) {
  const pois = quests[parkId]
  if (!pois?.length) continue
  const feature = parksData.features.find((f) => f.id === parkId)
  /*
   * Start = PIERWSZY punkt wyprawy, nie parking (Jarek: "nie włączaj
   * parkingu domyślnie"). Trasa zaczyna się tam, gdzie zaczyna się
   * zwiedzanie; dojście z parkingu każdy dokłada w kreatorze, jeśli chce.
   */
  const start = pois[0].coords
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
   * Próba pętli dla miejsc bez ręcznej: sześć punktów kierunkowych z obrysu,
   * przyklejonych do ścieżek, i jedno pytanie do routera.
   *
   * Bierzemy wynik tylko wtedy, gdy jest WYRAŹNIE LEPSZY od pętli przez punkty,
   * którą już mamy. To jedyny uczciwy powód, żeby dołożyć drugą trasę: nie
   * „bo się udało policzyć", ale „bo tamta chodzi tam i z powrotem, a ta nie".
   * Miejsce, w którym pętli nie ma, po prostu jej nie dostaje.
   *
   * Progi: zawracanie poniżej 40% (prawdziwa pętla ma 20 do 27%, trasa tam i z
   * powrotem 89%), poprawa o co najmniej 15 punktów procentowych, i co najmniej
   * 800 m, bo krótsze kółko nie jest spacerem.
   *
   * Ta trasa może nie mijać ŻADNEGO punktu i to jest w porządku: nad wodą obejście
   * brzegiem jest tym, po co się przychodzi, a zbieranie punktów ma swoją własną
   * pozycję na liście. Karta trasy nie pokazuje wtedy liczby punktów.
   */
  if (!ring && feature && full) {
    const fullBack = backtrack(full.line)
    const via = await compassVia(feature)
    if (via) {
      const r = await ringThrough(start, pois, { via, stopWithin: 90 })
      const back = r ? backtrack(r.line) : 1
      const better = back < 0.4 && back < fullBack - 0.15 && r && r.m >= 800
      if (better) {
        const water = feature.properties?.kind === 'water'
        trails.unshift({
          id: 'wokol',
          name: water ? 'Pętla brzegiem' : 'Pętla po parku',
          kind: 'points',
          ...r,
        })
      }
      console.log(
        `  wokol: ${better ? 'wzięte' : 'odrzucone'} (${r?.m ?? 0} m, zawracanie ${Math.round(
          back * 100,
        )}%, przez punkty ${Math.round(fullBack * 100)}%, mija ${r?.stops.length ?? 0})`,
      )
    }
  }

  /*
   * Krotszy wariant tylko wtedy, gdy pelna petla jest naprawde dluga. Skawina
   * dostala w pierwszym biegu "krotka petle" na 200 m, co nie jest spacerem,
   * tylko przejsciem przez skwer.
   */
  /*
   * Przejście przez cały park: dwa najdalsze punkty jako końce, reszta po
   * drodze. To odpowiedź na "nie zawsze najkrótsza droga, która połączy
   * punkty": czasem najciekawiej jest przejść park wzdłuż, nie kręcić kółka.
   * Wchodzi, gdy końce są naprawdę daleko (550 m+) i trasa ma sens (800 m+).
   */
  const across = await walkAcross(pois)
  if (across && across.m >= 800) {
    const afterRing = trails.findIndex((t) => t.id === 'punkty-wszystkie')
    const row = { id: 'przez-park', name: 'Przez cały park', kind: 'points', ...across }
    if (afterRing >= 0) trails.splice(afterRing, 0, row)
    else trails.push(row)
    console.log(`  przez-park: ${across.m} m, mija ${across.stops.length} punktów`)
  }

  if (!ring && pois.length >= 4 && full && full.m > 2500) {
    const near = tightestTriple(pois) ?? pois.slice(0, 3)
    const short = await loopThrough(near[0].coords, near)
    if (short && short.m >= 700 && short.m < full.m * 0.7)
      trails.push({ id: 'punkty-krotka', name: 'Krótka pętla', kind: 'points', ...short })
  }

  const marked = pointsOnly
    ? (result[parkId] ?? []).filter((t) => t.kind === 'osm')
    : await markedTrails(parkId)
  for (const t of marked) trails.push({ ...t, kind: 'osm' })

  /*
   * Router padł = ZOSTAW stary wpis. Bieg --points przy zapchanym OSRM
   * potrafił wyzerować full/across/ring naraz i wtedy gałąź "else delete"
   * WYMAZYWAŁA miejsce z cache (straciły tak botaniczny, lotników i
   * bednarskiego, odtworzone potem z trails.ts). Brak odpowiedzi sieci to
   * nie jest brak tras.
   */
  if (pointsOnly && !full) {
    console.warn(`${parkId.padEnd(24)} router nie odpowiada, zostawiam stary wpis`)
    continue
  }

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
if (ringsOnly) {
  const targets = only.length ? only : Object.keys(result)
  for (const parkId of targets) {
    const list = result[parkId]
    const pois = quests[parkId]
    const feature = parksData.features.find((f) => f.id === parkId)
    if (!list || !pois?.length || !feature) continue
    if (RINGS[parkId]) continue // ręczna pętla ma pierwszeństwo nad zgadywaną
    const full = list.find((t) => t.id === 'punkty-wszystkie')
    if (!full) continue
    const start = pois[0].coords
    const fullBack = backtrack(full.line)
    const via = await compassVia(feature)
    if (!via) {
      console.log(`${parkId.padEnd(24)} brak punktów kierunkowych`)
      continue
    }
    const r = await ringThrough(start, pois, { via, stopWithin: 90 })
    const back = r ? backtrack(r.line) : 1
    const better = r && back < 0.4 && back < fullBack - 0.15 && r.m >= 800
    const without = list.filter((t) => t.id !== 'wokol')
    if (better) {
      const water = feature.properties?.kind === 'water'
      result[parkId] = [
        { id: 'wokol', name: water ? 'Pętla brzegiem' : 'Pętla po parku', kind: 'points', ...r },
        ...without,
      ]
    } else {
      result[parkId] = without
    }
    console.log(
      `${parkId.padEnd(24)} ${better ? 'WZIĘTE ' : 'odrzuc.'} ${String(r?.m ?? 0).padStart(5)} m  zawracanie ${String(
        Math.round(back * 100),
      ).padStart(3)}%  przez punkty ${String(Math.round(fullBack * 100)).padStart(3)}%  mija ${r?.stops.length ?? 0}`,
    )
    writeFileSync(CACHE, JSON.stringify(result), 'utf8')
  }
}

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
// kind 'points' = trasa policzona routerem pieszym przez punkty wyprawy.
//                 Zaczyna się przy pierwszym punkcie, BEZ parkingu: dojście
//                 z parkingu dokłada się ręcznie w kreatorze (decyzja Jarka).
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
