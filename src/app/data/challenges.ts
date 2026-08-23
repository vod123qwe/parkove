/*
 * Wyzwania.
 *
 * Zastąpiły Album w menu (Jarek: „zamiast albumu powinny być wyzwania"), a
 * pieczątki miejsc nie zniknęły: leżą sekcją na dole tego samego ekranu. Jedna
 * półka odpowiada więc na całe pytanie „co zdobyłem", a pieczątka zostaje tym,
 * czym była, czyli tożsamością miejsca, a nie nagrodą za wyzwanie.
 *
 * Zasada, na której stoi cały ten plik: **nic nie liczymy osobno**. Każde
 * wyzwanie jest funkcją tego, co apka i tak wie, czyli odwiedzin, punktów,
 * wypraw, zdjęć, notatek, nagrań i odpowiedzi na dylematy. Dzięki temu nie ma
 * czego zapominać, nie ma czego psuć przy migracji i wyzwania **działają wstecz**:
 * to, co przeszliście przed ich wprowadzeniem, liczy się od pierwszego wejścia.
 *
 * Lista jest **stała i nic na niej nie wygasa** (decyzja Jarka). Przy dziecku to
 * ważne: wyzwanie, które przepada w niedzielę, zamienia zabawę w obowiązek, a
 * tutaj można wrócić po miesiącu i po prostu doliczyć swoje.
 */

import { QUESTS, questForPark } from './quests'
import type { PoiCategory } from './quests'
import parksData from './parks.json'

const FEATURES = (
  parksData as { features: Array<{ id: string; properties: { name: string; kind: string } }> }
).features

export type ChallengeGroup = 'places' | 'points' | 'walks' | 'marks'

export const GROUP_LABEL: Record<ChallengeGroup, string> = {
  places: 'Miejsca',
  points: 'Punkty',
  walks: 'Wyprawy',
  marks: 'Ślady',
}

/** wszystko, z czego wyzwania czytają: dokładnie stan gry i nic ponad to */
export type ChallengeInput = {
  parks: Record<string, { visits: number; lastAt: string; points: string[] }>
  journeys: Array<{
    parkId: string
    startedAt: number
    endedAt: number
    distanceM: number
    points: string[]
  }>
  answers: Record<string, number>
  marks: Array<{ kind: string; parkId: string; poiId?: string }>
}

export type Challenge = {
  id: string
  group: ChallengeGroup
  name: string
  /** jedno zdanie: co dokładnie trzeba zrobić */
  hint: string
  target: number
  /** ile już jest; nigdy nie przekracza target po zaokrągleniu w górę */
  count: (s: ChallengeInput) => number
  /** dla wyzwań „przejdź X km" i podobnych: pokaż postęp w innych jednostkach */
  unit?: 'km' | 'h'
}

const kindOf = (id: string) => FEATURES.find((f) => f.id === id)?.properties.kind ?? 'park'

/** ile punktów danej kategorii odkryto we wszystkich miejscach razem */
function byCategory(s: ChallengeInput, cat: PoiCategory) {
  let n = 0
  for (const [parkId, p] of Object.entries(s.parks)) {
    const quest = questForPark(parkId)
    if (!quest) continue
    for (const poi of quest.pois) if (poi.category === cat && p.points.includes(poi.id)) n++
  }
  return n
}

/** miejsca, w których odkryto WSZYSTKIE punkty, a nie tylko próg na pieczątkę */
function fullPlaces(s: ChallengeInput) {
  let n = 0
  for (const q of QUESTS) {
    const got = s.parks[q.parkId]?.points.length ?? 0
    if (q.pois.length > 0 && got >= q.pois.length) n++
  }
  return n
}

const hours = (j: ChallengeInput['journeys'][number]) => (j.endedAt - j.startedAt) / 3600000

