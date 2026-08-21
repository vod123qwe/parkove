// Zamienia surowe tagi OSM (.tmp/amenity-details.json z fetch-amenity-details.mjs)
// na gotowe etykiety w src/app/data/amenity-details.ts.
//
// Tłumaczenie siedzi tutaj, a nie w aplikacji, bo to decyzja redakcyjna: „surface
// = woodchips" ma się czytać jako „zrębki", a nie jako tag. Zmieniasz słownik,
// puszczasz skrypt, aplikacja dostaje gotowy tekst.
//
// Uruchomienie: node scripts/build-amenity-details.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const man = JSON.parse(readFileSync(resolve(root, '.tmp/amenity-details.json'), 'utf8'))

const CUISINE = {
  pizza: 'pizza', coffee_shop: 'kawa', ice_cream: 'lody', regional: 'kuchnia regionalna',
  polish: 'kuchnia polska', burger: 'burgery', kebab: 'kebab', sushi: 'sushi', italian: 'włoska',
  asian: 'azjatycka', vietnamese: 'wietnamska', indian: 'indyjska', mexican: 'meksykańska',
  breakfast: 'śniadania', sandwich: 'kanapki', cake: 'ciasta', dessert: 'deser', bakery: 'wypieki',
  chicken: 'kurczak', fish: 'ryby', vegan: 'wegańska', vegetarian: 'wegetariańska',
  georgian: 'gruzińska', american: 'amerykańska', french: 'francuska', greek: 'grecka',
  spanish: 'hiszpańska', thai: 'tajska', ukrainian: 'ukraińska', international: 'międzynarodowa',
  barbecue: 'grill', seafood: 'owoce morza',
}
const SURFACE = {
  sand: 'piasek', grass: 'trawa', rubber: 'guma', wood: 'drewno', woodchips: 'zrębki',
  dirt: 'ziemia', gravel: 'żwir', concrete: 'beton', paving_stones: 'kostka',
}

/** najwyżej trzy cechy: karta ma być spojrzeniem, nie kwestionariuszem */
function chips(kind, t) {
  const out = []
  for (const c of String(t.cuisine ?? '').split(';').slice(0, 2)) {
    const nice = CUISINE[c.trim()]
    if (nice) out.push(nice)
  }
  if (t.outdoor_seating === 'yes') out.push('ogródek')
  if (t.takeaway === 'yes' || t.takeaway === 'only') out.push('na wynos')
  if (t['diet:vegetarian'] === 'yes' || t['diet:vegetarian'] === 'only') out.push('wege')
  if (kind === 'playground') {
    if (SURFACE[t.surface]) out.push(SURFACE[t.surface])
    if (t.fenced === 'yes') out.push('ogrodzony')
    if (t.shade === 'yes') out.push('zacieniony')
    if (t.min_age || t.max_age) out.push(`${t.min_age ?? '0'}-${t.max_age ?? '?'} lat`)
  }
  if (t.wheelchair === 'yes') out.push('wózki ok')
  if (t.access === 'customers') out.push('dla klientów')
  if (t.access === 'private') out.push('prywatny')
  if (t.lit === 'yes') out.push('oświetlony')
  return [...new Set(out)].slice(0, 3)
}

const rows = []
for (const [key, v] of Object.entries(man)) {
  if (!v.ok || !v.tags) continue
  const kind = v.type === 'playground' ? 'playground' : 'food'
  const c = chips(kind, v.tags)
  const hours = v.tags.opening_hours ?? null
  const site = v.tags.website ?? null
  if (!c.length && !hours && !site) continue
  rows.push([key, { chips: c, hours, site }])
}
rows.sort((a, b) => a[0].localeCompare(b[0]))

const body = rows
  .map(([k, v]) => {
    const parts = [`chips: [${v.chips.map((c) => `'${c}'`).join(', ')}]`]
    if (v.hours) parts.push(`hours: ${JSON.stringify(v.hours)}`)
    if (v.site) parts.push(`site: ${JSON.stringify(v.site)}`)
    return `  '${k}': { ${parts.join(', ')} },`
  })
  .join('\n')

const NL = String.fromCharCode(10)
const header = [
  '// Co to za miejsce: etykiety wyciągnięte z OpenStreetMap (Nominatim, extratags,',
  '// 2026-08-21) i przetłumaczone na jedno spojrzenie. Klucz to parkId/spotId.',
  '//',
  '// GENEROWANE: scripts/build-amenity-details.mjs. Nie edytuj ręcznie, popraw słownik.',
  '//',
  '// Czego tu nie ma: wyposażenia placów zabaw (huśtawki, zjeżdżalnia, piaskownica).',
  '// W OSM to osobne węzły wewnątrz obszaru placu i potrzebny do nich Overpass,',
  '// który był tego dnia nieosiągalny ze wszystkich lustr.',
  '',
  'export type AmenityDetail = { chips: string[]; hours?: string; site?: string }',
  '',
  'export const AMENITY_DETAILS: Record<string, AmenityDetail> = {',
]
const footer = [
  '}',
  '',
  'export const detailFor = (parkId: string, spotId: string) =>',
  "  AMENITY_DETAILS[parkId + '/' + spotId] ?? null",
  '',
]
writeFileSync(
  resolve(root, 'src/app/data/amenity-details.ts'),
  [...header, body, ...footer].join(NL),
)
console.log(`miejsc z etykietami: ${rows.length}`)
