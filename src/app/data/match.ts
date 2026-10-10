/**
 * Podpowiadacz wypraw: trzynaście kart w dwóch fazach, na końcu najwyżej trzy miejsca.
 *
 * Pomysł Jarka (2026-09-05): lista urosła do kilkudziesięciu miejsc i wybór
 * przestał być łatwy, a przewijanie kafelków nie pomaga, bo kafelek nie wie,
 * ile masz dziś czasu i z kim idziesz. Zamiast filtrów odpowiadasz na kilka
 * pytań, przesuwając karty w prawo albo w lewo, a apka liczy dopasowanie.
 *
 * Dlaczego najwyżej trzy wyniki: przy dłuższej liście wracamy do tego samego
 * problemu, od którego uciekamy. Trzy propozycje da się porównać w głowie.
 *
 * Skąd cechy miejsc: WYŁĄCZNIE z danych, które już mamy. Rodzaj miejsca i
 * powierzchnia z parks.json, czas i długość trasy z visit.ts, tematy z
 * kategorii punktów wyprawy, plac zabaw i jedzenie z parkinfo.ts. Nic nie jest
 * wpisane ręcznie per miejsce, więc nowy park dostaje profil od razu po
 * dodaniu i nie trzeba pamiętać o drugim pliku.
 */

import parksData from './parks.json'
import { QUESTS } from './quests'
import { PARK_INFO } from './parkinfo'
import { visitEstimate } from './visit'
import { countsForKrakow } from './trip'
import { TRANSIT } from './transit'
import { playgroundScore } from './playgrounds'

/** Rynek Główny: od niego liczymy „blisko czy daleko" */
const CENTRE: [number, number] = [19.9366, 50.0619]

export type Feature =
  | 'blisko'
  | 'dlugie'
  | 'dziecko'
  | 'plac'
  | 'tramwaj'
  | 'nowe'
  | 'widok'
  | 'las'
  | 'woda'
  | 'skaly'
  | 'historia'
  | 'kwiaty'
  | 'kameralnie'

/**
 * Dwie fazy pytań. „Dziś" to rzeczy, które zmieniają się z dnia na dzień
 * (czas, towarzystwo, dojazd), „ochota" to gusty, które zmieniają się rzadko.
 * Podział jest po to, żeby kiedyś dało się zapamiętać drugą fazę i przy
 * kolejnym wejściu pytać tylko o pierwszą.
 */
export type Phase = 'dzis' | 'ochota'

export const PHASE_LABEL: Record<Phase, string> = {
  dzis: 'Dziś',
  ochota: 'Na co masz ochotę',
}

export type Question = {
  id: Feature
  phase: Phase
  /** treść karty, w pierwszej osobie: przesuwasz ją albo nie */
  text: string
  /** doprecyzowanie pod spodem, jedno zdanie */
  hint: string
  /** ikona z lucide, nazwa rozwiązywana w komponencie */
  icon: string
  /**
   * Zdjęcie na całą kartę, z public/photos. Świadomie prawdziwe miejsce
   * z Krakowa i okolic, nie ilustracja: karta „chcę być nad wodą" ze zdjęciem
   * Zakrzówka mówi więcej niż piktogram fali i przy okazji obiecuje coś, co
   * naprawdę jest w apce.
   */
  photo: string
}

