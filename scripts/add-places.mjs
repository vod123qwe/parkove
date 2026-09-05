// Dodaje miejsca spoza kuratorowanej listy krakowskiej, po nazwie z OSM.
//
// Powstalo przy trzech rezerwatach dodanych 2026-08-29 (Liban, Bonarka,
// Dolina Mnikowska). fetch-parks.mjs odpytuje wlasna liste WANTED i nadpisuje
// parks.json w calosci, wiec te wpisy dokladamy osobno, idempotentnie.
//
//   node scripts/add-places.mjs [--dry]

import { readFileSync, writeFileSync } from 'node:fs'

const PLACES = [
  /* dwa obiekty o tej nazwie: stare wyrobisko (landuse=quarry) i uzytek
     ekologiczny z 2022. Bierzemy uzytek, bo obejmuje tez tablice i pomnik. */
  { id: 'liban', name: 'Kamieniołom Libana', kind: 'nature', osmId: 1460147273 },
  { id: 'kmity', name: 'Skała Kmity', kind: 'nature', osmId: 2119192, osmType: 'relation' },
  { id: 'zimny-dol', name: 'Zimny Dół', kind: 'valley', osmId: 158245131 },
  { id: 'kajasowka', name: 'Kajasówka', kind: 'nature', osmId: 158245105 },
  { id: 'skolczanka', name: 'Skołczanka', kind: 'nature', osmId: 158245125 },
  /* Kamionna: obszar celowo duzy, bo wyprawa ma trzy watki rozrzucone po
     calej gorze i wsi. Szczyt z wieza lezy ZA granica rezerwatu, kosciol i
     kolumna Lubomirskiego sa we wsi poltora kilometra nizej. Kolo obejmuje
     wszystko: ten sam trik co przy kopcach i Odeceixe. */
  { id: 'kamionna', name: 'Kamionna', kind: 'mountain', circle: { center: [20.3825, 49.79], radiusM: 1950 } },
  /* nazwa w OSM ma cudzyslowy w srodku, ktore psuja skladnie zapytania,
     a dopasowanie po fragmencie lapie galerie handlowa. Bierzemy wiec way po id. */
  { id: 'bonarka', name: 'Rezerwat Bonarka', kind: 'nature', osmId: 136788901 },
  { id: 'mnikowska', name: 'Dolina Mnikowska', kind: 'valley', osm: 'Rezerwat Dolina Mnikowska', bbox: [50.058, 19.698, 50.075, 19.719] },
]

const overpass = async (query) => {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'Parkove/0.4 (personal Krakow parks project)',
        },
        body: 'data=' + encodeURIComponent(query),
        signal: AbortSignal.timeout(120000),
      })
      if (res.ok) return res.json()
      console.log(`  HTTP ${res.status}, proba ${attempt}`)
    } catch (e) {
      console.log(`  ${e.message}, proba ${attempt}`)
    }
    await new Promise((r) => setTimeout(r, 4000))
  }
  return null
}

const path = 'src/app/data/parks.json'
const parks = JSON.parse(readFileSync(path, 'utf8'))
const before = parks.features.length

/** kolo jako wielokat: 32 wierzcholki wystarcza, zeby granica nie byla kanciasta */
function circleRing(center, radiusM, steps = 32) {
  const ring = []
  const latM = 111320
  const lonM = 111320 * Math.cos((center[1] * Math.PI) / 180)
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2
    ring.push([
      Number((center[0] + (radiusM * Math.cos(a)) / lonM).toFixed(6)),
      Number((center[1] + (radiusM * Math.sin(a)) / latM).toFixed(6)),
    ])
  }
  return ring
}

for (const place of PLACES) {
  if (place.circle) {
    const { center, radiusM } = place.circle
    const ring = circleRing(center, radiusM)
    const areaHa = Number(((Math.PI * radiusM * radiusM) / 10000).toFixed(1))
    parks.features = parks.features.filter((f) => f.id !== place.id)
    parks.features.push({
      type: 'Feature',
      id: place.id,
      properties: { id: place.id, name: place.name, kind: place.kind, areaHa, center },
      geometry: { type: 'Polygon', coordinates: [ring] },
    })
    console.log(`${place.id.padEnd(14)} kolo ${radiusM} m, ${areaHa} ha, srodek ${center.join(', ')}`)
    continue
  }
  let q
  if (place.osmId) {
    const type = place.osmType ?? 'way'
    q = `[out:json][timeout:90];${type}(${place.osmId});out geom;`
  } else {
    const [s, w, n, e] = place.bbox
    const sel = place.match ? `["name"~"${place.match}"]` : `["name"="${place.osm}"]`
    q = `[out:json][timeout:90];
(
  way(${s},${w},${n},${e})${sel};
  relation(${s},${w},${n},${e})${sel};
);
out geom;`
  }
  const data = await overpass(q)
  if (!data?.elements?.length) {
    console.log(`${place.id.padEnd(14)} NIE ZNALEZIONO w OSM (${place.osmId ?? place.match ?? place.osm})`)
    continue
  }
  /* bierzemy najwiekszy obrys: rezerwat bywa zmapowany i jako way, i jako relacja */
  let best = null
  for (const el of data.elements) {
    const parts = el.geometry ? [el.geometry] : (el.members ?? []).map((m) => m.geometry).filter(Boolean)
    for (const g of parts) if (g.length > 3 && (!best || g.length > best.length)) best = g
  }
  if (!best) {
    console.log(`${place.id.padEnd(14)} brak geometrii`)
    continue
  }
  const ring = best.map((p) => [Number(p.lon.toFixed(6)), Number(p.lat.toFixed(6))])
  if (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ring.push(ring[0])

  const lo = ring.map((c) => c[0]), la = ring.map((c) => c[1])
  const mid = [(Math.min(...lo) + Math.max(...lo)) / 2, (Math.min(...la) + Math.max(...la)) / 2]
  const latM = 111320
  const lonM = 111320 * Math.cos((mid[1] * Math.PI) / 180)
  let area = 0
  for (let i = 0; i < ring.length - 1; i++) {
    area += ring[i][0] * lonM * (ring[i + 1][1] * latM) - ring[i + 1][0] * lonM * (ring[i][1] * latM)
  }
  const areaHa = Number((Math.abs(area / 2) / 10000).toFixed(1))

  parks.features = parks.features.filter((f) => f.id !== place.id)
  parks.features.push({
    type: 'Feature',
    id: place.id,
    properties: {
      id: place.id,
      name: place.name,
      kind: place.kind,
      areaHa,
      center: [Number(mid[0].toFixed(6)), Number(mid[1].toFixed(6))],
    },
    geometry: { type: 'Polygon', coordinates: [ring] },
  })
  console.log(`${place.id.padEnd(14)} ${String(ring.length - 1).padStart(4)} wierzcholkow, ${String(areaHa).padStart(6)} ha, srodek ${mid.map((n) => n.toFixed(5)).join(', ')}`)
  await new Promise((r) => setTimeout(r, 2000))
}

if (process.argv.includes('--dry')) process.exit(0)
writeFileSync(path, JSON.stringify(parks, null, 2) + String.fromCharCode(10))
console.log(`zapisane: ${parks.features.length} miejsc (bylo ${before})`)
