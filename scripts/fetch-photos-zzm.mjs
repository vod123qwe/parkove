// Zdjęcia parków ze strony ZZM Kraków (decyzja Jarka 2026-08-24: podmienić
// wszystkie od razu, ZZM jako pierwsze źródło dla parków miejskich).
//
// Skrypt POBIERA KANDYDATÓW do .tmp/zzm/, po kilka na park. Wyboru dokonuje
// człowiek, oglądając arkusze stykowe: lekcja z Commons (młyn z Warszawy,
// tężnia z Rabki) mówi, że żaden filtr nazwy nie zastąpi spojrzenia.
//
// Uruchomienie: node scripts/fetch-photos-zzm.mjs [parkId ...]
// Wynik: .tmp/zzm/<parkId>__<n>.jpg + .tmp/zzm/manifest.json

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, '.tmp/zzm')
mkdirSync(outDir, { recursive: true })
const manifestPath = resolve(outDir, 'manifest.json')
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {}

const BASE = 'https://zzm.krakow.pl'
const UA = { 'User-Agent': 'Parkove/0.95 (prywatna apka rodzinna o parkach Krakowa)' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** nasze id -> strona parku na zzm.krakow.pl */
const MAP = {
  blonia: '205-blonia-krakowskie',
  'laki-nowohuckie': '447-laki-nowohuckie',
  mlynowka: '224-park-mlynowka-krolewska',
  aleksandry: '242-park-aleksandry',
  bednarskiego: '243-park-im-wojciecha-bednarskiego',
  decjusza: '208-park-decjusza',
  duchacki: '865-park-duchacki',
  grzegorzecki: '1598-park-grzegorzecki',
  'jalu-kurka': '1417-park-jalu-kurka',
  jerzmanowskich: '245-park-im-erazma-i-anny-jerzmanowskich',
  'park-jordana': '209-park-im-henryka-jordana',
  krakowski: '222-park-krakowski',
  krowoderski: '207-park-krowoderski',
  kurdwanow: '246-park-kurdwanow',
  witkowice: '223-park-lesny-witkowice',
  'lilli-wenedy': '247-park-lilli-wenedy',
  lotnikow: '230-park-lotnikow-polskich',
  'macka-i-doroty': '248-park-im-macka-i-doroty',
  ratuszowy: '232-park-ratuszowy',
  reduta: '663-park-reduta',
  rzaka: '250-park-rzaka',
  solvay: '251-park-solvay',
  'stacja-wisla': '445-park-stacja-wisla',
  strzelecki: '255-park-strzelecki',
  szwedzki: '234-park-szwedzki',
  tysiaclecia: '235-park-tysiaclecia',
  szymborskiej: '1418-park-im-wislawy-szymborskiej',
  'wisniowy-sad': '236-park-wisniowy-sad',
  wyspianskiego: '220-park-im-stanislawa-wyspianskiego-w-krakowie',
  'zielony-jar': '241-park-zielony-jar',
  zeromskiego: '238-park-zeromskiego',
  planty: '256-planty-krakowskie',
  'planty-bienczyckie': '231-park-planty-bienczyckie',
  'przylasek-rusiecki': '2363-park-przylasek-rusiecki',
  bagry: '443-zalew-bagry',
  zakrzowek: '446-zakrzowek',
  'zalew-nowohucki': '237-park-zalew-nowohucki',
}

const SKIP = /biplogo|favicon|logo|parki_mini|herb|banner|ikona|\.svg/i
const only = process.argv.slice(2)
const ids = Object.keys(MAP).filter((id) => (only.length ? only.includes(id) : true))

let ok = 0
let miss = 0
for (const id of ids) {
  if (manifest[id]?.files?.length) {
    console.log(`CACHE  ${id} (${manifest[id].files.length})`)
    continue
  }
  const url = `${BASE}/pl/lista-parkow/${MAP[id]}.html`
  try {
    const res = await fetch(url, { headers: UA })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const srcs = [...html.matchAll(/src="(\/images\/[^"]+\.(?:jpe?g|png))"/gi)]
      .map((m) => m[1])
      .filter((u) => !SKIP.test(u))
    const uniq = [...new Set(srcs)].slice(0, 4)
    if (uniq.length === 0) {
      console.log(`MISS   ${id}  (strona bez galerii)`)
      manifest[id] = { url, files: [] }
      miss++
      continue
    }
    const files = []
    let n = 0
    for (const u of uniq) {
      n++
      // u bywa juz zakodowane (%20 w nazwach ZZM); encodeURI podwajalo kodowanie i dawalo 404
      const img = await fetch(BASE + u, { headers: UA })
      if (!img.ok) continue
      const buf = Buffer.from(await img.arrayBuffer())
      if (buf.length < 30000) continue // miniatury i ikony nie wchodzą
      const file = `${id}__${n}.jpg`
      writeFileSync(resolve(outDir, file), buf)
      files.push({ file, src: u, bytes: buf.length })
      await sleep(250)
    }
    manifest[id] = { url, files }
    console.log(`OK     ${id}  ${files.length} kandydatów`)
    ok++
    await sleep(400)
  } catch (e) {
    console.log(`FAIL   ${id}: ${e.message}`)
    manifest[id] = { url, files: [], error: String(e.message) }
  }
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 1))
}
writeFileSync(manifestPath, JSON.stringify(manifest, null, 1))
console.log(`\nparki z kandydatami: ${ok}, bez galerii: ${miss}, razem stron: ${ids.length}`)
