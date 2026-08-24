/*
 * Fasety miejsca: proste fakty policzone RAZ z danych, które apka już ma.
 * Filtry (chipy nad listą) czytają wyłącznie stąd, więc dodanie fasety to
 * dopisanie jednego pola tutaj, a nie grzebanie w App.tsx.
 */
import { amenitiesFor, isFood } from './amenities'
import { PARK_INFO } from './parkinfo'
import { PARKING } from './parking'
import { TRANSIT } from './transit'
import { trailsFor } from './trails'
import parksData from './parks.json'

export type Facets = {
  playground: boolean
  food: boolean
  parking: boolean
  transit: boolean
  /** najkrótsza policzona trasa punktowa w minutach; null gdy tras nie ma */
  loopMin: number | null
  /**
   * "Da się obskoczyć szybko": trasa do 40 minut, a gdy miejsce nie ma
   * policzonych tras (małe parki), zastępczo powierzchnia do 12 ha. Bez tego
   * zapasu filtr Deszczowa sobota karałby małe parki za to, że są za małe na
   * generowanie tras.
   */
  quickLoop: boolean
}

const AREA: Record<string, number> = {}
for (const f of (parksData as { features: Array<{ id: string; properties: { areaHa?: number } }> })
  .features)
  AREA[f.id] = f.properties.areaHa ?? 0

const memo = new Map<string, Facets>()

export function facetsFor(parkId: string): Facets {
  const hit = memo.get(parkId)
  if (hit) return hit
  const spots = amenitiesFor(parkId)
  const info = PARK_INFO[parkId]
  const playground = spots.some((a) => !isFood(a.kind)) || !!info?.amenities?.playground?.has
  const food = spots.some((a) => isFood(a.kind)) || !!info?.amenities?.food?.has
  const parking = (PARKING[parkId]?.length ?? 0) > 0
  const transit = !!TRANSIT[parkId]
  const points = trailsFor(parkId).filter((t) => t.kind === 'points')
  const loopMin = points.length ? Math.min(...points.map((t) => t.min)) : null
  const quickLoop = loopMin != null ? loopMin <= 40 : (AREA[parkId] ?? 99) <= 12
  const out: Facets = { playground, food, parking, transit, loopMin, quickLoop }
  memo.set(parkId, out)
  return out
}
