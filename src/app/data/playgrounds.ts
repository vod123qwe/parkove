import data from './playgrounds.json'

/**
 * Place zabaw per miejsce, z rozmiarem. Generowane przez
 * scripts/build-playgrounds.mjs, tu tylko typy i dwa pytania, które zadaje
 * reszta apki: „jest plac?" i „jest DUŻY plac?".
 *
 * Skąd rozmiar: z obrysu placu w OSM. Plac zmapowany jako punkt ma `a: null`,
 * czyli wiemy, że jest, a nie wiemy, jaki duży. Taki plac liczy się do „jest",
 * a nie liczy do „duży", bo nie zgadujemy.
 */

export type PlaygroundSpot = {
  /** [lng, lat] środka placu */
  c: [number, number]
  /** powierzchnia w m²; null, gdy OSM ma plac tylko jako punkt */
  a: number | null
  /** metry od obrysu miejsca; 0 = w środku */
  d: number
  n?: string
}

export type ParkPlaygrounds = {
  n: number
  max: number | null
  sum: number
  big: number
  huge: number
  items: PlaygroundSpot[]
}

type File = {
  generated: string
  bigM2: number
  hugeM2: number
  parks: Record<string, ParkPlaygrounds>
}

/* JSON wnioskuje `c` jako number[], nie parę; stąd przejście przez unknown */
const file = data as unknown as File

/** próg „dużego" placu w m², ten sam co w generatorze */
export const BIG_M2 = file.bigM2
export const HUGE_M2 = file.hugeM2

export const playgroundsFor = (parkId: string): ParkPlaygrounds | null => file.parks[parkId] ?? null

export const hasPlayground = (parkId: string) => (file.parks[parkId]?.n ?? 0) > 0

export const hasBigPlayground = (parkId: string) => (file.parks[parkId]?.big ?? 0) > 0

/**
 * Jedna linijka o placu do karty miejsca: rozmiar największego i ile ich jest.
 * Rozmiar w arach, nie w metrach kwadratowych, bo 5700 m² nic nie mówi,
 * a „57 arów" rodzic porówna z własną działką.
 */
/** polska odmiana: 1 plac, 2 place, 5 placów, 22 place, 25 placów */
const plPlace = (n: number) =>
  n === 1 ? 'plac' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'place' : 'placów'

const plAry = (n: number) =>
  n === 1 ? 'ar' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'ary' : 'arów'

export function playgroundLine(parkId: string): string | null {
  const p = file.parks[parkId]
  if (!p) return null
  const count = p.n > 1 ? `${p.n} ${plPlace(p.n)}` : 'jeden plac'
  if (p.max == null) return count
  const ary = Math.round(p.max / 100)
  const size =
    p.max >= HUGE_M2
      ? `największy ${ary} ${plAry(ary)}`
      : p.max >= BIG_M2
        ? `duży, ${ary} ${plAry(ary)}`
        : `${ary} ${plAry(ary)}`
  return p.n > 1 ? `${count}, ${size}` : size
}

/**
 * 0 do 1: jak bardzo miejsce odpowiada na „chcę duży plac zabaw".
 *
 * Skala jest celowo nieciągła na progu 1500 m²: poniżej najwyżej 0,45,
 * od progu 0,7 w górę. Powód „duży plac zabaw" pokazuje się od 0,5, więc
 * plac o 1000 m² pomaga w dopasowaniu, ale nie dostaje etykiety, na którą
 * nie zasłużył.
 */
export function playgroundScore(parkId: string): number {
  const p = file.parks[parkId]
  if (!p) return 0
  if (p.max == null) return 0.3
  if (p.max >= HUGE_M2) return 1
  if (p.max >= BIG_M2) return 0.7 + (0.3 * (p.max - BIG_M2)) / (HUGE_M2 - BIG_M2)
  return 0.15 + (0.3 * p.max) / BIG_M2
}
