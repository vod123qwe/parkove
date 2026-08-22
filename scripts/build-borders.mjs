// Granice miejsc jako linie, z zaznaczeniem odcinków WSPÓLNYCH dla dwóch parków.
//
// Powód (Jarek, 2026-08-22): Zakrzówek i Skałki Twardowskiego stykają się długim
// bokiem. Rysowany z dwóch wielokątów ten bok dostaje dwie identyczne linie i
// czyta się mocniej niż granica zewnętrzna, jakby przecinał miejsce na pół.
// Wspólny odcinek ma być delikatniejszy: cieńszy i przerywany.
//
// Jak liczymy: dla każdej pary miejsc, których pudełka się zachodzą, sprawdzamy
// ODLEGŁOŚĆ odcinka od granicy sąsiada, a nie zgodność wierzchołków. Pierwsza
// wersja porównywała wierzchołki i nie znalazła nic między Zakrzówkiem i
// Skałkami Twardowskiego: te granice biegną razem, ale są rysowane innymi
// punktami. Odcinek jest wspólny, gdy jego ŚRODEK leży bliżej niż próg
// (domyślnie 12 m) od granicy drugiego miejsca, albo gdy oba końce leżą blisko.
// Środek jest tu ważny: Zakrzówek ma granicę rysowaną rzadko, jednym długim
// odcinkiem na tę samą stronę, i test po końcach go nie łapał, więc dashowała
// się tylko jedna strona, czyli nic nie było widać pod solidną linią sąsiada. Sąsiednie odcinki o tym samym
// statusie zszywamy w jedną linię, żeby nie robić tysiąca mikroskopijnych
// obiektów.
//
// WAŻNE: po każdej zmianie w parks.json przelicz to od nowa (`npm run borders`),
// bo mapa rysuje granice z tego pliku, a nie z wielokątów. Inaczej obrysy
// zostaną w miejscu, w którym były przed zmianą.
//
// Uruchomienie: npm run borders   (albo node scripts/build-borders.mjs)
// Wynik: src/app/data/borders.json

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const parks = JSON.parse(readFileSync(resolve(root, 'src/app/data/parks.json'), 'utf8'))
const TOL_M = 12

const R = 6371000
const rad = (d) => (d * Math.PI) / 180
function dist(a, b) {
  const dLat = rad(b[1] - a[1])
  const dLng = rad(b[0] - a[0])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/** metry lokalnie: na tej szerokości wystarcza płaskie przeliczenie */
function toM(pt, lat0) {
  return [pt[0] * 111320 * Math.cos(rad(lat0)), pt[1] * 110540]
}

/** odległość punktu od odcinka, w metrach */
function pointToSeg(p, a, b, lat0) {
  const P = toM(p, lat0)
  const A = toM(a, lat0)
  const B = toM(b, lat0)
  const vx = B[0] - A[0]
  const vy = B[1] - A[1]
  const wx = P[0] - A[0]
  const wy = P[1] - A[1]
  const len2 = vx * vx + vy * vy
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, (wx * vx + wy * vy) / len2))
  const dx = wx - t * vx
  const dy = wy - t * vy
  return Math.sqrt(dx * dx + dy * dy)
}

const ringsOf = (f) =>
  f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates.flat()

function bbox(f) {
  let x0 = 180
  let y0 = 90
  let x1 = -180
  let y1 = -90
  for (const ring of ringsOf(f))
    for (const c of ring) {
      if (c[0] < x0) x0 = c[0]
      if (c[0] > x1) x1 = c[0]
      if (c[1] < y0) y0 = c[1]
      if (c[1] > y1) y1 = c[1]
    }
  return [x0, y0, x1, y1]
}

/** pudełka blisko siebie: tylko takie pary warto sprawdzać odcinek po odcinku */
const near = (a, b, pad = 0.004) =>
  a[0] - pad <= b[2] && b[0] - pad <= a[2] && a[1] - pad <= b[3] && b[1] - pad <= a[3]

const features = parks.features
const boxes = new Map(features.map((f) => [f.id, bbox(f)]))

/** wszystkie odcinki wszystkich obrysów, z flagą wspólności */
const segs = new Map() // parkId -> Array<{a, b, shared}>
for (const f of features) {
  const list = []
  for (const ring of ringsOf(f))
    for (let i = 1; i < ring.length; i++) list.push({ a: ring[i - 1], b: ring[i], shared: false })
  segs.set(f.id, list)
}

let hits = 0
for (let i = 0; i < features.length; i++) {
  for (let j = i + 1; j < features.length; j++) {
    const A = features[i]
    const B = features[j]
    if (!near(boxes.get(A.id), boxes.get(B.id))) continue
    const sa = segs.get(A.id)
    const sb = segs.get(B.id)
    const lat0 = (boxes.get(A.id)[1] + boxes.get(A.id)[3]) / 2
    /** koniec odcinka leży na granicy drugiego miejsca */
    const onOther = (pt, other) =>
      other.some((q) => pointToSeg(pt, q.a, q.b, lat0) < TOL_M)
    const mid = (s) => [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2]
    const isShared = (s, other) =>
      onOther(mid(s), other) || (onOther(s.a, other) && onOther(s.b, other))
    for (const p of sa) {
      if (!p.shared && isShared(p, sb)) {
        p.shared = true
        hits++
      }
    }
    for (const q of sb) {
      if (!q.shared && isShared(q, sa)) {
        q.shared = true
        hits++
      }
    }
  }
}

/** zszyj sąsiadujące odcinki o tym samym statusie w jedną linię */
function stitch(list) {
  const out = []
  let run = null
  for (const s of list) {
    if (run && run.shared === s.shared && run.line[run.line.length - 1] === s.a) {
      run.line.push(s.b)
      continue
    }
    if (run) out.push(run)
    run = { shared: s.shared, line: [s.a, s.b] }
  }
  if (run) out.push(run)
  return out
}

const out = { type: 'FeatureCollection', generated: 'scripts/build-borders.mjs', features: [] }
let n = 0
for (const f of features) {
  for (const run of stitch(segs.get(f.id))) {
    out.features.push({
      type: 'Feature',
      id: n++,
      properties: { park: f.id, shared: run.shared ? 1 : 0 },
      geometry: { type: 'LineString', coordinates: run.line },
    })
  }
}

writeFileSync(resolve(root, 'src/app/data/borders.json'), JSON.stringify(out), 'utf8')
const sharedRuns = out.features.filter((f) => f.properties.shared).length
const withShared = [...new Set(out.features.filter((f) => f.properties.shared).map((f) => f.properties.park))]
console.log(`odcinków: ${out.features.length}, wspólnych ciągów: ${sharedRuns}, trafień: ${hits}`)
console.log('miejsca ze wspólną granicą:', withShared.join(', ') || 'brak')
