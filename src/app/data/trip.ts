/**
 * Wyprawy tymczasowe: miejsca poza Krakowem, wpuszczone do apki na czas testów.
 *
 * Zasada, którą ustalił Jarek: taka wyprawa NIE liczy się do kolekcji Krakowa
 * (procent miasta, plansza odkryć, cele w profilu zostają nietknięte), ale cała
 * reszta mechaniki ma działać normalnie: check-in, punkty, ślad wyprawy,
 * kilometry, dziennik i pieczątka. To dwie różne rzeczy w kodzie, więc da się
 * mieć jedno bez drugiego.
 *
 * Miejsce należy do wyprawy przez `properties.trip` w parks.json, wstawiane
 * przez scripts/trip-odeceixe.mjs. Ten sam skrypt z flagą --remove kasuje
 * wszystko, gdy testy się skończą.
 */

/** aktualnie wpuszczona wyprawa; null, gdy żadnej nie ma */
export const TRIP_ID = 'costa-vicentina'

export const TRIP_NAME = 'Costa Vicentina'

/** przybliżony środek wyprawy: po nim apka poznaje, że jesteś na miejscu */
export const TRIP_CENTER: [number, number] = [-8.785, 37.437]

type ParkLike = { id: string; properties?: { trip?: string; test?: boolean } }

/** czy to miejsce z wyprawy (a nie z kolekcji krakowskiej) */
export const isTripPark = (f: ParkLike) => f.properties?.trip != null

/** poligon testowy: rozpoznajemy po prefiksie, bo nazwa zmienia się co test */
export const isTestPark = (f: ParkLike) => f.id.startsWith('test-') || f.properties?.test === true

/**
 * Czy miejsce liczy się do kolekcji Krakowa. Poligon testowy odpada z tego
 * samego powodu co wyprawa: jest w pliku, ale nie jest miastem. Sprawdzamy
 * prefiks, a nie konkretne id, bo poprzednie („test-piltza") zdążyło już
 * zniknąć, a filtr z jego nazwą został i nic nie robił.
 */
export const countsForKrakow = (f: ParkLike) => !isTestPark(f) && f.properties?.trip == null

const HOME_KEY = 'pk-trip-home'

/**
 * Skąd startuje mapa. Domyślnie Kraków, ale tester wyprawy dostaje link
 * z `?trip=costa-vicentina` i od tej pory apka otwiera się na miejscu, także
 * po zamknięciu i ponownym wejściu. `?trip=off` wraca do Krakowa.
 *
 * Świadomie NIE zgadujemy tego z GPS: pytanie o lokalizację przy starcie
 * jest natrętne, a link działa od razu i da się go wysłać w wiadomości.
 */
export function readTripFromUrl() {
  try {
    const value = new URLSearchParams(window.location.search).get('trip')
    if (value == null) return
    if (value === 'off') localStorage.removeItem(HOME_KEY)
    else if (value === TRIP_ID || value === '1') localStorage.setItem(HOME_KEY, TRIP_ID)
  } catch {
    /* prywatne okno albo zablokowane storage: trudno, zostaje Kraków */
  }
}

export function isTripHome() {
  try {
    return localStorage.getItem(HOME_KEY) === TRIP_ID
  } catch {
    return false
  }
}
