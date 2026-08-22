import { useEffect } from 'react'

/**
 * Ekran nie gaśnie w trakcie wyprawy.
 *
 * Powód jest twardy: na iOS aplikacja webowa NIE dostaje lokalizacji w tle. Gdy
 * ekran zgaśnie albo schowasz apkę, JavaScript jest wstrzymywany i watchPosition
 * milczy, więc ślad się urywa. Nie da się tego obejść w przeglądarce, można
 * jedynie nie dopuścić do zgaśnięcia ekranu i to robi Screen Wake Lock.
 *
 * Blokada jest zwalniana przez system, gdy karta schodzi w tło, więc po powrocie
 * prosimy o nią jeszcze raz. Kosztuje baterię i to jest świadoma cena: wyprawa z
 * dziurą w śladzie jest gorsza niż wyprawa z rozładowanym telefonem o godzinę
 * wcześniej.
 */
type Sentinel = { released: boolean; release: () => Promise<void> }

export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const api = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<Sentinel> } }).wakeLock
    if (!api) return
    let lock: Sentinel | null = null
    let dead = false

    const grab = async () => {
      if (dead || document.visibilityState !== 'visible') return
      try {
        lock = await api.request('screen')
      } catch {
        // odmowa albo brak baterii: nic nie robimy, ślad po prostu może mieć dziurę
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible' && (!lock || lock.released)) void grab()
    }

    void grab()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      dead = true
      document.removeEventListener('visibilitychange', onVisible)
      void lock?.release().catch(() => {})
    }
  }, [active])
}
