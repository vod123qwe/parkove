// Zdjęcia dla punktów, które ich nie mają. Czyta questy, buduje zapytanie z
// nazwy punktu, pyta Wikimedia Commons i ZAPISUJE TYLKO WTEDY, gdy tytuł pliku
// dzieli z zapytaniem znaczące słowo. Bez tej kontroli na „wodospad Szum"
// przyszedł jaz z Górecka Kościelnego, czyli zdjęcie z innego regionu.
//
// Uruchomienie: node scripts/fetch-photos-pois.mjs
// Wynik: public/photos/poi-<parkId>-<poiId>.jpg + .tmp/poi-photos.json

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public/photos')
const manifestPath = resolve(root, '.tmp/poi-photos.json')
mkdirSync(outDir, { recursive: true })
mkdirSync(dirname(manifestPath), { recursive: true })
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}

const UA = { 'User-Agent': 'Parkove/0.48 (personal Krakow parks project)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const strip = (s) =>
  s.toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => 'acelnoszz'['ąćęłńóśźż'.indexOf(c)])

/** słowa, które nie identyfikują niczego: nie mogą same decydować o trafieniu */
const GENERIC = new Set(
  'pomnik tablica punkt widokowy park staw jaskinia zrodlo skala skaly stary nowy wielki maly przy nad jego droga aleja plac stok linia widok woda most brama mur krzyz kaplica kosciol dwor palac wieza szczyt polana lasek las lawka teren miejsce'.split(
    ' ',
  ),
)
/*
 * Miejscowosci, ktorych u nas nie ma. Filtr "wspolne slowo" nie widzi geografii:
 * na "Ruiny mlyna" przyszedl plik "Warszawa. Ruiny mlyna", a na "teznia" teznia z
 * parku zdrojowego w Rabce. Nazwa sie zgadza, miejsce nie.
 *
 * Nie ma tu Skawiny, Bebla, Kobylan ani Jerzmanowic, bo te sa nasze. Sa tylko
 * miasta, ktorych w tym projekcie nie moze byc.
 *
 * To NIE zastepuje ogladania. Trzecie zle trafienie z tego samego biegu, zdjecie
 * grupowe konferencji o nazwie "Wzlot", ma w tytule Krakow i przechodzi kazdy
 * filtr nazwy, jaki da sie napisac. Po pobraniu nowych zdjec trzeba je zobaczyc.
 */
const OBCE = new Set(
  `warszawa wroclaw poznan gdansk gdynia sopot lodz lublin bialystok szczecin bydgoszcz torun
   olsztyn kielce rzeszow opole katowice gliwice sosnowiec czestochowa radom rabka zakopane
   tarnow ciechocinek inowroclaw kolobrzeg krynica ustron wisla busko naleczow sandomierz
   przemysl zamosc chelm plock kalisz legnica walbrzych elblag koszalin slupsk leszno gorzow
   suwalki lomza siedlce mielec debica jaslo krosno sanok szczawnica muszyna zywiec bielsko
   cieszyn oswiecim chrzanow trzebinia olkusz myslowice tychy jaworzno rybnik raciborz`.split(
    /\s+/,
  ),
)

const words = (t) =>
  strip(t)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !GENERIC.has(w))

function readPois() {
  const out = []
  for (const file of ['src/app/data/quests.ts', 'src/app/data/quests-dolinki.ts']) {
    const s = readFileSync(resolve(root, file), 'utf8')
    const marks = [...s.matchAll(/coords:\s*\[\s*([\d.]+)\s*,\s*([\d.]+)\s*\]/g)]
    let prev = 0
    for (const m of marks) {
      const win = s.slice(prev, m.index)
      prev = m.index + m[0].length
      const parkId = [...s.slice(0, m.index).matchAll(/parkId:\s*'([^']+)'/g)].pop()?.[1]
      const id = [...win.matchAll(/\bid:\s*'([^']+)'/g)].pop()?.[1]
      const name = [...win.matchAll(/\bname:\s*['"]([^'"]*)['"]/g)].pop()?.[1]
      const hasPhoto = win.includes('photo:')
      if (parkId && id && !hasPhoto) out.push({ parkId, id, name: name ?? '' })
    }
  }
  return out
}

const IN_CITY = (parkId) => !parkId.startsWith('dolina-')
const pois = readPois().filter((p) => p.name && words(p.name).length > 0)
console.log(`punktow bez zdjecia z nazwa wlasna: ${pois.length}\n`)

let ok = 0
let rejected = 0
let miss = 0
for (const poi of pois) {
  const key = `${poi.parkId}/${poi.id}`
  if (manifest[key]) continue
  const query = IN_CITY(poi.parkId) ? `${poi.name} Kraków` : poi.name
  await sleep(9000) // Commons ucina serie: 9 s to minimum, ktore przechodzi
  const api = new URL('https://commons.wikimedia.org/w/api.php')
  api.search = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: '6',
    gsrlimit: '3',
    prop: 'imageinfo',
    iiprop: 'url|extmetadata',
    iiurlwidth: '1200',
    format: 'json',
  }).toString()
  try {
    const res = await fetch(api, { headers: UA })
    const data = await res.json()
    const pages = Object.values(data.query?.pages ?? {})
    if (!pages.length) {
      console.log(`MISS   ${key}  (${query})`)
      manifest[key] = { status: 'miss', query }
      miss++
      continue
    }
    const mine = words(poi.name)
    const hit = pages.find((p) => {
      const title = words((p.title ?? '').replace(/^File:/, ''))
      // obce miasto w tytule przeklada sie na obce miejsce na zdjeciu
      if (title.some((w) => OBCE.has(w))) return false
      return title.some((w) => mine.some((v) => v.startsWith(w.slice(0, 5)) || w.startsWith(v.slice(0, 5))))
    })
    if (!hit) {
      console.log(`ODRZUC ${key}  (${query}) -> ${(pages[0].title ?? '').slice(0, 46)}`)
      manifest[key] = { status: 'rejected', query, first: pages[0].title }
      rejected++
      continue
    }
    const info = hit.imageinfo?.[0]
    const meta = info?.extmetadata ?? {}
    const author = (meta.Artist?.value ?? 'unknown').replace(/<[^>]*>/g, '').trim()
    const license = meta.LicenseShortName?.value ?? '?'
    let img = await fetch(info.thumburl ?? info.url, { headers: UA })
    let buf = Buffer.from(await img.arrayBuffer())
    if (buf.length < 8000) {
      console.log(`THIN   ${key}`)
      manifest[key] = { status: 'thin', query }
      miss++
      continue
    }
    const file = `poi-${poi.parkId}-${poi.id}.jpg`
    writeFileSync(resolve(outDir, file), buf)
    manifest[key] = {
      status: 'ok',
      file: `/photos/${file}`,
      title: hit.title,
      credit: `Fot. ${author.slice(0, 40)} · ${license} · Wikimedia Commons`,
    }
    ok++
    console.log(`OK     ${key}  <- ${hit.title.slice(0, 44)}  |  ${license}`)
  } catch (e) {
    console.log(`FAIL   ${key}: ${e.message}`)
    manifest[key] = { status: 'fail', query, error: e.message }
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 1))
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1))
console.log(`\nwzietych: ${ok}, odrzuconych po nazwie: ${rejected}, bez trafienia: ${miss}`)