export const QUESTIONS: Question[] = [
  /* ---- faza 1: dziś ---- */
  {
    id: 'blisko',
    phase: 'dzis',
    text: 'Blisko, bez wyjeżdżania z miasta',
    hint: 'W prawo, jeśli chcesz być na miejscu w kwadrans.',
    icon: 'pin',
    photo: '/photos/park-planty-zzm-1.jpg',
  },
  {
    id: 'dlugie',
    phase: 'dzis',
    text: 'Mam pół dnia albo więcej',
    hint: 'W prawo, jeśli nie spieszysz się do domu.',
    icon: 'clock',
    photo: '/photos/dolina-bedkowska.jpg',
  },
  {
    id: 'dziecko',
    phase: 'dzis',
    text: 'Idziemy z dzieckiem',
    hint: 'Plac zabaw, krótsza trasa i coś do jedzenia w pobliżu.',
    icon: 'child',
    photo: '/photos/park-park-jordana-zzm-1.jpg',
  },
  {
    id: 'plac',
    phase: 'dzis',
    text: 'Duży plac zabaw',
    hint: 'Taki, na którym dziecko zostanie godzinę, nie pięć minut.',
    icon: 'play',
    photo: '/photos/poi-kurdwanow-plac-zabaw.jpg',
  },
  {
    id: 'tramwaj',
    phase: 'dzis',
    text: 'Bez auta, tramwajem albo autobusem',
    hint: 'W lewo, jeśli jedziesz samochodem i parking nie jest problemem.',
    icon: 'tram',
    photo: '/photos/park-planty-bienczyckie-zzm-1.jpg',
  },
  /* ---- faza 2: na co masz ochotę ---- */
  {
    id: 'nowe',
    phase: 'ochota',
    text: 'Coś, gdzie jeszcze nie byłem',
    hint: 'W lewo, jeśli wolisz wrócić w znane miejsce.',
    icon: 'sparkles',
    photo: '/photos/kamionna-b.jpg',
  },
  {
    id: 'widok',
    phase: 'ochota',
    text: 'Chcę widok z góry',
    hint: 'Kopce, wieże, krawędzie dolin.',
    icon: 'mountain',
    photo: '/photos/krakus-szczyt.jpg',
  },
  {
    id: 'las',
    phase: 'ochota',
    text: 'Las i cisza',
    hint: 'Bez asfaltu i bez tłumu.',
    icon: 'tree',
    photo: '/photos/park-las-wolski-2.jpg',
  },
  {
    id: 'woda',
    phase: 'ochota',
    text: 'Chcę być nad wodą',
    hint: 'Zalew, staw, rzeka albo źródło.',
    icon: 'waves',
    photo: '/photos/zakrzowek-kapielisko.jpg',
  },
  {
    id: 'skaly',
    phase: 'ochota',
    text: 'Skały i jaskinie',
    hint: 'Wapień, ściany, dziury w ziemi.',
    icon: 'rock',
    photo: '/photos/skalki-grota.jpg',
  },
  {
    id: 'historia',
    phase: 'ochota',
    text: 'Chcę usłyszeć jakąś historię',
    hint: 'Miejsca, w których coś się wydarzyło.',
    icon: 'book',
    photo: '/photos/poi-kopiec-kosciuszki-fort-2.jpg',
  },
  {
    id: 'kwiaty',
    phase: 'ochota',
    text: 'Łąki i kwiaty',
    hint: 'Otwarta przestrzeń, trawa po kolana, motyle.',
    icon: 'flower',
    photo: '/photos/park-laki-nowohuckie-zzm-1.jpg',
  },
  {
    id: 'kameralnie',
    phase: 'ochota',
    text: 'Kameralnie, bez tłumu',
    hint: 'Miejsce, o którym mało kto wie.',
    icon: 'leaf',
    photo: '/photos/zimny-dol-a.jpg',
  },
]

/** profil miejsca: każda cecha w skali od zera do jedynki */
export type Profile = Record<Feature, number>

export type Place = {
  id: string
  name: string
  kind: string
  areaHa: number
  center: [number, number]
  km: number
  minutes: number
  points: number
  profile: Profile
}

const clamp = (n: number) => Math.max(0, Math.min(1, n))

/** kilometry w linii prostej, wystarczające do „blisko czy daleko" */
function distanceKm(a: [number, number], b: [number, number]) {
  const dx = (a[0] - b[0]) * 111.32 * Math.cos((((a[1] + b[1]) / 2) * Math.PI) / 180)
  const dy = (a[1] - b[1]) * 111.32
  return Math.sqrt(dx * dx + dy * dy)
}

/* rodzaje miejsc, pogrupowane tak jak myśli o nich człowiek planujący spacer */
const WILD = new Set(['forest', 'valley', 'nature', 'mountain'])
const HIGH = new Set(['mound', 'mountain'])
const TAME = new Set(['park', 'garden', 'meadow'])

