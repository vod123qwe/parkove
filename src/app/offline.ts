/*
 * Mapa na później: pobranie kafli przed wyprawą.
 *
 * Powód jest jeden i konkretny. Jarek, 2026-08-22: „dzisiaj testowałem apkę, ale
 * miałem problem z netem i nie mogłem z tego korzystać". W dolinkach zasięgu nie
 * ma i nie będzie, a service worker sam z siebie zapisuje tylko to, co już
 * zobaczyłeś. Czyli: żeby mieć mapę w dolinie, trzeba było wcześniej przejść tę
 * dolinę z zasięgiem. Bez sensu.
 *
 * Dlatego pobieranie jest **świadome**: wybierasz miejsce, apka liczy kafle,
 * mówi ile to megabajtów, i dopiero wtedy je ściąga. Nic nie dzieje się samo w
 * tle, bo dane komórkowe są jego, nie moje.
 *
 * Kafle lądują w OSOBNYM koszyku (`parkove-packs`), którego nikt nie przycina.
 * Zwykły cache kafelków ma limit 900 i wyrzuca najstarsze, więc pobrana dolina
 * wyparowałaby po jednym spacerze po Krakowie.
 */

import parksData from './data/parks.json'
import { questForPark } from './data/quests'

export const PACK_CACHE = 'parkove-packs-v1'

/** ile kafli naraz w powietrzu: dosc, zeby bylo szybko, nie dosc, zeby zdławić */
const LANES = 6

/**
 * Zakresy przybliżeń.
 *
 * Żywa mapa w miejscu chodzi między 14 a 17, i to jest rdzeń. 18 to opcja
 * „ostrzej": kafli jest cztery razy więcej, więc i megabajtów. Wyżej nie ma po
 * co, bo Geoportal kończy się na 19, a 19 dla całej doliny to setki megabajtów.
 */
const Z_MIN = 13
const Z_CORE = 17
const Z_SHARP = 18
/** rzeźba terenu: własne kafle, płaskie i lekkie, i kończą się na 15 */
const DEM_MIN = 10
const DEM_MAX = 15
/** budynki w odtwarzaniu 3D wchodzą od 14, więc tyle wystarczy */
const VEC_Z = 14

const ORTHO =
  'https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMTS/StandardResolution' +
  '?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTOFOTOMAPA&STYLE=default' +
  '&FORMAT=image/jpeg&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}'
const DEM = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
const VEC = 'https://tiles.openfreemap.org/planet/{z}/{x}/{y}.pbf'

type Box = { west: number; south: number; east: number; north: number }

/** ile stopnia dokłada margines wokół miejsca: dojście, parking, powrót */
const MARGIN = 0.004

function boxFor(parkId: string): Box | null {
  const f = (
    parksData as {
      features: Array<{ id: string; geometry: { type: string; coordinates: unknown } }>
    }
  ).features.find((x) => x.id === parkId)
  if (!f) return null
  let west = 180
  let east = -180
  let south = 90
  let north = -90
  /* geometria bywa Polygon albo MultiPolygon, wiec schodzimy do liczb */
  const walk = (node: unknown) => {
    if (!Array.isArray(node)) return
    if (typeof node[0] === 'number' && typeof node[1] === 'number') {
      const [lng, lat] = node as [number, number]
      west = Math.min(west, lng)
      east = Math.max(east, lng)
      south = Math.min(south, lat)
      north = Math.max(north, lat)
      return
    }
    for (const child of node) walk(child)
  }
  walk(f.geometry.coordinates as unknown[])
  if (west > east) return null
  return {
    west: west - MARGIN,
    south: south - MARGIN,
    east: east + MARGIN,
    north: north + MARGIN,
  }
}

const lonToX = (lng: number, z: number) => Math.floor(((lng + 180) / 360) * 2 ** z)
const latToY = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z)
}

function fill(tpl: string, z: number, x: number, y: number) {
  return tpl.replace('{z}', String(z)).replace('{x}', String(x)).replace('{y}', String(y))
}

/** jedna warstwa jednego zrodla: osobno, bo szacunek wagi musi byc wazony */
type Layer = { urls: string[] }

function layer(box: Box, tpl: string, z: number): Layer {
  const urls: string[] = []
  const x0 = lonToX(box.west, z)
  const x1 = lonToX(box.east, z)
  // szerokosc geograficzna rosnie w gore, a numer wiersza w dol
  const y0 = latToY(box.north, z)
  const y1 = latToY(box.south, z)
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) urls.push(fill(tpl, z, x, y))
  return { urls }
}

function layers(box: Box, tpl: string, zFrom: number, zTo: number) {
  const out: Layer[] = []
  for (let z = zFrom; z <= zTo; z++) out.push(layer(box, tpl, z))
  return out
}

/**
 * Wszystko, co jedno miejsce potrzebuje offline, rozbite na warstwy: tak liczymy
 * wagę, a potem spłaszczamy do pobrania. Zdjęcia punktów też wchodzą, bo to one
 * są treścią wspomnienia, a leżą u nas i ważą tyle co nic.
 */
