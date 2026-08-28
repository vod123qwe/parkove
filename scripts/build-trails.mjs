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

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
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
  /*
   * Wszystkie pliki questow, nie recznie wypisane dwa. Lista byla
   * zahardkodowana i trzeci plik (wyprawa Odeceixe) po prostu nie istnial
   * dla generatora: trasy sie nie liczyly, a skrypt konczyl sie sukcesem.
   */
  const files = readdirSync(resolve(root, 'src/app/data'))
    .filter((f) => /^quests.*\.ts$/.test(f))
    .map((f) => `src/app/data/${f}`)
  for (const file of files) {
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
    /* 1300 ms: bieg 2026-08-24 przy 900 ms skonczyl sie banem na routerze */
    await sleep(attempt * 1300)
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

/**
 * POKRYCIE: ile parku trasa naprawde pokazuje.
 *
 * Trzecia miara jakosci, obok zawracania i udzialu w obrysie, i az do
 * 2026-08-25 jej brakowalo. Bez niej generator nie wiedzial, ze trasa mija
 * 80% terenu: Jarek zobaczyl to golym okiem ("krotka sciezka, ktora idzie
 * prosto i omija 80% parku"), a pomiar to potwierdzil. Trasy liczone z
 * obrysu mialy 87 do 100% pokrycia, trasy przez punkty 12 do 43%.
 *
 * Metoda: siatka 30 m wewnatrz obrysu, komorka zaliczona, gdy trasa
 * przechodzi blizej niz 60 m (tyle widzisz w parku, nie wiecej).
 */
function coverage(feature, line) {
  const rs = feature.geometry.type === 'Polygon'
    ? feature.geometry.coordinates
    : feature.geometry.coordinates.flat()
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const ring of rs)
    for (const c of ring) {
      minX = Math.min(minX, c[0]); maxX = Math.max(maxX, c[0])
      minY = Math.min(minY, c[1]); maxY = Math.max(maxY, c[1])
    }
  const stepY = 30 / 111300
  const stepX = 30 / (111300 * Math.cos(rad((minY + maxY) / 2)))
  let cells = 0
  let seen = 0
  for (let y = minY; y <= maxY; y += stepY)
    for (let x = minX; x <= maxX; x += stepX) {
      if (!inPolygon([x, y], rs)) continue
      cells++
      for (const c of line)
        if (dist([x, y], c) < 60) { seen++; break }
    }
  return cells ? seen / cells : 1
}

