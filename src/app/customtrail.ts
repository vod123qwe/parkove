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
/*
 * DRUGI ROUTER, i to nie z ostroznosci, a z pomiaru.
 *
 * Jarek 2026-08-25: "trasa czesto sie nie wylicza". Sprawdzone tego samego
 * dnia: OSRM (routing.openstreetmap.de) odpowiadal timeoutem na kazde
 * zapytanie, a Valhalla FOSSGIS liczyla te sama trase w 246 ms. Jeden
 * publiczny router to jeden punkt awarii, wiec teraz sa dwa: Valhalla
 * pierwsza, bo szybsza i ma /locate (przyklejanie punktu do sciezki),
 * OSRM jako zapas.
 *
 * Roznica, o ktorej trzeba wiedziec: OSRM ma usluge trip, ktora sama uklada
 * KOLEJNOSC przystankow (problem komiwojazera). Valhalla tego nie robi, wiec
 * przy niej trasa idzie w kolejnosci zaznaczania. W edytorze to nawet lepiej,
 * bo kolejnosc jest przewidywalna i sam nia sterujesz.
 */
const VALHALLA = 'https://valhalla1.openstreetmap.de'

/** polyline6 Valhalli: ten sam algorytm co u Google, tylko dokladnosc 1e6 */
function decodePoly6(str: string): Array<[number, number]> {
  const out: Array<[number, number]> = []
  let index = 0
  let lat = 0
  let lng = 0
  while (index < str.length) {
    let b = 0
    let shift = 0
    let result = 0
    do {
      b = str.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1
    shift = 0
    result = 0
    do {
      b = str.charCodeAt(index++) - 63
      result |= (b & 0x1f) << shift
      shift += 5
    } while (b >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    out.push([lng / 1e6, lat / 1e6])
  }
  return out
}

async function valhallaRoute(pts: Array<[number, number]>) {
  try {
    const res = await fetch(`${VALHALLA}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: pts.map(([lon, lat]) => ({ lat, lon })),
        costing: 'pedestrian',
        directions_options: { units: 'kilometers' },
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return null
    const d = (await res.json()) as {
      trip?: { summary?: { length: number; time: number }; legs?: Array<{ shape: string }> }
    }
    const t = d.trip
    if (!t?.legs?.length || !t.summary) return null
    const line = t.legs.flatMap((l) => decodePoly6(l.shape))
    if (line.length < 2) return null
    return {
      m: Math.round(t.summary.length * 1000),
      min: Math.max(1, Math.round(t.summary.time / 60)),
      line,
    }
  } catch {
    return null
  }
}

const KEY = 'pk-mytrails'

/** wybrany element trasy: cokolwiek, co ma współrzędne i nazwę */
export type Stop = {
  id: string
  name: string
  coords: [number, number]
  kind: 'parking' | 'poi' | 'play' | 'food'
  /** klucz ikony z pins.ts: mowi, CO to za miejsce */
  icon?: string
  /** miniatura na kaflu w edytorze, gdy punkt ma zdjecie */
  photo?: string
}

/**
 * Najblizszy punkt sieci pieszej.
 *
 * Jarek 2026-08-25: "jezeli punkt gdzies jest, gdzie nie ma sciezki, to dodaj
 * sciezke w najblizszym miejscu, gdzie jest chodnik". Router odpowiada na to
 * wprost: pytamy /nearest, ktory zwraca punkt lezacy NA sciezce, i tam
 * przenosimy znacznik. To takze glowna przyczyna "trasa sie nie wylicza":
 * punkt postawiony na srodku trawnika albo na dachu nie ma jak wejsc do
 * grafu i usluga trip odpowiada bledem.
 */
export async function snapToPath(
  at: [number, number],
  maxAway = 200,
): Promise<[number, number] | null> {
  /* Valhalla /locate: correlated_lat i lon to punkt LEZACY na krawedzi grafu */
  try {
    const res = await fetch(`${VALHALLA}/locate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locations: [{ lat: at[1], lon: at[0] }],
        costing: 'pedestrian',
        verbose: true,
      }),
      signal: AbortSignal.timeout(9000),
    })
    if (res.ok) {
      const d = (await res.json()) as Array<{
        edges?: Array<{ correlated_lat?: number; correlated_lon?: number; distance?: number }>
      }>
      const e = d[0]?.edges?.[0]
      if (e?.correlated_lat != null && e.correlated_lon != null && (e.distance ?? 0) <= maxAway)
        return [e.correlated_lon, e.correlated_lat]
    }
  } catch {
    /* zapas niżej */
  }
  try {
    const r = await fetch(`${OSRM}/nearest/v1/foot/${at[0]},${at[1]}?number=1`, {
      signal: AbortSignal.timeout(9000),
    })
    if (!r.ok) return null
    const w = (await r.json()).waypoints?.[0]
    if (!w || w.distance > maxAway) return null
    return [w.location[0], w.location[1]]
  } catch {
    return null
  }
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
export type RoutedTrip = {
  m: number
  min: number
  stops: string[]
  line: Array<[number, number]>
  parkingName: string | null
}