function buildPlaces(): Place[] {
  const out: Place[] = []
  for (const f of parksData.features) {
    if (!countsForKrakow(f as { id: string; properties?: { trip?: string; test?: boolean } })) continue
    const p = f.properties as { id: string; name: string; kind: string; areaHa?: number; center: [number, number] }
    const quest = QUESTS.find((q) => q.parkId === p.id)
    const pois = quest?.pois ?? []
    const cat = (name: string) => pois.filter((x) => x.category === name).length
    const est = visitEstimate(p.id)
    const info = PARK_INFO[p.id]
    const transit = TRANSIT[p.id]
    const km = distanceKm(p.center, CENTRE)
    const minutes = est?.min ?? 45
    const areaHa = p.areaHa ?? 5

    /*
     * Tematy liczymy jako UDZIAŁ punktów danej kategorii, nie ich liczbę.
     * Inaczej miejsce z dziewięcioma punktami wygrywałoby każdą kategorię
     * z miejscem, które ma trzy punkty, ale wszystkie o wodzie.
     */
    const share = (n: number) => (pois.length ? clamp(n / Math.max(3, pois.length)) : 0)

    const profile: Profile = {
      /* pełne dopasowanie do 4 km, zero powyżej 25 */
      blisko: clamp((25 - km) / 21),
      /*
       * „Mam pół dnia" to dwie do czterech godzin. Powyżej tego dopasowanie
       * SPADA, bo dziewięciogodzinna trasa w Dolinie Będkowskiej nie jest
       * lepszą odpowiedzią na dużo czasu, tylko zupełnie inną wyprawą, na
       * którą wychodzi się z plecakiem, a nie po obiedzie.
       */
      dlugie:
        minutes <= 35
          ? 0
          : minutes <= 240
            ? clamp((minutes - 35) / 120)
            : clamp(1 - (minutes - 240) / 260),
      /*
       * Plac zabaw z obrysu w OSM (scripts/build-playgrounds.mjs): 1500 m²
       * daje 0,7, 3000 m² i więcej daje 1, plac bez obrysu 0,35. Kuracja
       * w parkinfo zostaje jako potwierdzenie, nie jako jedyne źródło.
       */
      plac: playgroundScore(p.id),
      dziecko: clamp(
        Math.max(playgroundScore(p.id) * 0.6, info?.amenities?.playground?.has ? 0.5 : 0) +
          (info?.amenities?.food?.has ? 0.15 : 0) +
          (minutes <= 60 ? 0.2 : 0) +
          share(cat('play')) * 0.3 +
          (TAME.has(p.kind) ? 0.1 : 0),
      ),
      widok: clamp(share(cat('view')) + (HIGH.has(p.kind) ? 0.5 : 0)),
      woda: clamp(share(cat('water')) + (p.kind === 'water' ? 0.5 : 0)),
      historia: clamp(share(cat('history')) + share(cat('monument')) * 0.7),
      las: clamp(
        (WILD.has(p.kind) ? 0.55 : 0) +
          (p.kind === 'forest' ? 0.2 : 0) +
          share(cat('nature')) * 0.4 +
          clamp(areaHa / 200) * 0.25,
      ),
      skaly: clamp(share(cat('cave')) + share(cat('climb')) * 0.8),
      /*
       * Dojazd komunikacją: TRANSIT ma sprawdzone wpisy tylko dla sześciu
       * miejsc, a dolinki nie mają żadnego, bo nikt nie sprawdził numerów
       * linii. Dlatego wpis daje pełne dopasowanie, a samo położenie
       * w mieście (do 9 km od Rynku) daje częściowe: w Krakowie prawie
       * wszędzie dojedziesz, tylko nie wiemy jeszcze czym.
       */
      tramwaj: transit ? (transit.mode === 'bus' ? 0.85 : 1) : km <= 9 ? 0.6 : 0,
      kwiaty: clamp(
        (p.kind === 'meadow' ? 0.7 : 0) +
          (p.kind === 'garden' ? 0.5 : 0) +
          (p.kind === 'nature' ? 0.3 : 0) +
          share(cat('meadow')) * 0.8,
      ),
      /*
       * Kameralność nie jest w danych wprost, więc liczymy ją z tego, co
       * zwykle ściąga tłum: bliskość centrum i duży, znany park. Daleko
       * i mało znaczy spokojnie. To przybliżenie, więc w powodach nazywamy
       * je ostrożnie.
       */
      kameralnie: clamp(
        (1 - clamp((25 - km) / 21)) * 0.55 + (WILD.has(p.kind) ? 0.3 : 0) + (areaHa < 30 ? 0.15 : 0),
      ),
      /* wypełniane przy liczeniu wyniku, bo zależy od stanu gry */
      nowe: 0,
    }
    out.push({
      id: p.id,
      name: p.name,
      kind: p.kind,
      areaHa,
      center: p.center,
      km: Math.round(km * 10) / 10,
      minutes,
      points: pois.length,
      profile,
    })
  }
  return out
}