/** udzial dlugosci trasy wewnatrz obrysu miejsca */
function insideShare(parkId, line) {
  const rs = ringsFor(parkId)
  if (!rs) return 1
  return line.filter((c) => inPolygon(c, rs)).length / line.length
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
 * OBWOD WEWNETRZNY: punkty kierunkowe z calego obrysu, cofniete do srodka.
 *
 * Rozni sie od compassVia jednym, ale decydujacym szczegolem. compassVia
 * bierze szesc kierunkow z centroidu, wiec w parku o pokrecony ksztalcie
 * wycina srodek. Tutaj idziemy PO OBRYSIE, co 120 m, wiec trasa musi objechac
 * miejsce dookola.
 *
 * Cofniecie o 35 m do wnetrza jest tu cala roznica i widac to w pomiarze.
 * Bez niego snap lapie CHODNIK ZA PLOTEM: Park Bednarskiego dostawal wtedy
 * trase o pokryciu 72%, z ktorej tylko 27% dlugosci leżalo w parku (kolko
 * ulicami wokol Krzemionek). Z cofnieciem: pokrycie 96%, w obrysie 100%,
 * czyli kolko alejkami w srodku, dokladnie to, o co prosil Jarek.
 *
 * Kandydat, ktorego snap wypadl poza obrysem, leci: sciezka poza parkiem nie
 * jest sciezka parku.
 */
async function perimeterVia(feature, parkId, step = 120, inset = 35, maxAway = 70) {
  const rs = ringsFor(parkId)
  const c = feature.properties?.center
  if (!rs || !c) return null
  const outer = rs.reduce((a, b) => (b.length > a.length ? b : a), rs[0])
  const pts = []
  let acc = step
  for (let i = 1; i < outer.length; i++) {
    acc += dist(outer[i - 1], outer[i])
    if (acc >= step) { pts.push(outer[i]); acc = 0 }
  }
  const via = []
  for (const pt of pts) {
    const d = Math.max(1, dist(pt, c))
    const k = Math.min(0.45, inset / d)
    const inner = [pt[0] + (c[0] - pt[0]) * k, pt[1] + (c[1] - pt[1]) * k]
    const snap = await snapToPath(inner)
    if (!snap || snap.away > maxAway) continue
    if (!inPolygon(snap.at, rs)) continue
    const last = via[via.length - 1]
    if (!last || dist(last, snap.at) > 60) via.push(snap.at)
  }
  return via.length >= 4 ? via : null
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
async function compassVia(feature, reach = 0.75) {
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
    const raw = [c[0] + (best[0] - c[0]) * reach, c[1] + (best[1] - c[1]) * reach]
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

/* ---------- landmarki: co w parku warto minac ---------- */

/*
 * Rzeczy, ktore trasa POWINNA minac, choc nie sa punktami wyprawy.
 *
 * Jarek o parku Jordana: "nie dodales tam np. tego stawu". I slusznie: staw
 * jest w parku, widac go z alejki, a w naszych danych nie istnial, wiec
 * router nie mial powodu tam skrecac. Punkty wyprawy to tresc gry, a landmarki
 * to KRAJOBRAZ: woda, punkt widokowy, plac zabaw. Bierzemy je z OSM, bo to
 * jedyne zrodlo, ktore je zna dla wszystkich 47 miejsc naraz.
 *
 * Uzycie: dodatkowy WARIANT duzej petli, ktory ma je na trasie. Nie
 * podmieniamy wariantu obwodowego, bo landmark w slepym zaulku wydluza trase
 * i podnosi zawracanie; niech oba stana obok siebie do przeklikania.
 */
async function landmarks(parkId) {
  const poly = polyFor(parkId)
  if (!poly) return []
  const q = `[out:json][timeout:25];
(
  way["natural"="water"](poly:"${poly}");
  relation["natural"="water"](poly:"${poly}");
  way["leisure"="pond"](poly:"${poly}");
  node["tourism"="viewpoint"](poly:"${poly}");
  way["leisure"="playground"](poly:"${poly}");
);
out center 40;`
  const data = await overpass(q)
  if (!data?.elements?.length) return []
  const rings = ringsFor(parkId)
  const out = []
  for (const el of data.elements) {
    const at = el.center ? [el.center.lon, el.center.lat] : el.lon != null ? [el.lon, el.lat] : null
    if (!at) continue
    if (rings && !inPolygon(at, rings)) continue
    const kind =
      el.tags?.natural === 'water' || el.tags?.leisure === 'pond'
        ? 'woda'
        : el.tags?.tourism === 'viewpoint'
          ? 'widok'
          : 'plac zabaw'
    /* jeden landmark na okolice: dwa stawy 30 m od siebie to jeden przystanek */
    if (out.some((o) => dist(o.at, at) < 90)) continue
    out.push({ at, kind, name: el.tags?.name ?? null })
  }
  return out
}

/** ile landmarkow trasa naprawde mija (blizej niz 80 m) */
function landmarksHit(line, marks) {
  let n = 0
  for (const m of marks) if (line.some((c) => dist(c, m.at) < 80)) n++
  return n
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

/*
 * Najkrotsza trasa, ktora chcemy pokazac.
 *
 * 600 -> 400 przy zmianie "bez parkingu" (2026-08-25). Prog 600 powstal
 * przeciw 200-metrowym przejsciom miedzy dwoma punktami. Po odcieciu dolotu
 * z parkingu uczciwa petla malego parku (Solvay, Mlynowka, Jalu Kurka) ma
 * 400-550 m i wypadala razem ze smieciami. 400 m to wciaz spacer, nie skok.
 *
 * UWAGA: ten prog musi byc JEDEN. Do 2026-08-25 istnialy dwa (600 przy
 * dodawaniu trasy, 400 przy koncowym czyszczeniu) i Park Bednarskiego wpadl
 * w szczeline: trasa 400-600 m nie zostala dodana, wiec nie bylo czego
 * zachowac.
 */
const MIN_M = 400

/*
 * TRASY ZAMOWIONE: policzone routerem przez podane wspolrzedne, W TEJ
 * KOLEJNOSCI (usluga route, nie trip, wiec nikt nam punktow nie przestawi).
 *
 * Po co: generator uklada trasy WEWNATRZ jednego miejsca, a czasem sens ma
 * droga MIEDZY miejscami. Przy wyprawie Odeceixe cala opowiesc to marsz
 * z wioski do oceanu, czyli z jednego miejsca do drugiego: bez tego trasa
 * po prostu nie moglaby powstac. Trzymamy je tutaj, a nie dopisujemy do
 * trails.ts po fakcie, zeby przezyly kazda regeneracje.
 */
const ORDERED = {
  'odeceixe-vila': [
    {
      id: 'do-morza',
      name: 'Do morza doliną',
      /*
       * Kolejnosc to kolejnosc OPOWIESCI, nie geograficzny skrot (mysl Jarka:
       * planujac szlak wiesz, co i gdzie mozesz dopowiedziec). Most daje nazwe
       * wsi i granice, kosciol i mlyn pokazuja zycie z ziemi, miradouro
       * odslania zamulona dolina, plaza jest puenta. Idzie sie jedna linia
       * w dol doliny, bez zawracania: okolo 5 km.
       */
      via: [
        [-8.76549, 37.43445], // most graniczny
        [-8.77097, 37.43237], // kosciol
        [-8.7718, 37.43118], // mlyn
        [-8.79831, 37.44079], // miradouro da maravilha
        [-8.79785, 37.44214], // plaza w ujsciu
      ],
    },
    {
      id: 'za-rzeke',
      /* prefiks „Spacer" to konwencja UI (TrailModal.shape): tak oznaczamy
         trasy tam i z powrotem, zeby opis mowil prawde o zawracaniu */
      name: 'Spacer za rzekę, do muszlowiska',
      /*
       * Muszlowisko lezy na DRUGIM brzegu Seixe, czyli juz w Alentejo, a most
       * EN 120 jest jedyna przeprawa. Zmierzone routerem: mlyn -> muszlowisko
       * to 3,1 km pieszo przy 1,0 km w linii prostej, i dokladnie tyle, ile
       * wynosi suma mlyn -> most -> muszlowisko. Dlatego prehistoria dostaje
       * WLASNA trase tam i z powrotem, zamiast psuc marsz do oceanu objazdem.
       */
      via: [
        [-8.76549, 37.43445], // most graniczny: start i meta
        [-8.78054, 37.43692], // muszlowisko, juz w Alentejo
        [-8.76549, 37.43445], // powrot ta sama droga
      ],
    },
  ],
}


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
  /*
   * TRZY ROLE, nie jedna "najlepsza trasa" (decyzja Jarka 2026-08-25).
   *
   * Powod jest zmierzony. Stary uklad wybieral trase porownawczo ("czy lepsza
   * niz tamta"), wiec dobre kolka wypadaly: Park Bednarskiego mial trase przez
   * punkty pokazujaca 43% terenu, a jego obejscie parku (96% terenu) bylo
   * odrzucane, bo zawracalo w 49%. Jarek: "jedna to powinna byc jakas fajna
   * petla pelna, inne jakies krotsze (...) czasem wiekszy obszar jest dobrze
   * przejsc i zobaczyc".
   *
   * Teraz kazde miejsce moze dostac do trzech tras, kazda odpowiada na inne
   * pytanie, i kazda ma WLASNE progi zamiast konkursu miedzy nimi:
   *
   *   1. duze kolko        - maksymalne POKRYCIE parku, cale w srodku,
   *   2. krotsza petla     - 40 do 65% dlugosci duzego, na godzine,
   *   3. trasa po punktach - mechanika gry, zawsze gdy przekroczy prog.
   *
   * Pokrycie (funkcja coverage) jest tu pierwsza miara jakosci. Zawracanie
   * zeszlo do roli nazwy: ponizej 40% mowimy "petla", wyzej "spacer", bo w
   * parku na zboczu kolko z odnogami to nadal dobra trasa.
   */
  const cov = (line) => (feature ? coverage(feature, line) : 0)
  const say = (label, r, extra = '') =>
    console.log(
      `  ${label}: ${
        r
          ? `${r.m} m, pokrycie ${Math.round(cov(r.line) * 100)}%, zawracanie ${Math.round(
              backtrack(r.line) * 100,
            )}%, w obrysie ${Math.round(insideShare(parkId, r.line) * 100)}%, mija ${r.stops.length}`
          : 'brak'
      }${extra}`,
    )

  /* ---------- kandydaci ---------- */
  const ring = RINGS[parkId]
  let handRing = null
  if (ring) {
    handRing = await ringThrough(start, pois, ring)
    say(ring.id, handRing)
  }

  const full = await loopThrough(start, pois)
  say('punkty-wszystkie', full)

  /*
   * Duze kolko: dwa zrodla punktow kierunkowych, bierzemy lepsze pokrycie.
   * Obwod wewnetrzny wygrywa w parkach o pokrecony ksztalcie, compassVia w
   * zwartych, gdzie szesc kierunkow wystarcza i jest taniej o kilka zapytan.
   */
  const marks = ring || !feature ? [] : await landmarks(parkId)
  if (marks.length) console.log(`  landmarki: ${marks.map((m) => m.name ?? m.kind).join(', ')}`)

  const bigCandidates = []
  if (!ring && feature) {
    const perim = await perimeterVia(feature, parkId)
    if (perim) {
      const r = await ringThrough(start, pois, { via: perim, stopWithin: 90 })
      if (r) {
        say('obwod', r)
        bigCandidates.push({ src: 'obwod', label: 'Obwodem', r })
      }
      /*
       * Wariant z landmarkami: te same punkty obwodu plus woda, widok i placyk
       * wpleciony w kolejnosc po najblizszym sasiedztwie. Robimy go tylko, gdy
       * obwod naprawde je mija (inaczej nie ma czego dokladac).
       */
      const missed = marks.filter((m) => !bigCandidates[0]?.r.line.some((c) => dist(c, m.at) < 80))
      if (missed.length) {
        const withMarks = []
        for (const v of perim) {
          withMarks.push(v)
          for (const m of missed)
            if (dist(v, m.at) < 320 && !withMarks.some((w) => dist(w, m.at) < 40)) {
              const snap = await snapToPath(m.at)
              if (snap && snap.away <= 90) withMarks.push(snap.at)
            }
        }
        if (withMarks.length > perim.length) {
          const r2 = await ringThrough(start, pois, { via: withMarks, stopWithin: 90 })
          if (r2) {
            say('obwod+landmarki', r2, `  (mija ${landmarksHit(r2.line, marks)} z ${marks.length})`)
            bigCandidates.push({ src: 'obwod+landmarki', label: 'Przez stawy i placyki', r: r2 })
          }
        }
      }
    }
    const compass = await compassVia(feature)
    if (compass) {
      const r = await ringThrough(start, pois, { via: compass, stopWithin: 90 })
      if (r) {
        say('kompas', r)
        bigCandidates.push({ src: 'kompas', label: 'Skrótem przez środek', r })
      }
    }
  }

  /* ---------- rola 1: duze kolko ---------- */
  const water = feature?.properties?.kind === 'water'
  let big = null
  if (handRing) {
    trails.push({
      id: ring.id,
      role: 'petla',
      variant: 'Brzegiem',
      name: ring.name,
      kind: 'points',
      cov: Math.round(cov(handRing.line) * 100),
      ...handRing,
    })
    big = handRing
  } else {
    const scored = bigCandidates
      .map((c) => ({
        ...c,
        cover: cov(c.r.line),
        back: backtrack(c.r.line),
        inside: insideShare(parkId, c.r.line),
      }))
      /*
       * Progi roli, nie konkursu. Pokrycie 40% to minimum, ktore odroznia
       * "obeszlismy park" od "przeszlismy skrajem"; obrys 60%, bo kolko po
       * parku ma byc w parku; zawracanie 65%, bo w parku na zboczu alejki sie
       * rozwidlaja i czesc drogi wraca sie ta sama (Bednarskiego ma 63%).
       */
      .filter((c) => c.cover >= 0.4 && c.inside >= 0.6 && c.back < 0.65 && c.r.m >= MIN_M)
      .sort((a, b) => b.cover - a.cover)
    /*
     * WARIANTY, nie jeden zwyciezca (Jarek: "jak mamy petle, to mozemy robic
     * warianty petli do wyboru, 2 albo 3, do przeklikania"). Bierzemy do
     * dwoch, i tylko jesli druga naprawde rozni sie od pierwszej: mniej niz
     * 12% roznicy dlugosci i podobny przebieg to ta sama trasa dwa razy.
     */
    const taken = []
    for (const c of scored) {
      if (taken.length >= 2) break
      const twin = taken.some(
        (t) => Math.abs(t.r.m - c.r.m) / Math.max(t.r.m, c.r.m) < 0.12 && Math.abs(t.cover - c.cover) < 0.08,
      )
      if (twin) continue
      taken.push(c)
    }
    for (const [i, pick] of taken.entries()) {
      const loopish = pick.back < 0.4
      trails.push({
        id: i === 0 ? 'petla-duza' : 'petla-duza-b',
        role: 'petla',
        variant: pick.label,
        name: water ? 'Pętla brzegiem' : loopish ? 'Pętla po parku' : 'Spacer po całym parku',
        kind: 'points',
        cov: Math.round(pick.cover * 100),
        marks: landmarksHit(pick.r.line, marks),
        ...pick.r,
      })
      if (i === 0) big = pick.r
      console.log(
        `  -> petla ${i + 1}: ${pick.src}, ${pick.r.m} m, pokrycie ${Math.round(pick.cover * 100)}%`,
      )
    }
    if (!taken.length && bigCandidates.length)
      console.log('  -> duze kolko: brak (zaden kandydat nie przeszedl progow roli)')
  }

  /* ---------- rola 2: krotsza petla ---------- */
  /*
   * Kolko wewnetrzne: te same kierunki, ale cofniete blizej srodka, wiec
   * wychodzi krotsza runda w sercu parku. Wchodzi tylko, gdy jest naprawde
   * krotsza od duzego (do 65% jego dlugosci) i wciaz pokazuje kawal terenu.
   */
  if (feature && big && big.m >= 1600) {
    const innerVia = await compassVia(feature, 0.42)
    if (innerVia) {
      const r = await ringThrough(start, pois, { via: innerVia, stopWithin: 90 })
      if (r) {
        const c2 = cov(r.line)
        const ok =
          r.m >= MIN_M &&
          r.m <= big.m * 0.65 &&
          c2 >= 0.3 &&
          backtrack(r.line) < 0.55 &&
          insideShare(parkId, r.line) >= 0.55
        say('kolko-male', r, ok ? '  <- wziete' : '  <- odrzucone')
        if (ok)
          trails.push({
            id: 'petla-mala',
            role: 'petla',
            variant: 'Krótsza runda',
            name: 'Krótsza pętla',
            kind: 'points',
            cov: Math.round(c2 * 100),
            ...r,
          })
      }
    }
  }

  /* ---------- rola 3: trasa po punktach ---------- */
  if (full && full.m >= MIN_M)
    trails.push({
      id: 'punkty-wszystkie',
      role: 'punkty',
      name: pois.length > 2 ? 'Pętla przez wszystkie punkty' : 'Trasa przez punkty',
      kind: 'points',
      cov: Math.round(cov(full.line) * 100),
      ...full,
    })

  /*
   * Przejscie wzdluz: dla miejsc liniowych (Mlynowka to dawny kanal) petli nie
   * ma i wlasciwa odpowiedzia jest przejscie od kranca do kranca. Wchodzi
   * tylko, gdy lista jest jeszcze krotka.
   */
  if (trails.filter((t) => t.kind === 'points').length < 3) {
    const across = await walkAcross(pois)
    if (across && across.m >= MIN_M) {
      const c3 = cov(across.line)
      if (c3 >= 0.25 && insideShare(parkId, across.line) >= 0.5) {
        trails.push({
          id: 'przez-park',
          role: 'przejscie',
          name: 'Przez cały park',
          kind: 'points',
          cov: Math.round(c3 * 100),
          ...across,
        })
        say('przez-park', across)
      }
    }
  }

  /*
   * Limit trzech tras liczonych (decyzja Jarka): wybor bez przewijania.
   * Priorytet: duze kolko, potem punkty, potem krotsza petla, potem przejscie.
   */
  const PRIORITY = [
    'wokol-wody',
    'petla-duza',
    'petla-duza-b',
    'punkty-wszystkie',
    'petla-mala',
    'przez-park',
    'punkty-krotka',
  ]
  /*
   * Trzy KATEGORIE (petla, punkty, przejscie), a nie trzy trasy: w kategorii
   * petla moga stac dwa warianty do przeklikania, wiec limit to 4 wiersze.
   */
  const pointTrails = trails
    .filter((t) => t.kind === 'points')
    .sort((a, b) => PRIORITY.indexOf(a.id) - PRIORITY.indexOf(b.id))
    .slice(0, 4)
  trails.length = 0
  trails.push(...pointTrails)


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
    // console.log, nie warn: wrapper czyta STDOUT i po warn uznawal bieg za udany
    console.log(`${parkId.padEnd(24)} router nie odpowiada, zostawiam stary wpis`)
    continue
  }

  /* trasy zamowione: liczymy je po wszystkim, zeby staly na poczatku listy */
  for (const spec of ORDERED[parkId] ?? []) {
    const r = await osrm('route', spec.via)
    if (!r) {
      console.log(`${parkId.padEnd(24)} zamowiona "${spec.id}": router nie odpowiada`)
      const kept = (result[parkId] ?? []).find((t) => t.id === spec.id)
      if (kept) trails.unshift(kept)
      continue
    }
    trails.unshift({
      id: spec.id,
      name: spec.name,
      kind: 'points',
      m: Math.round(r.trip.distance),
      min: Math.max(1, Math.round(r.trip.duration / 60)),
      line: thin(r.trip.geometry.coordinates),
    })
    console.log(`  zamowiona ${spec.id}: ${(r.trip.distance / 1000).toFixed(1)} km`)
  }

  if (trails.length) result[parkId] = trails
  else delete result[parkId]
  writeFileSync(CACHE, JSON.stringify(result), 'utf8')
  const sum = trails.map((t) => `${t.kind}:${(t.m / 1000).toFixed(1)}km`).join(' ')
  console.log(`${parkId.padEnd(24)} ${trails.length} ${sum}`)
}

/*
 * Progi na koniec, takze w trybie --prune: warianty policzone przy starszym
 * progu maja wypasc bez ponownego pytania sieci. Ten sam MIN_M, co wyzej.
 */
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
        if (t.cov != null) bits.push(`cov: ${t.cov}`)
        if (t.role) bits.push(`role: '${t.role}'`)
        if (t.variant) bits.push(`variant: '${esc(t.variant)}'`)
        if (t.marks) bits.push(`marks: ${t.marks}`)
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
  /**
   * ile procent parku trasa pokazuje: siatka 30 m w obrysie, komórka zaliczona,
   * gdy trasa przechodzi bliżej niż 60 m. Miara dodana, bo bez niej generator
   * nie wiedział, że trasa mija większość terenu (docs/trails.md).
   */
  cov?: number
  /** kategoria w wyborze ścieżek: pętla, punkty, przejście */
  role?: 'petla' | 'punkty' | 'przejscie'
  /** nazwa wariantu wewnątrz kategorii, do przeklikania */
  variant?: string
  /** ile landmarków (woda, widok, plac zabaw) trasa mija */
  marks?: number
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
