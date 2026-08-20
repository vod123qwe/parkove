import type { ParkProgress } from './state'
import { questForPark } from './data/quests'

/**
 * A park is finished when every point in it has been collected. A park with no
 * quest has nothing to collect, so being there is the whole thing.
 *
 * This is what a stamp is for. Being *in* a park (the map filling in) is a
 * lower bar on purpose: you get the colour for showing up, the sticker for
 * seeing it all.
 */
export function isParkComplete(parkId: string, parks: Record<string, ParkProgress>) {
  const p = parks[parkId]
  if (!p) return false
  const quest = questForPark(parkId)
  if (!quest) return true
  return quest.pois.every((poi) => p.points.includes(poi.id))
}
