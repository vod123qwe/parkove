import { useSyncExternalStore } from 'react'

/**
 * Czy jesteśmy w układzie webowym (panel 440 px po lewej, mapa na reszcie).
 *
 * Źródłem prawdy jest JEDNA flaga na dokumencie, `html[data-pk-wide='on']`,
 * ustawiana w app/screen.ts z `matchMedia('(min-width: 900px)')`. CSS celuje
 * w tę flagę, React czyta ją tym hookiem. Dlaczego nie `matchMedia` w każdym
 * komponencie: próg ma być jeden, a do testów na telefonie i w podglądzie
 * musi dać się wymusić (`?wide=on`, `?wide=off`), czego czyste zapytanie
 * medialne nie umie.
 *
 * Mieszka w DS, nie w app, bo korzysta z niego BottomSheet i Modal: to one
 * decydują, czy stać na dole ekranu, czy w lewej kolumnie.
 */

export const WIDE_EVENT = 'pk-wide'

export const isWide = () => document.documentElement.dataset.pkWide === 'on'

const subscribe = (cb: () => void) => {
  window.addEventListener(WIDE_EVENT, cb)
  return () => window.removeEventListener(WIDE_EVENT, cb)
}

export function useWide(): boolean {
  return useSyncExternalStore(subscribe, isWide, () => false)
}
