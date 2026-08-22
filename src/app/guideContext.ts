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

import parksData from './data/parks.json'
import { distanceM, distanceToParkM, formatDistance } from './geo'
import type { Pt } from './geo'
import { AMENITIES, KIND_LABEL } from './data/amenities'
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

/* obrys i nazwa: tyle nam trzeba z parks.json */
type Feature = { properties: { name: string }; geometry: unknown }

/**
 * Najbliższe miejsca wokół Ciebie, licząc do granicy, nie do środka.
 *
 * To odpowiedź na pytanie „co jest dookoła mnie", którego wcześniej nie dało się
 * zadać: kontekst znał tylko punkty jednego wybranego parku. Liczymy do granicy,
 * bo do dużej doliny wchodzi się bokiem, a nie przez środek, i dystans do środka
 * kłamałby o kilometr.
 */
function nearbyPlaces(here: Pt, limit = 6) {
  return (parksData as unknown as { features: Feature[] }).features
    .map((f) => ({
      name: f.properties.name,
      m: distanceToParkM(here, f.geometry as never),
    }))
    .sort((a, b) => a.m - b.m)
    .slice(0, limit)
}

/**
 * Udogodnienia wokół Ciebie: place zabaw, kawiarnie, jedzenie, bez względu na to,
 * do którego parku należą w danych.
 *
 * Powód wprost z terenu (Jarek, 2026-08-22): zapytał, gdzie obok jest plac
 * zabaw, stojąc daleko od jakiegokolwiek parku. Przewodnik znał jego pozycję, ale
 * nie miał w kontekście ani jednego placu zabaw, więc odesłał go do parku i
 * kazał szukać samemu, a dwa place były niedaleko. Nie chciał ukryć: on tego po
 * prostu nie wiedział.
 */
function nearbyAmenities(here: Pt, limit = 8) {
  const names = new Map(
    (parksData as unknown as { features: Array<{ id: string; properties: { name: string } }> }).features.map(
      (f) => [f.id, f.properties.name],
    ),
  )
  const all: Array<{ name: string; kind: string; where: string; m: number }> = []
  for (const [parkId, spots] of Object.entries(AMENITIES))
    for (const s of spots)
      all.push({
        name: s.name,
        kind: KIND_LABEL[s.kind] ?? s.kind,
        /* przy którym parku stoi: bez tego trzy „Place zabaw" są nierozróżnialne */
        where: names.get(parkId) ?? parkId,
        m: distanceM(here, s.coords),
      })
  return all.sort((a, b) => a.m - b.m).slice(0, limit)
}

export function buildGuideContext(input: GuideInput): { place: string; point: string; story: string } {
  const { parkId, parkName, here, collected, weather, focus } = input
  const quest = parkId ? questForPark(parkId) : null
  const bits: string[] = []

  /* 1. gdzie stoisz: pozycja liczy się także bez wybranego miejsca */
  if (here) {
    const rows = ['GDZIE JESTEM']
    if (input.parkGeometry != null) {
      const away = distanceToParkM(here, input.parkGeometry as never)
      rows.push(
        away > 200
          ? `Do ${parkName ?? 'tego miejsca'}: ${formatDistance(away)} do granicy, jeszcze nie jestem w środku.`
          : `Jestem w środku: ${parkName ?? 'to miejsce'}.`,
      )
    }
    if (quest) {
      const near = quest.pois
        .map((p) => ({ p, d: distanceM(here, p.coords) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
      rows.push(...near.map((n) => `Najbliższy punkt: ${n.p.name}, ${formatDistance(n.d)}.`))
    }
    /*
     * Co jest dookoła, zawsze. Bez tego na pytanie „co mam blisko" model mógł
     * tylko zgadywać, bo znał wyłącznie punkty jednego wybranego parku.
     */
    rows.push(
      'Najbliższe miejsca z aplikacji (licząc do granicy):',
      ...nearbyPlaces(here).map((n) => `- ${n.name}: ${formatDistance(n.m)}`),
    )
    /*
     * Place zabaw i jedzenie wokół, licząc od Ciebie, nie od parku. To jest
     * odpowiedź na „gdzie obok jest plac zabaw", której przewodnik nie potrafił
     * dać, bo w kontekście nie było ani jednego.
     */
    const am = nearbyAmenities(here)
    if (am.length)
      rows.push(
        /*
         * Mówimy wprost, czego w tej liście NIE ma. Inaczej model podaje najbliższy
         * plac zabaw z danych jako „najbliższy w ogóle", a Jarek stał dwie minuty
         * od osiedlowego, którego nigdy nie skatalogowaliśmy.
         */
        'Udogodnienia z aplikacji, licząc od mojej pozycji. UWAGA: to tylko place zabaw i lokale PRZY PARKACH z tej aplikacji. Osiedlowych placów zabaw i zwykłych lokali w mieście tu nie ma, więc jeśli podajesz odległość, dodaj, że mówisz o tych z aplikacji i że bliżej może być coś, czego nie znasz:',
        ...am.map((a) => `- ${a.kind}: ${a.name} (przy ${a.where}), ${formatDistance(a.m)}`),
      )
    bits.push(rows.join('\n'))
  } else {
    bits.push('GDZIE JESTEM\nNie znam pozycji: pytam z domu albo bez zgody na lokalizację.')
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
