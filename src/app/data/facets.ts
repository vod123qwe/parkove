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
import { questForPark } from './quests'
import parksData from './parks.json'

export type Facets = {
  playground: boolean
  food: boolean
  parking: boolean
  transit: boolean
  /** najkrótsza policzona trasa punktowa w minutach; null gdy tras nie ma */
  loopMin: number | null
  /** miejsce jest o wodzie: rodzaj water albo punkty wyprawy kategorii water */
  water: boolean
  /** istnieje ręcznie prowadzona pętla wokół (id wokol / wokol-wody) */
  ringLoop: boolean
  /**
   * "Da się obskoczyć szybko": trasa do 40 minut, a gdy miejsce nie ma
   * policzonych tras (małe parki), zastępczo powierzchnia do 12 ha. Bez tego
   * zapasu filtr Deszczowa sobota karałby małe parki za to, że są za małe na
   * generowanie tras.
   */
  quickLoop: boolean
}

const AREA: Record<string, number> = {}
const KIND: Record<string, string> = {}
for (const f of (
  parksData as { features: Array<{ id: string; properties: { areaHa?: number; kind?: string } }> }
).features) {
  AREA[f.id] = f.properties.areaHa ?? 0
  KIND[f.id] = f.properties.kind ?? 'park'
}

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
  const trails = trailsFor(parkId)
  const points = trails.filter((t) => t.kind === 'points')
  const loopMin = points.length ? Math.min(...points.map((t) => t.min)) : null
  const quickLoop = loopMin != null ? loopMin <= 40 : (AREA[parkId] ?? 99) <= 12
  const water =
    KIND[parkId] === 'water' || !!questForPark(parkId)?.pois.some((q) => q.category === 'water')
  const ringLoop = trails.some((t) => t.id === 'wokol' || t.id === 'wokol-wody')
  const out: Facets = { playground, food, parking, transit, loopMin, water, ringLoop, quickLoop }
  memo.set(parkId, out)
  return out
}