export const CHALLENGES: Challenge[] = [
  /* ---- miejsca: po co w ogóle wychodzić z domu ---- */
  {
    id: 'places-5',
    group: 'places',
    name: 'Pięć miejsc',
    hint: 'Zamelduj się w pięciu różnych miejscach.',
    target: 5,
    count: (s) => Object.keys(s.parks).length,
  },
  {
    id: 'places-15',
    group: 'places',
    name: 'Piętnaście miejsc',
    hint: 'To już połowa Krakowa z tej listy.',
    target: 15,
    count: (s) => Object.keys(s.parks).length,
  },
  {
    id: 'valleys-3',
    group: 'places',
    name: 'Trzy dolinki',
    hint: 'Jura zaczyna się dwadzieścia minut za miastem.',
    target: 3,
    count: (s) => Object.keys(s.parks).filter((id) => kindOf(id) === 'valley').length,
  },
  {
    id: 'valleys-all',
    group: 'places',
    name: 'Wszystkie dolinki',
    hint: 'Siedem dolin Jury Krakowskiej, każda inna.',
    target: FEATURES.filter((f) => f.properties.kind === 'valley').length,
    count: (s) => Object.keys(s.parks).filter((id) => kindOf(id) === 'valley').length,
  },
  {
    id: 'mounds-all',
    group: 'places',
    name: 'Cztery kopce',
    hint: 'Krakus, Wanda, Kościuszko i Piłsudski.',
    target: FEATURES.filter((f) => f.properties.kind === 'mound').length,
    count: (s) => Object.keys(s.parks).filter((id) => kindOf(id) === 'mound').length,
  },
  {
    id: 'again-3',
    group: 'places',
    name: 'Ulubione miejsce',
    hint: 'Wróć do tego samego miejsca trzy razy.',
    target: 3,
    count: (s) => Math.max(0, ...Object.values(s.parks).map((p) => p.visits)),
  },
  {
    id: 'full-1',
    group: 'places',
    name: 'Do ostatniego punktu',
    hint: 'Odkryj wszystkie punkty w jednym miejscu, nie tylko tyle, ile trzeba na pieczątkę.',
    target: 1,
    count: fullPlaces,
  },

  /* ---- punkty: po co chodzić uważnie ---- */
  {
    id: 'points-10',
    group: 'points',
    name: 'Dziesięć punktów',
    hint: 'Punkt liczy się, gdy podejdziesz wystarczająco blisko.',
    target: 10,
    count: (s) => Object.values(s.parks).reduce((n, p) => n + p.points.length, 0),
  },
  {
    id: 'points-40',
    group: 'points',
    name: 'Czterdzieści punktów',
    hint: 'W apce jest ich ponad sto pięćdziesiąt.',
    target: 40,
    count: (s) => Object.values(s.parks).reduce((n, p) => n + p.points.length, 0),
  },
  {
    id: 'water-5',
    group: 'points',
    name: 'Pięć razy woda',
    hint: 'Wodospady, źródła, stawy i rzeki.',
    target: 5,
    count: (s) => byCategory(s, 'water'),
  },
  {
    id: 'view-5',
    group: 'points',
    name: 'Pięć widoków',
    hint: 'Punkty, z których widać dalej niż z drogi.',
    target: 5,
    count: (s) => byCategory(s, 'view'),
  },
  {
    id: 'cave-2',
    group: 'points',
    name: 'Dwie jaskinie',
    hint: 'W dolinkach jest ich więcej, niż się wydaje.',
    target: 2,
    count: (s) => byCategory(s, 'cave'),
  },
  {
    id: 'climb-3',
    group: 'points',
    name: 'Trzy skały',
    hint: 'Turnie i ostańce, po których chodzą wspinacze.',
    target: 3,
    count: (s) => byCategory(s, 'climb'),
  },
  {
    id: 'history-5',
    group: 'points',
    name: 'Pięć śladów historii',
    hint: 'Grodziska, mury, pomniki i to, co po nich zostało.',
    target: 5,
    count: (s) => byCategory(s, 'history') + byCategory(s, 'monument'),
  },

  /* ---- wyprawy: po co iść dalej ---- */
  {
    id: 'walk-5km',
    group: 'walks',
    name: 'Pięć kilometrów naraz',
    hint: 'W jednej wyprawie, bez wracania do auta.',
    target: 5,
    unit: 'km',
    count: (s) => Math.max(0, ...s.journeys.map((j) => j.distanceM / 1000)),
  },
  {
    id: 'walk-2h',
    group: 'walks',
    name: 'Dwie godziny w terenie',
    hint: 'Jedna wyprawa, od startu do zakończenia.',
    target: 2,
    unit: 'h',
    count: (s) => Math.max(0, ...s.journeys.map(hours)),
  },
  {
    id: 'walk-early',
    group: 'walks',
    name: 'Ranny ptaszek',
    hint: 'Rozpocznij wyprawę przed dziewiątą rano.',
    target: 1,
    count: (s) => s.journeys.filter((j) => new Date(j.startedAt).getHours() < 9).length,
  },
  {
    id: 'walk-evening',
    group: 'walks',
    name: 'Wieczorem',
    hint: 'Rozpocznij wyprawę po osiemnastej.',
    target: 1,
    count: (s) => s.journeys.filter((j) => new Date(j.startedAt).getHours() >= 18).length,
  },
  {
    id: 'walk-10',
    group: 'walks',
    name: 'Dziesięć wypraw',
    hint: 'Każda zapisuje się sama, gdy ją zakończysz.',
    target: 10,
    count: (s) => s.journeys.length,
  },
  {
    id: 'walk-total-50',
    group: 'walks',
    name: 'Pięćdziesiąt kilometrów razem',
    hint: 'Wszystkie wyprawy zliczone.',
    target: 50,
    unit: 'km',
    count: (s) => s.journeys.reduce((n, j) => n + j.distanceM / 1000, 0),
  },
  {
    id: 'walk-weekend',
    group: 'walks',
    name: 'Dwa dni pod rząd',
    /*
     * Treść mówiła „w sobotę i w niedzielę", a kod przyjmuje DOWOLNE dwa dni z
     * rzędu, tak jak mówi nazwa. Poprawiam treść, nie kod: warunek jest lepszy
     * niż obietnica, bo weekend to nie jedyny sposób na dwa dni pod rząd, a przy
     * dziecku wtorek i środa liczą się tak samo.
     */
    hint: 'Wyprawa dwa dni z rzędu, w dowolne dni tygodnia.',
    target: 1,
    count: (s) => {
      /*
       * Dzień LOKALNY, nie UTC. Przy dzieleniu znacznika przez dobę granica dnia
       * wypada o drugiej w nocy naszego czasu, więc wyprawa zaczęta o pierwszej
       * należała do dnia poprzedniego i para dni się nie schodziła. Zdarza się
       * to rzadko, ale kiedy się zdarzy, wyzwanie po prostu nie zapala się bez
       * powodu widocznego dla nikogo.
       *
       * Doba następna przez setDate, a nie przez dodanie 86 400 000: przy zmianie
       * czasu doba ma 23 albo 25 godzin i arytmetyka na milisekundach rozjeżdża
       * się właśnie w ten weekend, w który najłatwiej pójść dwa dni pod rząd.
       */
      const key = (d: Date) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
      const days = new Set(s.journeys.map((j) => key(new Date(j.startedAt))))
      for (const j of s.journeys) {
        const next = new Date(j.startedAt)
        next.setDate(next.getDate() + 1)
        if (days.has(key(next))) return 1
      }
      return 0
    },
  },

  /* ---- ślady: po co to zapisywać ---- */
  {
    id: 'photos-10',
    group: 'marks',
    name: 'Dziesięć zdjęć',
    hint: 'Zdjęcie z wyprawy zostaje przypięte tam, gdzie je zrobiłeś.',
    target: 10,
    count: (s) => s.marks.filter((m) => m.kind === 'photo').length,
  },
  {
    id: 'voice-1',
    group: 'marks',
    name: 'Głos z wyprawy',
    hint: 'Nagraj cokolwiek: szum wody, wiatr, dziecko.',
    target: 1,
    count: (s) => s.marks.filter((m) => m.kind === 'audio').length,
  },
  {
    id: 'notes-3',
    group: 'marks',
    name: 'Trzy notatki',
    hint: 'Jedno zdanie, żeby za rok wiedzieć, jak było.',
    target: 3,
    count: (s) => s.marks.filter((m) => m.kind === 'note').length,
  },
  {
    id: 'marks-3-places',
    group: 'marks',
    name: 'Ślad w trzech miejscach',
    hint: 'Zdjęcie, notatka albo nagranie w trzech różnych miejscach.',
    target: 3,
    count: (s) => new Set(s.marks.filter((m) => m.kind !== 'car').map((m) => m.parkId)).size,
  },
  {
    id: 'dilemmas-5',
    group: 'marks',
    name: 'Pięć dylematów',
    hint: 'Pytania bez dobrej odpowiedzi, przy punktach, w których je zadaliśmy.',
    target: 5,
    count: (s) => Object.keys(s.answers).length,
  },
]

export type ChallengeState = Challenge & { got: number; done: boolean }

/**
 * Stan wszystkich wyzwań. Skończone idą na koniec swojej grupy, a w środku
 * grupy najbliższe końca są najwyżej: to jedyna kolejność, która odpowiada na
 * pytanie „co mogę zrobić w ten weekend".
 */
export function challengeStates(s: ChallengeInput): ChallengeState[] {
  return CHALLENGES.map((c) => {
    const got = Math.max(0, c.count(s))
    return { ...c, got, done: got >= c.target }
  }).sort((a, b) => {
    if (a.group !== b.group) return 0
    if (a.done !== b.done) return a.done ? 1 : -1
    return b.got / b.target - a.got / a.target
  })
}
