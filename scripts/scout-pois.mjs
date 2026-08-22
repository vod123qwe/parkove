// Rozpoznanie terenu: co w danym miejscu jest NAZWANE w OpenStreetMap, a nie ma
// jeszcze swojego punktu w wyprawie.
//
// Po co: dopisywanie punktów z pamięci kończy się wymyślaniem. Tu pytamy danych,
// co w obrysie miejsca ma nazwę (skały, jaskinie, źródła, wodospady, punkty
// widokowe, zabytki, schrony), i porównujemy z tym, co już mamy w quests.
//
// Uruchomienie: node scripts/scout-pois.mjs dolina-bedkowska dolina-kobylanska

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const parks = JSON.parse(readFileSync(resolve(root, 'src/app/data/parks.json'), 'utf8'))
const questSrc =
  readFileSync(resolve(root, 'src/app/data/quests.ts'), 'utf8') +
  readFileSync(resolve(root, 'src/app/data/quests-dolinki.ts'), 'utf8')

const HOSTS = [
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function ask(query) {
  for (const host of HOSTS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      await sleep(attempt * 1500)
      try {
        const res = await fetch(host, {
          method: 'POST',
          headers: {
            'User-Agent': 'Parkove/0.62 (personal Krakow parks project)',
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

function poly(parkId) {
  const f = parks.features.find((x) => x.id === parkId)
  if (!f) return null
  const rings =
    f.geometry.type === 'Polygon' ? f.geometry.coordinates : f.geometry.coordinates.flat()
  const ring = rings[0]
  const step = Math.max(1, Math.ceil(ring.length / 60))
  return ring
    .filter((_, i) => i % step === 0)
    .map((c) => `${c[1].toFixed(5)} ${c[0].toFixed(5)}`)
    .join(' ')
}

const WHAT = [
  '[natural~"^(peak|cliff|rock|cave_entrance|spring|arch|stone|saddle)$"][name]',
  '[tourism~"^(attraction|viewpoint|picnic_site|wilderness_hut|alpine_hut|camp_site)$"]',
  '[historic][name]',
  '[waterway=waterfall]',
  '[sport=climbing][name]',
  '[amenity~"^(shelter|restaurant|cafe)$"][name]',
  '[man_made~"^(cross|tower|watermill)$"]',
  '[leisure=nature_reserve][name]',
]

for (const parkId of process.argv.slice(2)) {
  const p = poly(parkId)
  if (!p) {
    console.log(`${parkId}: nie znam takiego miejsca`)
    continue
  }
  const q =
    '[out:json][timeout:120];(' +
    WHAT.map((w) => `nwr(poly:"${p}")${w};`).join('') +
    ');out center tags;'
  const d = await ask(q)
  console.log(`\n=== ${parkId} ===`)
  if (!d) continue
  const rows = []
  const seen = new Set()
  for (const e of d.elements ?? []) {
    const t = e.tags ?? {}
    const name = t.name ?? t['name:pl'] ?? ''
    const kind =
      t.natural ?? t.tourism ?? t.historic ?? t.waterway ?? t.sport ?? t.amenity ?? t.man_made ?? t.leisure ?? ''
    const key = `${name}|${kind}`
    if (seen.has(key)) continue
    seen.add(key)
    const c = e.center ?? { lat: e.lat, lon: e.lon }
    if (!c?.lat) continue
    /* czy już to mamy: po nazwie i po współrzędnych z grubsza */
    const have =
      (name && questSrc.includes(name)) ||
      questSrc.includes(`${c.lon.toFixed(3)}`) === false
        ? questSrc.includes(name)
        : false
    rows.push({
      name: name || '(bez nazwy)',
      kind,
      coords: `[${c.lon.toFixed(5)}, ${c.lat.toFixed(5)}]`,
      ele: t.ele ?? '',
      have,
      extra: [t.climbing ? 'wspinaczka' : '', t.description ?? '', t.website ?? '']
        .filter(Boolean)
        .join(' | ')
        .slice(0, 80),
    })
  }
  rows.sort((a, b) => Number(a.have) - Number(b.have) || a.kind.localeCompare(b.kind))
  for (const r of rows)
    console.log(
      `${r.have ? 'MAMY ' : '  nowe'} ${r.name.padEnd(28)} ${r.kind.padEnd(13)} ${r.coords} ${r.ele} ${r.extra}`,
    )
  console.log(`(${rows.length} nazwanych obiektów)`)
}
