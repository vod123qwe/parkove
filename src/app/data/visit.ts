// Szacowany czas zwiedzania i kilometry do przejścia, per miejsce.
//
// Zastąpiło oceny D/O (decyzja Jarka 2026-08-24: „usuń ocenianie d/o,
// daj jakiś realny szacowany czas"). Liczby biorą się z danych, nie z ocen:
//
//  - miejsce Z TRASĄ: minuty i metry głównej pętli (router już liczy tempo
//    spacerowe), plus 3 minuty postoju na każdy punkt wyprawy;
//  - miejsce BEZ TRASY: obwód z powierzchni (4·√A, czyli obejście kwadratu
//    o tym samym polu), tempo 14 min/km, plus 8 minut na rozejrzenie się
//    i te same postoje. To celowo zgrubne, stąd wszędzie „ok.".

import raw from './parks.json'
import { TRAILS } from './trails'
import { questForPark } from './quests'

const AREA: Record<string, number> = {}
for (const f of (raw as unknown as { features: Array<{ id: string; properties: { areaHa?: number } }> })
  .features) {
  if (f.properties.areaHa) AREA[f.id] = f.properties.areaHa
}

export type VisitEstimate = {
  /** minuty zwiedzania razem z postojami */
  min: number
  /** kilometry do przejścia */
  km: number
  /** true = liczone z powierzchni, nie z realnej trasy */
  rough: boolean
}

const cache = new Map<string, VisitEstimate | null>()

export function visitEstimate(parkId: string): VisitEstimate | null {
  if (cache.has(parkId)) return cache.get(parkId)!
  const ts = TRAILS[parkId] ?? []
  const loop = ts.find((t) => t.kind === 'points') ?? ts[0]
  const stops = questForPark(parkId)?.pois.length ?? 0
  let out: VisitEstimate | null
  if (loop) {
    out = { min: loop.min + stops * 3, km: loop.m / 1000, rough: false }
  } else {
    const ha = AREA[parkId]
    if (!ha) {
      out = null
    } else {
      const km = (4 * Math.sqrt(ha * 10000)) / 1000
      out = { min: Math.round(km * 14 + 8 + stops * 3), km: Math.round(km * 10) / 10, rough: true }
    }
  }
  cache.set(parkId, out)
  return out
}

/** „ok. 40 min", „ok. 1,5 godz.", „ok. 2 godz. 15 min" — zaokrąglane pod ucho */
export function fmtVisitMin(min: number): string {
  if (min < 55) return `ok. ${Math.max(10, Math.round(min / 5) * 5)} min`
  const q = Math.round(min / 15) * 15
  const h = Math.floor(q / 60)
  const m = q % 60
  if (m === 0) return `ok. ${h} godz.`
  if (m === 30) return `ok. ${h},5 godz.`
  return `ok. ${h} godz. ${m} min`
}

/** „2,8 km", od 10 km bez miejsca po przecinku */
export function fmtKm(km: number): string {
  if (km >= 9.95) return `${Math.round(km)} km`
  return `${(Math.round(km * 10) / 10).toFixed(1).replace('.', ',')} km`
}
