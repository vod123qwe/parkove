/**
 * Pytania o punkt, na które aplikacja nie zna odpowiedzi.
 *
 * Dlaczego to nie psuje zasady „nigdy nie udawać wiedzy": odpowiedź modelu ma
 * własne pudełko, własną etykietę i własny ton, tak samo jak legendy mają swój
 * krój. Treść, którą sami sprawdziliśmy, i treść, którą zmyśla model, nie mogą
 * wyglądać identycznie, bo wtedy jedna zaraża drugą.
 *
 * Klucz siedzi w Workerze (workers/plant-proxy), a razem z nim instrukcja
 * systemowa: gdyby leżała tutaj, każdy mógłby ją podmienić i użyć naszego klucza
 * do czegokolwiek. Stąd wysyłamy tylko pytanie i kontekst punktu.
 *
 * Sieć jest wymagana. W dolinie bez zasięgu mówimy to wprost.
 */

import { proxyReady, proxyUrl } from './proxy'

const COUNT_KEY = 'pk-ask-count'

export const askEnabled = () => proxyReady()

/** ile pytań zadałeś dziś: licznik lokalny, żeby limit nie był zaskoczeniem */
export function askedToday(): number {
  try {
    const raw = localStorage.getItem(COUNT_KEY)
    if (!raw) return 0
    const box = JSON.parse(raw) as { day: string; n: number }
    return box.day === new Date().toDateString() ? box.n : 0
  } catch {
    return 0
  }
}

function bumpToday() {
  const day = new Date().toDateString()
  const n = askedToday() + 1
  try {
    localStorage.setItem(COUNT_KEY, JSON.stringify({ day, n }))
  } catch {
    /* brak miejsca: licznik to wygoda, nie warunek działania */
  }
  return n
}

export type AskResult = { text?: string; error?: string }

export async function askAbout(
  q: string,
  ctx: { place: string; point: string; story: string },
): Promise<AskResult> {
  if (!askEnabled()) return { error: 'Pytania nie są włączone' }
  if (!navigator.onLine) return { error: 'Bez sieci nie zapytam' }

  let res: Response
  try {
    res = await fetch(proxyUrl('ask'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q, ...ctx, asked: askedToday() }),
    })
  } catch {
    return { error: 'Nie udało się połączyć' }
  }

  const data = (await res.json().catch(() => null)) as AskResult | null
  if (!res.ok || !data?.text) return { error: data?.error ?? 'Coś nie wyszło' }
  bumpToday()
  return { text: data.text }
}
