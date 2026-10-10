// Duże place zabaw jako OSOBNE MIEJSCA w apce.
//
// Jarek (2026-10-10): „przejdź przez bazę wszystkich placów zabaw w Krakowie
// i dopisz". Decyzje z tej samej rozmowy: osobny rodzaj miejsca
// (`kind: 'playground'`, `group: 'place'`), BEZ pieczątki i bez wliczania do
// kolekcji Krakowa; wszystkie od 1500 m²; opis TYLKO z faktów; zdjęcie tylko
// gdy Commons ma na pewno ten plac (osobny skrypt), inaczej ikona i zaproszenie
// do zrobienia zdjęcia w apce.
//
// Co tu powstaje:
//   1. featury w src/app/data/parks.json: obrys placu z OSM, środek, metraż,
//      nazwa (z OSM, a gdy jej nie ma: z osiedla i ulicy przez Nominatim),
//      fakty w `properties.playground`;
//   2. src/app/data/playground-info.json: krótkie opisy złożone z tych faktów,
//      w tym samym kształcie co PARK_INFO, żeby karta miejsca nie potrzebowała
//      osobnej ścieżki.
//
// Place leżące PRZY naszych parkach (w obrysie albo do 120 m od krawędzi)
// nie stają się osobnymi miejscami: są już w karcie parku przez
// build-playgrounds.mjs i filtr „Duży plac zabaw" pokazuje wtedy park.
//
// Idempotentne: usuwa poprzednie featury `kind: 'playground'` i dokłada od
// nowa. fetch-parks.mjs nadpisuje parks.json w całości, więc po nim trzeba
// ten skrypt uruchomić ponownie (tak samo jak add-places.mjs).
//
// Uruchomienie: npm run playgrounds:places
// Czas: około 3 minuty (Nominatim, jeden adres na sekundę).

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PARKS = resolve(root, 'src/app/data/parks.json')
const ASSIGNED = resolve(root, 'src/app/data/playgrounds.json')
const INFO = resolve(root, 'src/app/data/playground-info.json')
const CACHE = resolve(root, '.cache-playground-addr.json')

const BIG_M2 = 1500
const HUGE_M2 = 3000
/* granice administracyjne Krakowa, w przybliżeniu */
const BBOX = '49.967,19.792,50.126,20.217'
const UA = { 'User-Agent': 'Parkove/0.4 (personal Krakow parks project)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function overpass(q) {
  for (const host of [
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ]) {
    for (let a = 1; a <= 2; a++) {
      await sleep(a * 1500)
      try {
        const r = await fetch(host, {
          method: 'POST',
          headers: { ...UA, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'data=' + encodeURIComponent(q),
        })
        const t = await r.text()
        if (!r.ok || t.trim().startsWith('<')) continue
        return JSON.parse(t)
      } catch {
        /* następny serwer */
      }
    }
  }
  return null
}

/* ---- geometria ---- */
const toM = (lat0) => {
  const kx = 111320 * Math.cos((lat0 * Math.PI) / 180)
  return (p) => [p[0] * kx, p[1] * 111320]
}
const ringArea = (ring, m) => {
  let a = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = m(ring[i])
    const [x2, y2] = m(ring[i + 1])
    a += x1 * y2 - x2 * y1
  }
  return Math.abs(a / 2)
}
const centroid = (ring) => {
  let x = 0
  let y = 0
  const n = ring.length - 1
  for (let i = 0; i < n; i++) {
    x += ring[i][0]
    y += ring[i][1]
  }
  return [x / n, y / n]
}

/* ---- słownik faktów z OSM na polski ---- */
const EQUIPMENT = {
  slide: 'zjeżdżalnia',
  swing: 'huśtawki',
  sandpit: 'piaskownica',
  climbingframe: 'drabinki',
  seesaw: 'huśtawka wagowa',
  springy: 'bujaki',
  playhouse: 'domek',
  roundabout: 'karuzela',
  zipwire: 'tyrolka',
  basketswing: 'huśtawka bocianie gniazdo',
  trampoline: 'trampolina',
  climbingwall: 'ścianka wspinaczkowa',
  balancebeam: 'równoważnia',
  tunnel: 'tunel',
  water: 'zabawy z wodą',
  structure: 'zestaw zabawowy',
  chain_ladder: 'drabinka linowa',
  horizontal_bar: 'drążek',
  basketball_backboards: 'kosz do koszykówki',
  table_tennis: 'stół do ping-ponga',
  sledging: 'górka saneczkowa',
  map: 'tablica',
}
const SURFACE = {
  rubber: 'nawierzchnia gumowa',
  tartan: 'nawierzchnia tartanowa',
  sand: 'piasek',
  grass: 'trawa',
  woodchips: 'zrębki',
  pebblestone: 'żwirek',
  fine_gravel: 'żwirek',
  gravel: 'żwir',
  artificial_turf: 'sztuczna trawa',
  paving_stones: 'kostka',
  asphalt: 'asfalt',
}