export function packLayers(parkId: string, sharp: boolean): Layer[] {
  const box = boxFor(parkId)
  if (!box) return []
  const quest = questForPark(parkId)
  const photos = (quest?.pois ?? [])
    .filter((poi) => poi.photo)
    .map((poi) => new URL(poi.photo as string, location.href).toString())
  return [
    ...layers(box, ORTHO, Z_MIN, sharp ? Z_SHARP : Z_CORE),
    ...layers(box, DEM, DEM_MIN, DEM_MAX),
    ...layers(box, VEC, VEC_Z, VEC_Z),
    ...(photos.length ? [{ urls: photos }] : []),
  ]
}

export function packUrls(parkId: string, sharp: boolean) {
  return packLayers(parkId, sharp).flatMap((l) => l.urls)
}

export type PackInfo = { tiles: number; bytes: number; at: number; sharp: boolean }

const KEY = 'pk-packs'

export function packIndex(): Record<string, PackInfo> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, PackInfo>
  } catch {
    return {}
  }
}

export const hasPack = (parkId: string) => Boolean(packIndex()[parkId])

function writeIndex(next: Record<string, PackInfo>) {
  localStorage.setItem(KEY, JSON.stringify(next))
}

export const fmtMB = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1048576).toFixed(bytes > 10 * 1048576 ? 0 : 1).replace('.', ',')} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} kB`

/**
 * Ile to będzie ważyć.
 *
 * Nie z tabelki: ściągamy po dwa prawdziwe kafle z KAŻDEJ warstwy i mnożymy
 * przez liczbę kafli w tej warstwie. Ważenie po warstwach jest tu całą rzeczą:
 * pierwsza wersja próbkowała po płaskiej liście i pomyliła się prawie dwa razy
 * w dół, bo listę zdominowały setki lekkich kafli z niskich przybliżeń i kafle
 * rzeźby, a wagę robi jedno, najgęstsze przybliżenie.
 *
 * Próbka jest z środka warstwy i z jej brzegu, bo zdjęcie lotnicze lasu waży
 * inaczej niż zdjęcie pola, a brzeg doliny to zwykle pole.
 */
export async function estimatePack(parkId: string, sharp: boolean) {
  const groups = packLayers(parkId, sharp)
  let total = 0
  let bytes = 0
  await Promise.all(
    groups.map(async (g) => {
      total += g.urls.length
      if (g.urls.length === 0) return
      const pick = [Math.floor(g.urls.length / 2), Math.floor(g.urls.length / 5)]
        .map((i) => g.urls[i])
        .filter((v, i, a) => Boolean(v) && a.indexOf(v) === i)
      let sum = 0
      let got = 0
      await Promise.all(
        pick.map(async (u) => {
          try {
            const res = await fetch(u, { cache: 'force-cache' })
            sum += (await res.arrayBuffer()).byteLength
            got++
          } catch {
            // jeden nieudany kafel nie psuje szacunku calej warstwy
          }
        }),
      )
      bytes += (got > 0 ? sum / got : 18000) * g.urls.length
    }),
  )
  return { tiles: total, bytes: Math.round(bytes) }
}

export type PackProgress = { done: number; total: number; bytes: number }

/**
 * Pobranie. Piszemy prosto do Cache Storage ze strony, bez rozmowy z service
 * workerem: przeglądarka na to pozwala, a jeden mechanizm mniej to jedno
 * miejsce mniej, w którym coś się rozjedzie. Serwisy dają nagłówki CORS
 * (sprawdzone), więc odpowiedzi są zwykłe, nie nieprzejrzyste.
 */
export async function downloadPack(
  parkId: string,
  sharp: boolean,
  onProgress: (p: PackProgress) => void,
  signal?: AbortSignal,
) {
  // poproś o trwałość, bo bez tego system może to sprzątnąć, gdy zabraknie miejsca
  try {
    await navigator.storage?.persist?.()
  } catch {
    // przeglądarka bez tego API po prostu nie obiecuje nic
  }
  const urls = packUrls(parkId, sharp)
  const cache = await caches.open(PACK_CACHE)
  let done = 0
  let bytes = 0
  let failed = 0
  let next = 0
  const lane = async () => {
    while (next < urls.length) {
      if (signal?.aborted) return
      const url = urls[next++]
      try {
        const hit = await cache.match(url)
        if (hit) {
          bytes += (await hit.clone().arrayBuffer()).byteLength
        } else {
          const res = await fetch(url, { signal })
          if (res.ok) {
            const buf = await res.clone().arrayBuffer()
            bytes += buf.byteLength
            await cache.put(url, res)
          } else failed++
        }
      } catch {
        failed++
      }
      done++
      // raportuj co kilka kafli, a nie co jeden: 800 rerenderow nikomu nie sluzy
      if (done % 8 === 0 || done === urls.length) onProgress({ done, total: urls.length, bytes })
    }
  }
  await Promise.all(Array.from({ length: LANES }, lane))
  if (signal?.aborted) return { tiles: done, bytes, failed, aborted: true }
  const info: PackInfo = { tiles: done - failed, bytes, at: Date.now(), sharp }
  writeIndex({ ...packIndex(), [parkId]: info })
  return { ...info, failed, aborted: false }
}

export async function dropPack(parkId: string) {
  const cache = await caches.open(PACK_CACHE)
  // usuwamy tylko to, co nalezy do tego miejsca, i w obu wariantach ostrosci
  const urls = new Set([...packUrls(parkId, true), ...packUrls(parkId, false)])
  await Promise.all([...urls].map((u) => cache.delete(u)))
  const index = packIndex()
  delete index[parkId]
  writeIndex(index)
}
