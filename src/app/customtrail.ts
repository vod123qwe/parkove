/*
 * Trasa ułożona przez Ciebie.
 *
 * Jarek: „jak przygotowujesz ścieżki, to chciałbym móc wybrać parking i
 * oznaczyć, czy parking ma być wliczony w ścieżkę, którą wygenerowałem, albo w
 * ogóle żebym miał takie checkboxy, które oznaczam jako elementy w trasie".
 *
 * To cofa poprzednią decyzję („warianty gotowe, bez edycji") i cofa ją słusznie,
 * ale nie do końca: **układanie zostaje czynnością domową**. Router pieszy jest
 * w sieci, a w dolinie sieci nie ma, więc trasę składasz z zasięgiem, a potem
 * leży zapisana i działa offline jak każdy inny wariant. Ten sam podział, co przy
 * pobieraniu mapy: przygotowanie w domu, korzystanie w terenie.
 *
 * Router to ten sam, co w generatorze danych (`scripts/build-trails.mjs`), i
 * usługa też ta sama: `trip`, czyli „odwiedź te punkty w rozsądnej kolejności".
 * Kolejności nie ustalamy sami, bo problem komiwojażera na dziesięciu punktach
 * to nie coś, co warto pisać ręcznie.
 */

import type { Trail } from './data/trails'

const OSRM = 'https://routing.openstreetmap.de/routed-foot'

const KEY = 'pk-mytrails'

/** wybrany element trasy: cokolwiek, co ma współrzędne i nazwę */
export type Stop = {
  id: string
  name: string
  coords: [number, number]
  kind: 'parking' | 'poi' | 'play' | 'food'
}

export function myTrails(): Record<string, Trail[]> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Record<string, Trail[]>
  } catch {
    return {}
  }
}

export const myTrailsFor = (parkId: string) => myTrails()[parkId] ?? []

function write(next: Record<string, Trail[]>) {
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function dropMyTrail(parkId: string, id: string) {
  const all = myTrails()
  all[parkId] = (all[parkId] ?? []).filter((t) => t.id !== id)
  if (all[parkId].length === 0) delete all[parkId]
  write(all)
}

/**
 * Ułożenie trasy przez wybrane elementy.
 *
 * `roundtrip` zależy od tego, czy zaznaczyłeś parking: z parkingiem trasa jest
 * pętlą od niego i do niego, bo tam stoi auto. Bez parkingu to zwykłe przejście
 * od pierwszego do ostatniego punktu i wtedy nie ma powodu wracać.
 */
export async function buildMyTrail(
  parkId: string,
  stops: Stop[],
  name: string,
): Promise<{ trail: Trail } | { error: string }> {
  if (stops.length < 2) return { error: 'Zaznacz co najmniej dwa punkty.' }
  const parking = stops.find((s) => s.kind === 'parking')
  const rest = stops.filter((s) => s.kind !== 'parking')
  const ordered = parking ? [parking, ...rest] : stops
  const coords = ordered.map((s) => `${s.coords[0]},${s.coords[1]}`).join(';')
  const roundtrip = Boolean(parking)
  const url =
    `${OSRM}/trip/v1/foot/${coords}?overview=full&geometries=geojson` +
    `&roundtrip=${roundtrip}&source=first${roundtrip ? '' : '&destination=last'}`
  let data: {
    trips?: Array<{ distance: number; duration: number; geometry: { coordinates: number[][] } }>
    waypoints?: Array<{ waypoint_index: number }>
  }
  try {
    const res = await fetch(url)
    if (!res.ok) return { error: `Router odpowiedział ${res.status}. Spróbuj jeszcze raz.` }
    data = await res.json()
  } catch {
    return { error: 'Nie udało się połączyć z routerem. Trasę układa się z zasięgiem.' }
  }
  const trip = data.trips?.[0]
  if (!trip) return { error: 'Router nie znalazł drogi między tymi punktami.' }

  /*
   * `waypoint_index` mówi, w jakiej kolejności router odwiedza punkty, a nie w
   * jakiej je podaliśmy. Bez tego lista przystanków w karcie kłamałaby o
   * kolejności, w której je zobaczysz.
   */
  const order = (data.waypoints ?? [])
    .map((w, i) => ({ at: w.waypoint_index, stop: ordered[i] }))
    .sort((a, b) => a.at - b.at)
    .map((x) => x.stop)
    .filter((s) => s && s.kind !== 'parking')

  const trail: Trail = {
    id: `my-${Date.now().toString(36)}`,
    name,
    kind: 'points',
    m: Math.round(trip.distance),
    // tempo takie samo, jak w generatorze danych: pieszo z dzieckiem, nie sportowo
    min: Math.max(1, Math.round(trip.duration / 60)),
    stops: order.map((s) => s.id),
    note: parking ? `Pętla od parkingu ${parking.name}` : 'Przejście, bez powrotu na start',
    line: trip.geometry.coordinates.map((c) => [c[0], c[1]] as [number, number]),
  }
  const all = myTrails()
  all[parkId] = [trail, ...(all[parkId] ?? [])]
  write(all)
  return { trail }
}
