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