/**
 * Samo ułożenie trasy, bez zapisu. Wydzielone, bo kreator pokazuje PODGLĄD
 * na żywo (uwaga Jarka: "podgląd tego, jak się zmienia trasa, gdy dodaję
 * konkretny punkt"), a zapis przychodzi dopiero z przyciskiem.
 */
export async function routeMyTrail(stops: Stop[]): Promise<{ trip: RoutedTrip } | { error: string }> {
  if (stops.length < 2) return { error: 'Zaznacz co najmniej dwa punkty.' }
  const parking = stops.find((s) => s.kind === 'parking')
  const rest = stops.filter((s) => s.kind !== 'parking')
  const ordered = parking ? [parking, ...rest] : stops
  const coords = ordered.map((s) => `${s.coords[0]},${s.coords[1]}`).join(';')
  const roundtrip = Boolean(parking)

  /*
   * Najpierw Valhalla: szybsza i dostepna wtedy, gdy OSRM milczy. Kolejnosc
   * przystankow jest ta, ktora zaznaczyles, a z parkingiem trasa wraca do
   * niego, bo tam stoi auto.
   */
  const viaValhalla = await valhallaRoute(
    roundtrip
      ? [...ordered.map((s) => s.coords), ordered[0].coords]
      : ordered.map((s) => s.coords),
  )
  if (viaValhalla)
    return {
      trip: {
        ...viaValhalla,
        stops: ordered
          .filter((s) => s.kind !== 'parking' && !s.id.startsWith('own-'))
          .map((s) => s.id),
        parkingName: parking?.name ?? null,
      },
    }
  const url =
    `${OSRM}/trip/v1/foot/${coords}?overview=full&geometries=geojson` +
    `&roundtrip=${roundtrip}&source=first${roundtrip ? '' : '&destination=last'}`
  let data:
    | {
        trips?: Array<{ distance: number; duration: number; geometry: { coordinates: number[][] } }>
        waypoints?: Array<{ waypoint_index: number }>
      }
    | undefined
  /*
   * Trzy proby, bo publiczny router czasem odpowiada 429 albo milczy przez
   * kilka sekund, a wtedy edytor pokazywal "nie udalo sie policzyc" mimo ze
   * wystarczylo zapytac ponownie. Przerwy rosna: 0, 700, 1800 ms.
   */
  let lastErr = 'Nie udało się połączyć z routerem. Trasę układa się z zasięgiem.'
  let ok = false
  for (const wait of [0, 700, 1800]) {
    if (wait) await new Promise((r) => setTimeout(r, wait))
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!res.ok) {
        lastErr =
          res.status === 429
            ? 'Router jest chwilowo przeciążony. Chwilę poczekaj i dotknij mapy jeszcze raz.'
            : `Router odpowiedział ${res.status}. Spróbuj jeszcze raz.`
        continue
      }
      data = await res.json()
      ok = true
      break
    } catch {
      lastErr = 'Nie udało się połączyć z routerem. Trasę układa się z zasięgiem.'
    }
  }
  if (!ok) return { error: lastErr }
  const trip = data!.trips?.[0]
  if (!trip)
    return {
      error: 'Router nie znalazł drogi między tymi punktami. Przenieś punkt bliżej alejki.',
    }

  /*
   * `waypoint_index` mówi, w jakiej kolejności router odwiedza punkty, a nie w
   * jakiej je podaliśmy. Bez tego lista przystanków w karcie kłamałaby o
   * kolejności, w której je zobaczysz.
   */
  const order = (data!.waypoints ?? [])
    .map((w, i) => ({ at: w.waypoint_index, stop: ordered[i] }))
    .sort((a, b) => a.at - b.at)
    .map((x) => x.stop)
    /* wlasne punkty z edytora nie sa punktami wyprawy, wiec nie licza sie do
       liczby punktow na karcie; parking tez nie, bo jest dojsciem */
    .filter((s) => s && s.kind !== 'parking' && !s.id.startsWith('own-'))

  return {
    trip: {
      m: Math.round(trip.distance),
      // tempo takie samo, jak w generatorze danych: pieszo z dzieckiem, nie sportowo
      min: Math.max(1, Math.round(trip.duration / 60)),
      stops: order.map((s) => s.id),
      line: trip.geometry.coordinates.map((c) => [c[0], c[1]] as [number, number]),
      parkingName: parking?.name ?? null,
    },
  }
}

export async function buildMyTrail(
  parkId: string,
  stops: Stop[],
  name: string,
  ready?: RoutedTrip,
): Promise<{ trail: Trail } | { error: string }> {
  const routed = ready ? { trip: ready } : await routeMyTrail(stops)
  if ('error' in routed) return routed
  const t = routed.trip
  const trail: Trail = {
    id: `my-${Date.now().toString(36)}`,
    name,
    kind: 'points',
    m: t.m,
    min: t.min,
    stops: t.stops,
    note: t.parkingName ? `Pętla od parkingu ${t.parkingName}` : 'Przejście, bez powrotu na start',
    line: t.line,
  }
  const all = myTrails()
  all[parkId] = [trail, ...(all[parkId] ?? [])]
  write(all)
  return { trail }
}
