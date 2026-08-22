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
      if (key.includes('tiles')) continue
      await caches.delete(key)
    }
  } catch {
    // brak Cache API: zostaje samo przeładowanie
  }
  // cache-busting w adresie, żeby nawet pamięć przeglądarki oddała nowy dokument
  const url = new URL(window.location.href)
  url.searchParams.set('v', String(Date.now()))
  window.location.replace(url.toString())
}
