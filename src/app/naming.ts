const DAYS = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']

/**
 * A walk needs a name it can carry into the journal. "Park Jordana" three
 * times over reads like a database; "Jordana, czwartek wieczorem" reads like
 * something that happened.
 */
export function walkName(parkName: string, at = new Date()) {
  const place = parkName.replace(/^(Park|Zalew|Ogród|Planty)\s+/i, '').trim() || parkName
  const h = at.getHours()
  const part = h < 11 ? ' rano' : h < 17 ? '' : ' wieczorem'
  return `${place}, ${DAYS[at.getDay()]}${part}`
}

/*
 * Polska liczba mnoga, w jednym miejscu.
 *
 * Rozsypywało się to po ekranach jako `n < 5 ? 'wyprawy' : 'wypraw'`, i po
 * pierwsze wychodziło z tego „1 wypraw", a po drugie taki skrót łamie się przy
 * 22: „22 wypraw" zamiast „22 wyprawy". Reguła jest prosta i warto ją mieć raz:
 * jeden to liczba pojedyncza, końcówka 2, 3 albo 4 (ale nie 12, 13, 14) to
 * forma mnoga bliska, wszystko inne to dopełniacz.
 */
export function plural(n: number, one: string, few: string, many: string) {
  const abs = Math.abs(n)
  if (abs === 1) return one
  const last = abs % 10
  const teen = abs % 100
  return last >= 2 && last <= 4 && (teen < 12 || teen > 14) ? few : many
}

export const plWyprawy = (n: number) => plural(n, 'wyprawa', 'wyprawy', 'wypraw')
export const plZapisane = (n: number) => plural(n, 'zapisana', 'zapisane', 'zapisanych')
export const plNaklejki = (n: number) => plural(n, 'naklejka', 'naklejki', 'naklejek')
export const plMiejsca = (n: number) => plural(n, 'miejsce', 'miejsca', 'miejsc')
export const plPunkty = (n: number) => plural(n, 'punkt', 'punkty', 'punktów')
export const plRazy = (n: number) => plural(n, 'raz', 'razy', 'razy')
export const plZdjecia = (n: number) => plural(n, 'zdjęcie', 'zdjęcia', 'zdjęć')
export const plWspomnienia = (n: number) => plural(n, 'wspomnienie', 'wspomnienia', 'wspomnień')
export const plNotatki = (n: number) => plural(n, 'notatka', 'notatki', 'notatek')
export const plNagrania = (n: number) => plural(n, 'nagranie', 'nagrania', 'nagrań')
export const plOdpowiedzi = (n: number) => plural(n, 'odpowiedź', 'odpowiedzi', 'odpowiedzi')
