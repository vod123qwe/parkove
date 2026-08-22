// Praktyczna okolica: toalety, place zabaw, lody i poidełka wokół Krakowa.
//
// Po co (Jarek, 2026-08-22): zapytał przewodnika, gdzie obok jest plac zabaw,
// stojąc w mieście. Przewodnik odesłał go do parku, bo w kontekście miał tylko
// udogodnienia PRZY PARKACH z naszej kuracji: ani jednej toalety i kilkadziesiąt
// placów zabaw zamiast tysiąca siedmiuset. Chce przewodnika, który powie „w tym
// parku placu nie ma, ale trzysta metrów za wyjściem jest", i „wiem, że dziecko
// musi do toalety, najbliższa jest tu".
//
// Dlaczego pobieramy to do pliku, a nie pytamy w biegu: w dolinie nie ma
// zasięgu, Overpass bywa nieosiągalny (patrz build-trails.mjs), a te dane
// zmieniają się raz na miesiąc, nie raz na godzinę.
//
// Czego tu nie ma: piekarni i sklepów (dwa tysiące punktów, a Google Maps robi
// to lepiej) oraz ławek i koszy (za dużo, za mało warte).
//
// Uruchomienie: npm run nearby
// Wynik: src/app/data/nearby.json

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/* Kraków plus Dolinki Krakowskie plus Skawina: tyle, ile sięgają wyprawy */
const BBOX = '49.94,19.60,50.24,20.18'

const HOSTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function ask(query) {
  for (const host of HOSTS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      await sleep(attempt * 1800)
      try {
        const res = await fetch(host, {
          method: 'POST',
          headers: {
            'User-Agent': 'Parkove/0.74 (personal Krakow parks project)',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'data=' + encodeURIComponent(query),
        })
        const text = await res.text()
        if (!res.ok || text.trim().startsWith('<')) continue
        return JSON.parse(text)
      } catch {
        /* następny serwer */
      }
    }
  }
  console.warn('  ! żaden serwer Overpass nie odpowiedział')
  return null
}

/**
 * Kategorie. Kod jest krótki, bo trafia do pliku kilka tysięcy razy:
 *   wc    toaleta            play  plac zabaw
 *   ice   lody               water poidełko
 */
const GROUPS = [
  { code: 'wc', sel: '[amenity=toilets]', label: 'toaleta' },
  { code: 'play', sel: '[leisure=playground]', label: 'plac zabaw' },
  { code: 'ice', sel: '[amenity=ice_cream]', label: 'lodziarnia' },
  { code: 'water', sel: '[amenity=drinking_water]', label: 'poidełko' },
]

const out = []
for (const g of GROUPS) {
  const q = `[out:json][timeout:180];nwr${g.sel}(${BBOX});out center tags;`
  const data = await ask(q)
  if (!data) continue
  let n = 0
  for (const e of data.elements ?? []) {
    const c = e.center ?? { lat: e.lat, lon: e.lon }
    if (!c?.lat) continue
    const t = e.tags ?? {}
    const row = { k: g.code, c: [+c.lon.toFixed(5), +c.lat.toFixed(5)] }
    /* nazwa tylko wtedy, gdy niesie informację: „Toaleta" nie niesie */
    const name = t.name ?? t['name:pl']
    if (name && name.length < 40 && name.toLowerCase() !== g.label) row.n = name
    /*
     * Flagi, które w terenie z dzieckiem rozstrzygają: przewijak, opłata,
     * dostępność wózkiem. Zapisujemy tylko wtedy, gdy OSM mówi wprost.
     */
    const flags = []
    if (t.changing_table === 'yes') flags.push('przewijak')
    if (t.fee === 'yes') flags.push('płatna')
    if (t.fee === 'no') flags.push('bezpłatna')
    if (t.wheelchair === 'yes') flags.push('wózkiem')
    if (t.opening_hours === '24/7') flags.push('całą dobę')
    if (flags.length) row.f = flags.join(', ')
    out.push(row)
    n++
  }
  console.log(`${g.label.padEnd(12)} ${n}`)
}

const json = JSON.stringify({ generated: 'scripts/build-nearby.mjs', bbox: BBOX, items: out })
writeFileSync(resolve(root, 'src/app/data/nearby.json'), json, 'utf8')
console.log(`\nzapisane: ${out.length} punktów, ${Math.round(json.length / 1024)} kB`)