/* „plac zabaw przy Lubostroniu": dopełniacz robi Nominatim, my tylko składamy */
const streetPhrase = (road) => (road ? `przy ul. ${road.replace(/^(ulica|ul\.)\s+/i, '')}` : null)
const hoodPhrase = (hood) => {
  if (!hood) return null
  if (/^os(iedle|\.)\s/i.test(hood)) return `na ${hood.replace(/^Osiedle\s/i, 'os. ')}`
  return `w rejonie ${hood}`
}

const plAry = (n) =>
  n === 1 ? 'ar' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'ary' : 'arów'

/* ---- dane wejściowe ---- */
const parksFile = JSON.parse(readFileSync(PARKS, 'utf8'))
const before = parksFile.features.length
const assigned = existsSync(ASSIGNED) ? JSON.parse(readFileSync(ASSIGNED, 'utf8')) : { parks: {} }
/* place już przypisane do parków: po współrzędnych, bo OSM id tam nie ma */
const assignedKeys = new Set()
for (const v of Object.values(assigned.parks ?? {})) for (const it of v.items ?? []) assignedKeys.add(it.c.join(','))

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {}

console.log('pobieram place zabaw z OSM…')
const data = await overpass(`[out:json][timeout:240];nwr[leisure=playground](${BBOX});out geom;`)
if (!data) {
  console.error('Overpass nie odpowiedział, parks.json nietknięty')
  process.exit(1)
}

const candidates = []
for (const el of data.elements ?? []) {
  const t = el.tags ?? {}
  let ring = null
  if (el.type === 'way' && el.geometry?.length > 3) ring = el.geometry.map((p) => [p.lon, p.lat])
  if (el.type === 'relation') {
    let best = null
    for (const mb of el.members ?? []) {
      if (mb.role === 'inner' || !mb.geometry) continue
      if (!best || mb.geometry.length > best.length) best = mb.geometry
    }
    if (best?.length > 3) ring = best.map((p) => [p.lon, p.lat])
  }
  /* plac bez obrysu nie ma rozmiaru, więc nie może być „dużym placem" */
  if (!ring) continue
  if (ring[0][0] !== ring.at(-1)[0] || ring[0][1] !== ring.at(-1)[1]) ring.push(ring[0])
  const c = centroid(ring)
  const m2 = Math.round(ringArea(ring, toM(c[1])))
  if (m2 < BIG_M2) continue
  const key = [+c[0].toFixed(5), +c[1].toFixed(5)].join(',')
  if (assignedKeys.has(key)) continue
  /* szkoły i przedszkola: plac za płotem to nie miejsce na wyprawę */
  if (t.access === 'private' || t.access === 'no' || t.access === 'customers') continue
  candidates.push({ el, t, ring, c, m2 })
}
candidates.sort((a, b) => b.m2 - a.m2)
console.log(`placów >= ${BIG_M2} m² poza naszymi parkami, ogólnodostępnych: ${candidates.length}`)

/* ---- adresy (Nominatim, z pamięcią podręczną w repo, bez commitowania) ---- */
async function address(c) {
  const key = c.map((n) => n.toFixed(5)).join(',')
  if (cache[key]) return cache[key]
  await sleep(1100)
  try {
    const u = new URL('https://nominatim.openstreetmap.org/reverse')
    u.search = new URLSearchParams({ format: 'jsonv2', lat: String(c[1]), lon: String(c[0]), zoom: '17', 'accept-language': 'pl' }).toString()
    const d = await (await fetch(u, { headers: UA })).json()
    const a = d.address ?? {}
    cache[key] = {
      road: a.road ?? a.pedestrian ?? null,
      hood: a.neighbourhood ?? a.quarter ?? a.suburb ?? null,
      district: a.city_district ?? a.suburb ?? null,
    }
  } catch {
    cache[key] = { road: null, hood: null, district: null }
  }
  return cache[key]
}

