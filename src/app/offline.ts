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

/**
 * Ile kafli naraz w powietrzu.
 *
 * Zmierzone na 48 kaflach: przy 6 watkach 11 ms na kafel, przy 16 juz 7 ms, a
 * przy 32 nic sie nie poprawia. To praca ograniczona OPOZNIENIEM, nie pasmem,
 * wiec liczy sie liczba zapytan w powietrzu, a nie szerokosc lacza. 12 to
 * kompromis: prawie cale przyspieszenie, a przegladarki i tak trzymaja okolo
 * szesciu polaczen na host przy HTTP/1.1.
 */
const LANES = 12
/** znacznik, po ktorym service worker przepuszcza kafel bez wlasnego cache */
const PASS = 'pkpack=1'

/**
 * Zakresy przybliżeń.
 *
 * Żywa mapa w miejscu chodzi między 14 a 17, i to jest rdzeń. 18 to opcja
 * „ostrzej": kafli jest cztery razy więcej, więc i megabajtów. Wyżej nie ma po
 * co, bo zdjęcie kończy się na 19, a 19 dla całej doliny to setki megabajtów.
 */
const Z_MIN = 13
const Z_CORE = 17
const Z_SHARP = 18
/** rzeźba terenu: własne kafle, płaskie i lekkie, i kończą się na 15 */
const DEM_MIN = 10
const DEM_MAX = 15
/** budynki w odtwarzaniu 3D wchodzą od 14, więc tyle wystarczy */
const VEC_Z = 14

