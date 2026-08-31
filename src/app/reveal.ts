import { dayPhase } from './sun'
import type { QuestPoi } from './data/quests'

/**
 * Puenta punktu w wersji na TERAZ.
 *
 * Punkty, które o zachodzie są czymś innym niż w południe, mają drugą wersję
 * w `revealAt`. Porę liczymy z pozycji słońca dla współrzędnych punktu, więc
 * działa to i w Krakowie, i w Portugalii, bez pytania o strefę czasową.
 *
 * Wybór jest cichy: gracz nie widzi, że coś się przełączyło, tylko dostaje
 * tekst pasujący do tego, co ma przed oczami.
 */
export function revealNow(poi: QuestPoi, when: Date = new Date()) {
  if (!poi.revealAt) return poi.reveal
  const phase = dayPhase(poi.coords, when)
  if (phase === 'golden' && poi.revealAt.golden) return poi.revealAt.golden
  if (phase === 'night' && poi.revealAt.night) return poi.revealAt.night
  return poi.reveal
}
