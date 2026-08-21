import type { ParkProgress } from './state'
import { questForPark } from './data/quests'

/**
 * One definition of a stamp for the whole app: a place is finished when it has
 * given up as many points as it asks for. Normally that is all of them. A place
 * too big for one visit can ask for fewer (`stampAt`) and keep the rest as a
 * reason to come back. A place with no quest has nothing to collect, so being
 * there is the whole thing.
 *
 * Being *in* a place is a lower bar on purpose: you get the colour on the map
 * for showing up, the sticker for the walk.
 */
export function isParkComplete(parkId: string, parks: Record<string, ParkProgress>) {
  const p = parks[parkId]
  if (!p) return false
  const quest = questForPark(parkId)
  if (!quest) return true
  const mine = quest.pois.filter((poi) => p.points.includes(poi.id)).length
  const need = Math.min(quest.stampAt ?? quest.pois.length, quest.pois.length)
  return mine >= need
}
