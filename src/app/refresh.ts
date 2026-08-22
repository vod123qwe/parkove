import { VERSION } from '../changelog'

/** klucz sesji: wersja, z której odchodzimy, żeby po przeładowaniu mieć z czym porównać */
export const REFRESH_FROM = 'pk-refresh-from'

/**
 * Ręczne odświeżenie wersji.
 *
 * Powód: service worker podaje pliki z pamięci i dopiero w tle bierze nowe, więc
 * pierwsze otwarcie po wdrożeniu pokazuje starą wersję. Na komputerze tego nie
 * widać, bo dev server nie ma workera. Na telefonie widać i to właśnie dlatego
 * poprawki „nie docierały".
 *
 * Co robi: prosi workera o sprawdzenie aktualizacji, czyści pamięć powłoki i
 * plików aplikacji, ale ZOSTAWIA kafle mapy, bo to one są kosztowne w terenie i
 * nie zmieniają się przy wdrożeniu. Potem przeładowuje stronę.
 */
export async function refreshVersion() {
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    await reg?.update()
  } catch {
    // brak workera: przeładowanie i tak weźmie nowe pliki
  }
  try {
    for (const key of await caches.keys()) {
      /*
       * Kafle i pobrane mapy zostaja. Kafle, bo sa kosztowne w terenie i
       * wdrozenie ich nie zmienia. Paczki offline, bo to 15 MB swiadomej pracy
       * uzytkownika: pierwsza wersja tego warunku patrzyla tylko na 'tiles' i
       * odswiezenie wersji CICHO kasowalo wszystko, co pobral przed wyprawa.
       */
      if (key.includes('tiles') || key.includes('packs')) continue
      await caches.delete(key)
    }
  } catch {
    // brak Cache API: zostaje samo przeładowanie
  }
  /* wersja sprzed przeładowania: po starcie porównamy ją z nową i powiemy wprost,
     czy coś przyszło, czy nie ma zmian. sessionStorage, bo to informacja na jedno
     przeładowanie, a nie stan aplikacji */
  try {
    sessionStorage.setItem(REFRESH_FROM, VERSION)
  } catch {
    // brak sessionStorage: po prostu nie pokażemy podsumowania
  }
  // cache-busting w adresie, żeby nawet pamięć przeglądarki oddała nowy dokument
  const url = new URL(window.location.href)
  url.searchParams.set('v', String(Date.now()))
  window.location.replace(url.toString())
}