const SAT =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
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
    ...layers(box, SAT, Z_MIN, sharp ? Z_SHARP : Z_CORE),
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
  const total = groups.reduce((n, g) => n + g.urls.length, 0)

  /*
   * Probki wszystkich warstw w JEDNEJ kolejce, po kilka naraz, a nie wszystkie
   * naraz. Roznica jest zmierzona i byla duza.
   *
   * Poprzednia wersja pytala o probki kazdej warstwy rownolegle, czyli przy
   * trzynastu warstwach do pieciudziesieciu kafli w jednej chwili. Czesc
   * odpowiedzi wracala wtedy KROTKA (status 200, cialo mniejsze niz kafel), a
   * poniewaz kazde cialo szlo do sredniej, szacunek zjezdzal w dol. Zmierzone na
   * zalewie: 1,08 MB z rownoleglej probki, 1,78 MB naprawde, i 1,81 MB z tej
   * samej probki pobranej spokojnie. Blad zszedl z 39% do 2%.
   *
   * Dodatkowo nie liczymy odpowiedzi nie-OK ani pustych. Kafel wazy dziesiatki
   * kilobajtow, wiec zero w sredniej to zawsze pomylka, nigdy pomiar.
   */
  const jobs: { layer: number; url: string }[] = []
  const seen = new Set<string>()
  groups.forEach((g, i) => {
    for (const f of [1 / 8, 3 / 8, 5 / 8, 7 / 8]) {
      const url = g.urls[Math.floor(g.urls.length * f)]
      if (!url || seen.has(url)) continue
      seen.add(url)
      jobs.push({ layer: i, url })
    }
  })

  const per = groups.map(() => ({ sum: 0, got: 0 }))
  let next = 0
  const lane = async () => {
    while (next < jobs.length) {
      const job = jobs[next++]
      try {
        const res = await fetch(job.url, { cache: 'force-cache' })
        if (!res.ok) continue
        const len = (await res.arrayBuffer()).byteLength
        if (len <= 0) continue
        per[job.layer].sum += len
        per[job.layer].got++
      } catch {
        // jeden nieudany kafel nie psuje szacunku calej warstwy
      }
    }
  }
  await Promise.all(Array.from({ length: 3 }, lane))

  let bytes = 0
  groups.forEach((g, i) => {
    const { sum, got } = per[i]
    bytes += (got > 0 ? sum / got : 18000) * g.urls.length
  })
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
          // waga z naglowka, bez czytania ciala: przy 1300 kaflach kazdy odczyt
          // to zbedna praca dysku i pamieci
          bytes += Number(hit.headers.get('content-length') ?? 0)
        } else {
          const res = await fetch(url + (url.includes('?') ? '&' : '?') + PASS, { signal })
          if (res.ok) {
            const len = Number(res.headers.get('content-length') ?? 0)
            if (len > 0) {
              bytes += len
              // zapisujemy pod CZYSTYM adresem, bo pod takim mapa potem pyta
              await cache.put(url, res)
            } else {
              const copy = res.clone()
              bytes += (await res.arrayBuffer()).byteLength
              await cache.put(url, copy)
            }
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

/**
 * Czy paczka NAPRAWDĘ jeszcze jest.
 *
 * Spis pobranych miejsc leży w pamięci ustawień, a kafle w koszyku przeglądarki,
 * i to są dwa osobne magazyny. System może wyczyścić dane strony, gdy zabraknie
 * miejsca na telefonie, i wtedy spis dalej twierdzi „mapa działa offline", a
 * kafli już nie ma. To najgorszy możliwy rodzaj awarii: dowiadujesz się o niej w
 * dolinie, bez zasięgu, ufając odznaczce.
 *
 * Dlatego przy każdym wejściu do karty sprawdzamy trzy kafle z paczki. Trzy, bo
 * czyszczenie danych strony jest wszystko-albo-nic: nie zdarza się, żeby zniknął
 * co drugi kafel. Gdy ich nie ma, spis się poprawia sam i wiersz znów proponuje
 * pobranie.
 */
export async function verifyPack(parkId: string) {
  const info = packIndex()[parkId]
  if (!info) return false
  const urls = packUrls(parkId, info.sharp)
  if (urls.length === 0) return false
  const cache = await caches.open(PACK_CACHE)
  const probe = [0, Math.floor(urls.length / 2), urls.length - 1].map((i) => urls[i])
  for (const u of probe) {
    if (await cache.match(u)) continue
    const index = packIndex()
    delete index[parkId]
    writeIndex(index)
    return false
  }
  return true
}

/**
 * Ile tego wszystkiego jest i czy przeglądarka obiecuje to trzymać.
 *
 * `persisted` to jedyna szczera odpowiedź na pytanie „czy to zniknie": prosimy o
 * trwałość przy każdym pobraniu, ale przeglądarka nie musi jej dać i często nie
 * daje. Bez niej dane strony są **usuwalne**, gdy telefonowi zabraknie miejsca.
 */
export async function storageReport() {
  const index = packIndex()
  const places = Object.keys(index)
  let persisted = false
  try {
    persisted = (await navigator.storage?.persisted?.()) ?? false
  } catch {
    // przegladarka bez tego API nie obiecuje nic i tak
  }
  let usage: number | null = null
  let quota: number | null = null
  try {
    const e = await navigator.storage?.estimate?.()
    usage = e?.usage ?? null
    quota = e?.quota ?? null
  } catch {
    // to samo: brak liczb nie jest bledem, po prostu nie wiemy
  }
  return {
    places: places.length,
    tiles: places.reduce((n, id) => n + index[id].tiles, 0),
    bytes: places.reduce((n, id) => n + index[id].bytes, 0),
    persisted,
    usage,
    quota,
  }
}

/** wszystkie paczki naraz: jeden przycisk, gdy telefon zaczyna prosic o miejsce */
export async function dropAllPacks() {
  await caches.delete(PACK_CACHE)
  localStorage.removeItem(KEY)
}

/*
 * Pobieranie żyje w MODULE, nie w komponencie, i to nie jest szczegół
 * architektury, tylko naprawa kłamstwa.
 *
 * Wiersz w karcie miejsca pisał „możesz zamknąć kartę, pobieranie idzie dalej",
 * a stan siedział w tym wierszu i sprzątanie po odmontowaniu przerywało
 * pobieranie. Czyli komunikat obiecywał dokładnie to, czego kod nie robił.
 *
 * Teraz zadanie jest jedno na całą aplikację (bo i tak nie ma sensu ciągnąć
 * dwóch dolin naraz przez to samo łącze), przeżywa zamknięcie każdego widoku, a
 * pasek u góry ekranu pokazuje, na czym stoi.
 */
export type Job = {
  parkId: string
  parkName: string
  sharp: boolean
  done: number
  total: number
  bytes: number
  failed: number
  startedAt: number
  state: 'run' | 'done' | 'stopped'
}

let job: Job | null = null
let abort: AbortController | null = null
const watchers = new Set<() => void>()

const tell = () => watchers.forEach((fn) => fn())

export function watchJob(fn: () => void) {
  watchers.add(fn)
  return () => {
    watchers.delete(fn)
  }
}

export const currentJob = () => job

/** ile jeszcze, w sekundach, licząc z tego, co już zeszło. null, gdy za wcześnie */
export function jobEta(j: Job) {
  const spent = (Date.now() - j.startedAt) / 1000
  if (j.done < 24 || spent < 2) return null
  const rate = j.done / spent
  return Math.max(1, Math.round((j.total - j.done) / rate))
}

export function cancelDownload() {
  abort?.abort()
  abort = null
  if (job) job = { ...job, state: 'stopped' }
  tell()
}

/** komunikat schodzi sam po chwili, ale tylko ten skończony */
export function clearJob() {
  if (job?.state === 'run') return
  job = null
  tell()
}

export function startDownload(parkId: string, parkName: string, sharp: boolean, total: number) {
  if (job?.state === 'run') return
  abort = new AbortController()
  job = {
    parkId,
    parkName,
    sharp,
    done: 0,
    total,
    bytes: 0,
    failed: 0,
    startedAt: Date.now(),
    state: 'run',
  }
  tell()
  void downloadPack(
    parkId,
    sharp,
    (p) => {
      if (!job || job.state !== 'run') return
      job = { ...job, done: p.done, total: p.total, bytes: p.bytes }
      tell()
    },
    abort.signal,
  ).then((out) => {
    abort = null
    if (!job) return
    if (!out || out.aborted) {
      job = { ...job, state: 'stopped' }
    } else {
      job = { ...job, state: 'done', bytes: out.bytes, failed: out.failed, done: out.tiles }
    }
    tell()
  })
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