/* ---- składanie miejsc ---- */
const features = []
const info = {}
const usedNames = new Map()
let i = 0
for (const cand of candidates) {
  i++
  const { el, t, ring, c, m2 } = cand
  const addr = await address(c)
  if (i % 10 === 0) {
    writeFileSync(CACHE, JSON.stringify(cache))
    console.log(`  ${i}/${candidates.length}`)
  }
  const id = `plac-${el.type === 'relation' ? 'r' : 'w'}${el.id}`

  /* nazwa: własna z OSM, inaczej po ulicy, a bez ulicy po osiedlu */
  let name = t.name
  if (!name) {
    const where = streetPhrase(addr.road) ?? hoodPhrase(addr.hood)
    name = where ? `Plac zabaw ${where}` : `Plac zabaw ${el.id}`
  }
  /* dwa place przy tej samej ulicy dostają numer, żeby lista ich nie myliła */
  const n = (usedNames.get(name) ?? 0) + 1
  usedNames.set(name, n)
  if (n > 1) name = `${name} (${n})`

  const equipment = Object.keys(t)
    .filter((k) => k.startsWith('playground:') && t[k] !== 'no')
    .map((k) => EQUIPMENT[k.slice('playground:'.length)])
    .filter(Boolean)
  const surface = SURFACE[t.surface] ?? null
  const fenced = t.barrier === 'fence' || t.fenced === 'yes' ? true : null
  const hours = t.opening_hours ?? null
  const fee = t.fee === 'yes' ? 'płatny' : t.fee === 'no' ? 'bezpłatny' : null
  const operator = t.operator ?? null
  const lit = t.lit === 'yes' ? true : null
  const ary = Math.round(m2 / 100)

  /* opis TYLKO z faktów: jedno zdanie o miejscu i rozmiarze, reszta gdy jest */
  const where = [hoodPhrase(addr.hood), streetPhrase(addr.road)].filter(Boolean).join(', ')
  const para1 = `Plac zabaw o powierzchni około ${ary} ${plAry(ary)}${where ? ` ${where}` : ''}${m2 >= HUGE_M2 ? ', jeden z największych w Krakowie' : ''}.`
  const bits = []
  if (equipment.length) bits.push(`Na placu: ${equipment.join(', ')}.`)
  if (surface) bits.push(`Pod stopami ${surface}.`)
  if (fenced) bits.push('Teren ogrodzony.')
  if (lit) bits.push('Oświetlony po zmroku.')
  if (hours) bits.push(`Czynny: ${hours}.`)
  if (fee) bits.push(`Wstęp ${fee}.`)
  if (operator) bits.push(`Prowadzi: ${operator}.`)
  const description = [para1]
  if (bits.length) description.push(bits.join(' '))
  description.push(
    'Rozmiar policzony z obrysu w OpenStreetMap. Opis to tylko to, co mapa wie na pewno; zdjęcie i resztę dopisze pierwsza wizyta.',
  )

  features.push({
    type: 'Feature',
    id,
    properties: {
      id,
      name,
      kind: 'playground',
      group: 'place',
      areaHa: +(m2 / 10000).toFixed(2),
      center: [+c[0].toFixed(6), +c[1].toFixed(6)],
      playground: {
        m2,
        osm: `${el.type}/${el.id}`,
        ...(equipment.length ? { equipment } : {}),
        ...(surface ? { surface } : {}),
        ...(fenced ? { fenced } : {}),
        ...(hours ? { hours } : {}),
        ...(fee ? { fee } : {}),
        ...(operator ? { operator } : {}),
        ...(addr.hood ? { hood: addr.hood } : {}),
        ...(addr.road ? { road: addr.road } : {}),
      },
    },
    geometry: { type: 'Polygon', coordinates: [ring.map((p) => [+p[0].toFixed(6), +p[1].toFixed(6)])] },
  })
  info[id] = {
    description,
    amenities: { playground: { has: true, note: `${ary} ${plAry(ary)}` }, verified: false },
  }
}
writeFileSync(CACHE, JSON.stringify(cache))

/* ---- zapis: stare place precz, nowe na koniec ---- */
parksFile.features = parksFile.features.filter((f) => f.properties?.kind !== 'playground')
const kept = parksFile.features.length
parksFile.features.push(...features)
writeFileSync(PARKS, JSON.stringify(parksFile, null, 2) + '\n')
writeFileSync(INFO, JSON.stringify(info, null, 2) + '\n')

console.log(`\nparks.json: ${kept} miejsc bez placów (było ${before}) + ${features.length} placów = ${parksFile.features.length}`)
console.log(`playground-info.json: ${Object.keys(info).length} opisów`)
console.log(`z nazwą własną z OSM: ${features.filter((f) => !f.properties.name.startsWith('Plac zabaw')).length}, ze sprzętem: ${features.filter((f) => f.properties.playground.equipment).length}`)
console.log('\nprzykłady:')
for (const f of features.slice(0, 8)) console.log(`  ${String(f.properties.playground.m2).padStart(5)} m²  ${f.properties.name}`)
