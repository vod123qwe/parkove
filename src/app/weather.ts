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

/* ---------- kiedy iść ---------- */

export type Window = {
  from: number
  to: number
  /** największa szansa opadu w oknie */
  rain: number
  tempMin: number
  tempMax: number
  /** 'dry' cały pozostały dzień spokojny, 'best' jest lepsza pora, 'wet' wszędzie leje */
  kind: 'dry' | 'best' | 'wet'
}

const DRY = 30
const DAY_START = 7
const DAY_END = 20

/**
 * Najlepsza pora na wyjście dzisiaj.
 *
 * Prognoza godzina po godzinie odpowiada na pytanie „jak będzie", ale nie na
 * „o której wyjść", bo trzeba ją przeczytać i porównać. Tu robimy to za ciebie:
 * szukamy najdłuższego ciągu godzin z szansą opadu poniżej trzydziestu procent,
 * w granicach dnia. Gdy takiego ciągu nie ma, mówimy wprost, że wszędzie leje, i
 * podajemy porę najmniej mokrą, bo to nadal jest odpowiedź.
 *
 * Godziny, które minęły, nie liczą się do niczego: okno zaczyna się najwcześniej
 * teraz.
 */
export function bestWindow(hours: WeatherHour[], nowHour: number): Window | null {
  const pool = hours.filter((h) => h.h >= Math.max(nowHour, DAY_START) && h.h <= DAY_END)
  if (pool.length < 2) return null

  const box = (run: WeatherHour[], kind: Window['kind']): Window => ({
    from: run[0].h,
    to: run[run.length - 1].h,
    rain: Math.max(...run.map((h) => h.rain)),
    tempMin: Math.min(...run.map((h) => h.temp)),
    tempMax: Math.max(...run.map((h) => h.temp)),
    kind,
  })

  /* ciągi suchych godzin */
  const runs: WeatherHour[][] = []
  let cur: WeatherHour[] | null = null
  for (const h of pool) {
    if (h.rain < DRY) {
      if (!cur) {
        cur = []
        runs.push(cur)
      }
      cur.push(h)
    } else {
      cur = null
    }
  }

  if (runs.length) {
    /* najdłuższy, a przy równych najsuchszy */
    const best = runs.sort(
      (a, b) =>
        b.length - a.length ||
        Math.max(...a.map((h) => h.rain)) - Math.max(...b.map((h) => h.rain)),
    )[0]
    return box(best, best.length === pool.length ? 'dry' : 'best')
  }

  /* nigdzie nie jest sucho: podaj najmniej mokre dwie godziny */
  let driest = pool.slice(0, 2)
  for (let i = 0; i + 1 < pool.length; i++) {
    const pair = pool.slice(i, i + 2)
    if (Math.max(...pair.map((h) => h.rain)) < Math.max(...driest.map((h) => h.rain)))
      driest = pair
  }
  return box(driest, 'wet')
}

/* ---------- jedno spojrzenie dla całej listy miejsc ---------- */

const LIST_KEY = 'pk-weather-list'

/** tyle, ile potrzebuje wiersz listy: ile stopni, jakie niebo, czy zmoknę */
export type Glance = {
  temp: number
  code: number
  /** największa szansa opadu w najbliższych sześciu godzinach, w procentach */
  rain: number
}

/**
 * Pogoda dla wszystkich miejsc naraz.
 *
 * Open-Meteo przyjmuje wiele współrzędnych w jednym zapytaniu i odpowiada
 * tablicą w tej samej kolejności. Pięćdziesiąt sześć miejsc to jedno zapytanie,
 * nie pięćdziesiąt sześć: wybierając w niedzielę rano między dolinkami chcesz
 * zobaczyć, gdzie o czternastej nie leje, a nie otwierać pięciu kart po kolei.
 */
export async function getGlances(
  places: Array<{ id: string; coords: [number, number] }>,
): Promise<Record<string, Glance>> {
  try {
    const raw = localStorage.getItem(LIST_KEY)
    if (raw) {
      const box = JSON.parse(raw) as { at: number; data: Record<string, Glance> }
      if (Date.now() - box.at < TTL_MS) return box.data
    }
  } catch {
    /* zepsuty zapis: pytamy od nowa */
  }

  const lat = places.map((p) => p.coords[1].toFixed(3)).join(',')
  const lon = places.map((p) => p.coords[0].toFixed(3)).join(',')
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,weather_code&hourly=precipitation_probability' +
    '&timezone=Europe%2FWarsaw&forecast_days=1'

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(String(res.status))
    const body = (await res.json()) as unknown
    const list = (Array.isArray(body) ? body : [body]) as Array<{
      current?: { temperature_2m: number; weather_code: number }
      hourly?: { precipitation_probability: number[] }
    }>
    const hour = new Date().getHours()
    const data: Record<string, Glance> = {}
    list.forEach((x, i) => {
      const place = places[i]
      if (!place || !x.current) return
      const probs = x.hourly?.precipitation_probability ?? []
      data[place.id] = {
        temp: Math.round(x.current.temperature_2m),
        code: x.current.weather_code,
        rain: Math.max(0, ...probs.slice(hour, hour + 6)),
      }
    })
    localStorage.setItem(LIST_KEY, JSON.stringify({ at: Date.now(), data }))
    return data
  } catch {
    // bez sieci lepiej pokazać stare stopnie niż nic; wiersz i tak jest skrótem
    try {
      const raw = localStorage.getItem(LIST_KEY)
      if (raw) return (JSON.parse(raw) as { data: Record<string, Glance> }).data
    } catch {
      /* nic nie mamy */
    }
    return {}
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
