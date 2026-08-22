/**
 * Co przewodnik wie o Tobie, kiedy pytasz.
 *
 * To jest różnica między przewodnikiem a wyszukiwarką. Wyszukiwarka odpowiada na
 * pytanie. Przewodnik odpowiada na pytanie osoby, która stoi w konkretnym
 * miejscu, ma za sobą pół trasy i widzi zbierające się chmury. Dlatego zbieramy
 * cztery rzeczy (decyzja Jarka 2026-08-22): gdzie stoisz i co jest najbliżej, co
 * już zebrałeś i co zostało, pogodę na dziś, oraz treść punktów tego miejsca.
 *
 * Kontekst budujemy jako zwykły tekst, nie JSON: model czyta go lepiej, a przy
 * okazji widać w logu Workera dokładnie to, co dostał.
 */

import { distanceM, distanceToParkM, formatDistance } from './geo'
import type { Pt } from './geo'
import { questForPark } from './data/quests'
import type { QuestPoi } from './data/quests'
import { stampNeed } from './progress'
import { bestWindow, sky } from './weather'
import type { Weather } from './weather'

export type GuideInput = {
  /** miejsce, o którym rozmawiamy: park wyprawy albo wybrany na mapie */
  parkId: string | null
  parkName: string | null
  parkGeometry?: unknown
  /** twoja pozycja, gdy jest */
  here: Pt | null
  /** punkty już zdobyte w tym miejscu */
  collected: Set<string>
  /** pogoda tego miejsca, gdy pobrana */
  weather: Weather | null
  /** punkt, o który pytasz wprost (wejście z karty punktu) */
  focus?: QuestPoi | null
}

/** krótki opis jednego punktu: nazwa, kategoria i jedno zdanie */
const line = (p: QuestPoi, got: boolean) =>
  `- ${p.name}${got ? ' (już zdobyty)' : ''}: ${p.teaser}`

export function buildGuideContext(input: GuideInput): { place: string; point: string; story: string } {
  const { parkId, parkName, here, collected, weather, focus } = input
  const quest = parkId ? questForPark(parkId) : null
  const bits: string[] = []

  /* 1. gdzie stoisz i co jest najbliżej */
  if (here && quest) {
    const near = quest.pois
      .map((p) => ({ p, d: distanceM(here, p.coords) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
    const away =
      input.parkGeometry != null ? distanceToParkM(here, input.parkGeometry as never) : null
    bits.push(
      [
        'GDZIE JESTEM',
        away != null && away > 200
          ? `Jeszcze nie w miejscu: ${formatDistance(away)} do granicy.`
          : 'Jestem na miejscu.',
        ...near.map((n) => `Najbliżej: ${n.p.name}, ${formatDistance(n.d)}.`),
      ].join('\n'),
    )
  } else if (!here) {
    bits.push('GDZIE JESTEM\nBrak pozycji, pytam z domu albo bez sygnału.')
  }

  /* 2. postęp: co zebrane, ile do pieczątki */
  if (quest) {
    const need = parkId ? stampNeed(parkId) : quest.pois.length
    const got = quest.pois.filter((p) => collected.has(p.id)).length
    const left = quest.pois.filter((p) => !collected.has(p.id)).map((p) => p.name)
    bits.push(
      [
        'MÓJ POSTĘP',
        `Zdobyte punkty: ${got} z ${quest.pois.length}. Pieczątka należy się po ${need}.`,
        left.length ? `Zostały: ${left.join(', ')}.` : 'Wszystkie punkty zdobyte.',
      ].join('\n'),
    )
  }

  /* 3. pogoda: to, co i tak mamy pobrane */
  if (weather) {
    const now = sky(weather.now.code)
    const win = bestWindow(weather.hours, new Date().getHours())
    bits.push(
      [
        'POGODA DZIŚ',
        `Teraz ${weather.now.temp} stopni, ${now.label}, wiatr ${weather.now.wind} km/h.`,
        win
          ? win.kind === 'wet'
            ? `Deszcz prawie cały dzień, najmniej między ${win.from} a ${win.to}.`
            : `Najlepsza pora: między ${win.from} a ${win.to}, ${win.tempMin} do ${win.tempMax} stopni.`
          : '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  /* 4. treść punktów tego miejsca, żeby model trzymał się tego, co sprawdzone */
  if (quest) {
    bits.push(
      ['PUNKTY TEGO MIEJSCA', ...quest.pois.map((p) => line(p, collected.has(p.id)))].join('\n'),
    )
  }

  /*
   * Punkt, o który pytam wprost, dostaje pełny opis. Reszta zostaje skrótami:
   * inaczej kontekst rośnie do kilkunastu tysięcy znaków i model gubi pytanie.
   */
  if (focus) {
    bits.push(
      [
        `O TYM PUNKCIE PYTAM: ${focus.name}`,
        ...focus.description,
        ...(focus.long ?? []),
        focus.legend?.length ? `Legenda (podanie, nie fakt): ${focus.legend.join(' ')}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  return {
    place: parkName ?? '',
    point: focus?.name ?? '',
    story: bits.join('\n\n').slice(0, 5800),
  }
}
