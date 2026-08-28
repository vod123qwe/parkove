// Wyprawa tymczasowa: Odeceixe, Costa Vicentina (Portugalia).
//
// Dlaczego osobny skrypt, a nie wpis w fetch-parks.mjs: tamten generator
// odpytuje Overpass o kuratorowana liste krakowska i nadpisuje parks.json w
// calosci, wiec recznie dopisane miejsce zniknieloby przy pierwszej
// regeneracji. Tu dokladamy featury po fakcie, idempotentnie, tak jak kiedys
// robil to poligon testowy przy ulicy Piltza.
//
//   npm run trip:odeceixe          dodaje albo odswieza wyprawe
//   npm run trip:odeceixe -- --remove   usuwa ja w calosci
//
// Geometria: miejsca nie sa parkami z granicami w OSM, tylko wsia i ujsciem
// rzeki, wiec obszar liczymy jako kolo obejmujace wszystkie punkty wyprawy
// plus zapas. Ten sam trik co przy kopcach w Krakowie.
//
// Wspolrzedne punktow pochodza ze skanu Overpass z 2026-08-28 (wezly OSM),
// nie z oka. Zrodla faktow siedza przy tresci, w quests-odeceixe.ts.

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PARKS = resolve(root, 'src/app/data/parks.json')

/** znacznik calej wyprawy: po nim kasujemy i po nim filtruja liczniki Krakowa */
const TRIP = 'costa-vicentina'

/** punkty, ktore obszar ma objac (te same wspolrzedne co w questach) */
const PLACES = [
  {
    id: 'odeceixe-vila',
    name: 'Odeceixe',
    kind: 'village',
    points: [
      [-8.7718, 37.43118], // moinho
      [-8.77097, 37.43237], // igreja matriz
      [-8.78054, 37.43692], // concheiro de montes de baixo
      [-8.76549, 37.43445], // most EN 120 nad Ribeira de Seixe
    ],
  },
  {
    id: 'odeceixe-foz',
    name: 'Ujście Seixe',
    kind: 'water',
    points: [
      [-8.79831, 37.44079], // miradouro da maravilha
      [-8.79785, 37.44214], // praia de odeceixe-mar
      [-8.80054, 37.43918], // praia das adegas
    ],
  },
]

const R_EARTH = 6371000
const toRad = (d) => (d * Math.PI) / 180

function metersBetween(a, b) {
  const dLat = toRad(b[1] - a[1])
  const dLon = toRad(b[0] - a[0])
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2
  return R_EARTH * 2 * Math.asin(Math.sqrt(s))
}

/** kolo jako wielokat: 28 wierzcholkow wystarcza, zeby granica nie byla kanciasta */
function circle(center, radiusM, steps = 28) {
  const ring = []
  const latM = 111320
  const lonM = 111320 * Math.cos(toRad(center[1]))
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    ring.push([
      Number((center[0] + ((radiusM * Math.cos(a)) / lonM)).toFixed(6)),
      Number((center[1] + ((radiusM * Math.sin(a)) / latM)).toFixed(6)),
    ])
  }
  return [ring]
}

const data = JSON.parse(readFileSync(PARKS, 'utf8'))
const before = data.features.length
data.features = data.features.filter((f) => f.properties?.trip !== TRIP)
const removed = before - data.features.length

if (process.argv.includes('--remove')) {
  writeFileSync(PARKS, JSON.stringify(data, null, 2) + '\n')
  console.log(`usunieto ${removed} miejsc wyprawy, zostaje ${data.features.length}`)
  process.exit(0)
}

for (const place of PLACES) {
  const center = [
    place.points.reduce((s, p) => s + p[0], 0) / place.points.length,
    place.points.reduce((s, p) => s + p[1], 0) / place.points.length,
  ]
  /* promien: najdalszy punkt plus zapas, zeby nikt nie stal tuz za granica */
  const reach = Math.max(...place.points.map((p) => metersBetween(center, p)))
  const radius = Math.round(reach + 180)
  const areaHa = Number((((Math.PI * radius * radius) / 10000)).toFixed(1))
  data.features.push({
    type: 'Feature',
    id: place.id,
    properties: {
      id: place.id,
      name: place.name,
      kind: place.kind,
      areaHa,
      center: [Number(center[0].toFixed(6)), Number(center[1].toFixed(6))],
      /* znacznik wyprawy: liczniki Krakowa pomijaja te miejsca, reszta
         mechaniki (check-in, slad, punkty, pieczatka) dziala normalnie */
      trip: TRIP,
    },
    geometry: { type: 'Polygon', coordinates: circle(center, radius) },
  })
  console.log(
    `${place.id}: promien ${radius} m, ${areaHa} ha, srodek ${center.map((n) => n.toFixed(5)).join(', ')}`,
  )
}

writeFileSync(PARKS, JSON.stringify(data, null, 2) + '\n')
console.log(`gotowe: ${data.features.length} miejsc w pliku (bylo ${before})`)
