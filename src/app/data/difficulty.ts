/*
 * Dwie osie trudności miejsca, wzięte z Geocachingu i przycięte do Parkove
 * (grill 2026-08-24).
 *
 * D = DOJŚCIE: teren pod nogami i kołami wózka.
 * O = ODKRYWANIE: jak trudno zaliczyć punkty wyprawy.
 *
 * To są dwie różne informacje i mieszanie ich w jedną "trudność" gubi tę
 * najcenniejszą parę: dojście łatwe + odkrywanie trudne, czyli idealną
 * deszczową sobotę.
 *
 * Skąd biorą się oceny: JAREK OCENIA SAM, w aplikacji, w trybie ocen
 * (O aplikacji -> Tryb ocen D i O). Klikane kropki zapisują się jako szkic w
 * localStorage telefonu; przycisk "Kopiuj oceny" oddaje JSON, który wkleja się
 * do DIFFICULTY poniżej i od tego momentu ocena jest w danych na stałe, dla
 * wszystkich urządzeń. Szkic nadpisuje dane statyczne, więc poprawka w terenie
 * działa od razu.
 */
import { useSyncExternalStore } from 'react'

export type DOScore = { d: number; o: number }

/** podpisy poziomów: indeks 0 = ocena 1 */
export const D_HINTS = [
  'płasko, wózek przejedzie',
  'zwykły teren',
  'nierówno albo schody',
  'podejścia',
  'górski charakter',
]
export const O_HINTS = [
  'punkty przy głównej alei',
  'punkty blisko ścieżek',
  'trzeba zboczyć ze ścieżki',
  'trzeba poszukać',
  'łatwo przegapić bez wskazówek',
]

/** oceny na stałe: wypełniane z trybu ocen, wklejką od Jarka */
export const DIFFICULTY: Record<string, DOScore> = {}

const KEY = 'pk-do-draft'
const RATE_KEY = 'pk-rate'
const EVT = 'pk-do-change'

let cache: { raw: string | null; map: Record<string, Partial<DOScore>> } = { raw: '', map: {} }
function readDraft(): Record<string, Partial<DOScore>> {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    /* prywatne okno bez localStorage: po prostu brak szkicu */
  }
  if (raw === cache.raw) return cache.map
  let map: Record<string, Partial<DOScore>> = {}
  try {
    map = raw ? (JSON.parse(raw) as Record<string, Partial<DOScore>>) : {}
  } catch {
    map = {}
  }
  cache = { raw, map }
  return map
}

export const draftScores = () => readDraft()

export function setDraftScore(parkId: string, patch: Partial<DOScore>) {
  const map = { ...readDraft() }
  map[parkId] = { ...map[parkId], ...patch }
  localStorage.setItem(KEY, JSON.stringify(map))
  window.dispatchEvent(new Event(EVT))
}

/**
 * Wartości per oś, także częściowe (0 = jeszcze nie ocenione). Dla edytora.
 * Szkic ma pierwszeństwo przed danymi na stałe.
 */
export function axisValues(parkId: string): DOScore {
  const d = readDraft()[parkId]
  const s = DIFFICULTY[parkId]
  return { d: d?.d ?? s?.d ?? 0, o: d?.o ?? s?.o ?? 0 }
}

/** pełna ocena do pokazywania i filtrów: dopiero gdy OBIE osie są ocenione */
export function getDO(parkId: string): DOScore | null {
  const v = axisValues(parkId)
  return v.d >= 1 && v.o >= 1 ? v : null
}

export const dots = (n: number) => '●'.repeat(Math.max(0, n)) + '○'.repeat(Math.max(0, 5 - n))

/**
 * Zdanie-podpowiedź składane z pary ocen. To jest cała nagroda za dwie osie:
 * para mówi coś, czego żadna oś osobno nie powie.
 */
export function doSentence(sc: DOScore): string | null {
  if (sc.d <= 2 && sc.o >= 4) return '☔ Dojście łatwe, odkrywanie trudne: dobre na deszczową sobotę.'
  if (sc.d >= 4) return 'Dojście wymaga nóg: plan na cały dzień.'
  if (sc.d + sc.o >= 7) return 'Plan na cały dzień.'
  return null
}

/** tryb ocen: zawsze w dev, na telefonie po włączeniu w O aplikacji */
export function rateModeOn(): boolean {
  if (import.meta.env.DEV) return true
  try {
    return localStorage.getItem(RATE_KEY) === 'on'
  } catch {
    return false
  }
}

export function setRateMode(on: boolean) {
  localStorage.setItem(RATE_KEY, on ? 'on' : 'off')
  window.dispatchEvent(new Event(EVT))
}

const subscribe = (cb: () => void) => {
  window.addEventListener(EVT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVT, cb)
    window.removeEventListener('storage', cb)
  }
}
const snapshot = () => {
  try {
    return (localStorage.getItem(KEY) ?? '') + '|' + (localStorage.getItem(RATE_KEY) ?? '')
  } catch {
    return ''
  }
}

/**
 * Wersja szkicu ocen jako string: komponent, który ją czyta, przerysowuje się
 * po każdym kliknięciu kropki i po przełączeniu trybu ocen.
 */
export const useDOVersion = () => useSyncExternalStore(subscribe, snapshot, () => '')