let cached: Place[] | null = null
export const allPlaces = (): Place[] => (cached ??= buildPlaces())

export type Answer = 'yes' | 'no' | 'skip'

export type Match = {
  place: Place
  score: number
  /** krótkie powody, po których widać, dlaczego to wyszło */
  reasons: string[]
}

/** etykiety powodów, w tej samej kolejności co pytania */
const REASON: Record<Feature, string> = {
  blisko: 'blisko',
  dlugie: 'na dłużej',
  dziecko: 'z dzieckiem',
  plac: 'duży plac zabaw',
  widok: 'widoki',
  woda: 'woda',
  historia: 'historia',
  las: 'las i cisza',
  skaly: 'skały',
  nowe: 'jeszcze tam nie byłeś',
  tramwaj: 'dojedziesz komunikacją',
  kwiaty: 'łąki',
  kameralnie: 'kameralnie',
}

/** powód odwrotny: „nie" też coś znaczy i warto to pokazać */
const REASON_NO: Partial<Record<Feature, string>> = {
  blisko: 'wyjazd za miasto',
  dlugie: 'krótko',
  nowe: 'znane miejsce',
  kameralnie: 'popularne',
}

/**
 * Dopasowanie.
 *
 * „Nie" waży mniej niż „tak" (0,6 zamiast 1), bo odrzucenie jednej rzeczy nie
 * jest tak mocną deklaracją jak wybranie innej: człowiek przesuwa w lewo
 * także wtedy, gdy mu wszystko jedno. Twardego odrzucania nie ma wcale, żeby
 * dwa sprzeczne „tak" nie zostawiły pustej listy.
 */
export function match(answers: Partial<Record<Feature, Answer>>, visited: Set<string>, limit = 3): Match[] {
  const places = allPlaces()
  const scored = places.map((place) => {
    const profile: Profile = { ...place.profile, nowe: visited.has(place.id) ? 0 : 1 }
    let score = 0
    const hits: Array<{ text: string; weight: number }> = []
    for (const q of QUESTIONS) {
      const a = answers[q.id]
      if (!a || a === 'skip') continue
      const value = profile[q.id]
      if (a === 'yes') {
        score += value
        if (value >= 0.5) hits.push({ text: REASON[q.id], weight: value })
      } else {
        score += (1 - value) * 0.6
        const label = REASON_NO[q.id]
        if (label && value <= 0.35) hits.push({ text: label, weight: (1 - value) * 0.6 })
      }
    }
    /*
     * Drobna premia za miejsce, które ma co opowiedzieć. Bez niej przy
     * odpowiedziach typu „byle blisko" wygrywał pusty skwer nad parkiem
     * z pięcioma punktami, a to nie jest podpowiedź, tylko najbliższa trawa.
     */
    score += Math.min(place.points, 5) * 0.05
    const reasons = hits
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((h) => h.text)
    return { place, score, reasons }
  })
  return scored.sort((a, b) => b.score - a.score).slice(0, limit)
}
