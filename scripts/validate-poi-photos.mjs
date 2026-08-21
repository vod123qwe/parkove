// Kontrola trafień z Commons po fakcie, bez ponownego pobierania.
//
// Filtr „wspólne słowo" nie wystarcza: na punkt „Pomnik Matejki" w Plantach
// przyszło „Jan matejko pomnik park jordana krakow", czyli popiersie z Parku
// Jordana. Nazwisko się zgadza, miejsce nie. Ta kontrola odrzuca trafienie,
// jeśli w tytule pliku siedzi nazwa INNEGO naszego miejsca.
//
// Uruchomienie: node scripts/validate-poi-photos.mjs [--apply]
// Bez --apply tylko wypisuje. Z --apply przenosi odrzucone na status 'rejected'.

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifestPath = resolve(root, '.tmp/poi-photos.json')
if (!existsSync(manifestPath)) {
  console.log('brak .tmp/poi-photos.json, najpierw uruchom fetch-photos-pois.mjs')
  process.exit(1)
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const parks = JSON.parse(readFileSync(resolve(root, 'src/app/data/parks.json'), 'utf8'))

const strip = (s) =>
  s.toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => 'acelnoszz'['ąćęłńóśźż'.indexOf(c)])
const GENERIC = new Set(
  'park parku planty dolina doliny kopiec krakow krakowie krakowa miejski les las lasek ogrod skalki nowa huta wielkie male'.split(
    ' ',
  ),
)
/** słowa, które identyfikują konkretne miejsce, np. „jordana", „bagry" */
const marksOf = (name) =>
  strip(name)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 4 && !GENERIC.has(w))

const places = parks.features
  .filter((f) => f.id !== 'test-piltza')
  .map((f) => ({ id: f.id, marks: new Set([...marksOf(f.properties.name), ...marksOf(f.id.replace(/-/g, ' '))]) }))

const apply = process.argv.includes('--apply')
let bad = 0
for (const [key, entry] of Object.entries(manifest)) {
  if (entry.status !== 'ok' || !entry.title) continue
  const [parkId, poiId] = key.split('/')
  const park = places.find((p) => p.id === parkId)
  /*
   * Nazwa samego punktu też jest „nasza": Kopiec Piłsudskiego leży w Lesie
   * Wolskim, więc plik „Kraków kopiec Piłsudskiego" jest poprawny, choć pasuje
   * też do osobnego miejsca o tej nazwie.
   */
  const mine = { marks: new Set([...(park?.marks ?? []), ...marksOf(poiId.replace(/-/g, ' '))]) }
  const title = strip(entry.title.replace(/^File:/, ''))
  /*
   * Decyduje POJEDYNCZE słowo, nie całe miejsce: odrzucamy, gdy w tytule siedzi
   * słowo identyfikujące inne miejsce, którego nie ma ani w nazwie naszego parku,
   * ani w nazwie naszego punktu. „jordana" przy punkcie w Plantach dyskwalifikuje,
   * „pilsudskiego" przy punkcie o tej nazwie nie.
   */
  const foreign = places
    .filter((p) => p.id !== parkId)
    .map((p) => ({ id: p.id, hits: [...p.marks].filter((w) => title.includes(w) && !mine.marks.has(w)) }))
    .filter((p) => p.hits.length)
  if (foreign.length) {
    bad++
    console.log(
      `ODRZUC ${key.padEnd(34)} ${entry.title.replace(/^File:/, '').slice(0, 42).padEnd(42)} <- obce slowo: ${foreign.map((f) => f.hits.join('/')).join(', ')}`,
    )
    if (apply) {
      const file = resolve(root, 'public' + entry.file)
      if (existsSync(file)) unlinkSync(file)
      manifest[key] = { status: 'rejected', reason: 'zdjecie z innego miejsca', title: entry.title }
    }
  }
}
if (apply) writeFileSync(manifestPath, JSON.stringify(manifest, null, 1))
const ok = Object.values(manifest).filter((e) => e.status === 'ok').length
console.log(`\nodrzuconych teraz: ${bad}, zostaje dobrych: ${ok}${apply ? ' (zapisane)' : ' (podglad, dodaj --apply)'}`)
