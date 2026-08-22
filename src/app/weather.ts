/**
 * Pogoda dla miejsca: teraz i godzina po godzinie do końca dnia.
 *
 * Skąd dane: Open-Meteo. Wybrane świadomie, bo **nie wymaga klucza** ani
 * pośrednika, wysyła nagłówki CORS i jest darmowe do użytku niekomercyjnego.
 * Wszystko inne (OpenWeather, WeatherAPI) wymagałoby klucza, a klucz w
 * statycznej aplikacji jest publiczny i trzeba by go schować w Workerze, jak przy
 * rozpoznawaniu roślin.
 *
 * Offline: każdą odpowiedź trzymamy w localStorage per miejsce. W dolinie bez
 * zasięgu pokazujemy ostatnią znaną prognozę i mówimy wprost, z której godziny
 * pochodzi. Prognoza z rana jest w terenie warta więcej niż puste pole, ale
 * tylko wtedy, gdy widać, że jest stara.
 */

const TTL_MS = 30 * 60 * 1000
const KEY = (parkId: string) => `pk-weather-${parkId}`

export type WeatherHour = {
  /** godzina lokalna, 0 do 23 */
  h: number
  temp: number
  /** szansa opadu w procentach */
  rain: number
  code: number
}

export type Weather = {
  now: { temp: number; feels: number; wind: number; code: number }
  hours: WeatherHour[]
  /** kiedy dane zostały pobrane */
  at: number
  /** true, gdy pokazujemy zapas z pamięci, bo sieci nie było */
  stale?: boolean
}

type Raw = {
  current?: {
    temperature_2m: number
    apparent_temperature: number
    wind_speed_10m: number
    weather_code: number
  }
  hourly?: {
    time: string[]
    temperature_2m: number[]
    precipitation_probability: number[]
    weather_code: number[]
  }
}

function shape(raw: Raw): Weather | null {
  const c = raw.current
  const h = raw.hourly
  if (!c || !h?.time?.length) return null
  return {
    now: {
      temp: Math.round(c.temperature_2m),
      feels: Math.round(c.apparent_temperature),
      wind: Math.round(c.wind_speed_10m),
      code: c.weather_code,
    },
    hours: h.time.map((t, i) => ({
      h: Number(t.slice(11, 13)),
      temp: Math.round(h.temperature_2m[i]),
      rain: h.precipitation_probability?.[i] ?? 0,
      code: h.weather_code[i],
    })),
    at: Date.now(),
  }
}

const cached = (parkId: string): Weather | null => {
  try {
    const raw = localStorage.getItem(KEY(parkId))
    return raw ? (JSON.parse(raw) as Weather) : null
  } catch {
    return null
  }
}

export async function getWeather(
  parkId: string,
  coords: [number, number],
): Promise<Weather | null> {
  const have = cached(parkId)
  if (have && Date.now() - have.at < TTL_MS) return have

  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${coords[1].toFixed(4)}&longitude=${coords[0].toFixed(4)}` +
    '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m' +
    '&hourly=temperature_2m,precipitation_probability,weather_code' +
    '&timezone=Europe%2FWarsaw&forecast_days=1'

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(String(res.status))
    const next = shape((await res.json()) as Raw)
    if (!next) throw new Error('pusta odpowiedź')
    localStorage.setItem(KEY(parkId), JSON.stringify(next))
    return next
  } catch {
    // bez sieci lepszy stary komplet niż nic, byle podpisany godziną
    return have ? { ...have, stale: true } : null
  }
}

/**
 * Kody WMO na słowa i grupy ikon. Grupa, nie ikona: komponent dobiera ikonę z
 * lucide, a tutaj trzymamy sam sens, żeby dane nie zależały od biblioteki.
 */
export type Sky =
  | 'clear'
  | 'mostly-clear'
  | 'cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'downpour'
  | 'snow'
  | 'storm'

const CODES: Array<[number[], Sky, string]> = [
  [[0], 'clear', 'słonecznie'],
  [[1], 'mostly-clear', 'prawie bezchmurnie'],
  [[2], 'cloudy', 'częściowo pochmurno'],
  [[3], 'overcast', 'pochmurno'],
  [[45, 48], 'fog', 'mgła'],
  [[51, 53, 55, 56, 57], 'drizzle', 'mżawka'],
  [[61, 63, 66, 67, 80, 81], 'rain', 'deszcz'],
  [[65, 82], 'downpour', 'ulewa'],
  [[71, 73, 75, 77, 85, 86], 'snow', 'śnieg'],
  [[95, 96, 99], 'storm', 'burza'],
]

export function sky(code: number): { sky: Sky; label: string } {
  for (const [codes, s, label] of CODES) if (codes.includes(code)) return { sky: s, label }
  return { sky: 'overcast', label: 'zmiennie' }
}
