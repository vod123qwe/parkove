import type { Pt } from './geo'

/**
 * Wysokość słońca nad horyzontem, żeby apka wiedziała, o jakiej porze stoisz
 * w danym miejscu.
 *
 * Po co: niektóre punkty wyglądają zupełnie inaczej w złotej godzinie niż
 * w południe, a klif nad oceanem o zachodzie to inne miejsce niż ten sam klif
 * w środku dnia. Punkt może więc mieć drugą wersję puenty, wybieraną po porze.
 *
 * Świadomie NIE liczymy pływów, choć na plaży w ujściu zmieniają więcej niż
 * światło. Przybliżenie pływu wymaga stałych harmonicznych dla konkretnego
 * portu, a model „na oko" mówiłby czasem „odpływ", gdy stoisz po kolana
 * w wodzie. Astronomia jest policzalna z samego czasu i współrzędnych, więc
 * mówimy tylko to, czego jesteśmy pewni.
 *
 * Wzory: standardowy algorytm słoneczny (NOAA), uproszczony do wysokości.
 * Dokładność kilku minut, czyli więcej niż trzeba, żeby odróbnić złotą
 * godzinę od południa.
 */

const rad = Math.PI / 180

/** wysokość słońca w stopniach; ujemna oznacza słońce pod horyzontem */
export function sunAltitude(coords: Pt, when: Date = new Date()) {
  const [lng, lat] = coords
  /* dni od J2000.0 */
  const days = when.getTime() / 86400000 - 10957.5
  const meanAnomaly = (357.5291 + 0.98560028 * days) * rad
  const center =
    (1.9148 * Math.sin(meanAnomaly) +
      0.02 * Math.sin(2 * meanAnomaly) +
      0.0003 * Math.sin(3 * meanAnomaly)) *
    rad
  const eclipticLng = meanAnomaly + center + 102.9372 * rad + Math.PI
  const obliquity = 23.4397 * rad
  const declination = Math.asin(Math.sin(obliquity) * Math.sin(eclipticLng))
  const rightAscension = Math.atan2(
    Math.cos(obliquity) * Math.sin(eclipticLng),
    Math.cos(eclipticLng),
  )
  const siderealTime = (280.16 + 360.9856235 * days) * rad - -lng * rad
  const hourAngle = siderealTime - rightAscension
  const altitude = Math.asin(
    Math.sin(lat * rad) * Math.sin(declination) +
      Math.cos(lat * rad) * Math.cos(declination) * Math.cos(hourAngle),
  )
  return altitude / rad
}

export type DayPhase = 'night' | 'golden' | 'day'

/**
 * Pora dnia w miejscu, w którym stoisz.
 *
 * Progi: złota godzina to słońce między jednym stopniem POD horyzontem
 * (jeszcze się świeci po zachodzie) i ośmioma nad nim. Niżej niż minus jeden
 * jest już noc albo zmierzch, wyżej niż osiem zwykłe światło dnia.
 */
export function dayPhase(coords: Pt, when: Date = new Date()): DayPhase {
  const altitude = sunAltitude(coords, when)
  if (altitude < -1) return 'night'
  if (altitude <= 8) return 'golden'
  return 'day'
}
