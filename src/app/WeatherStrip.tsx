import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  CloudSun,
  Sun,
  Umbrella,
  Wind,
} from 'lucide-react'
import { getWeather, sky } from './weather'
import type { Sky, Weather } from './weather'

/**
 * Pogoda w karcie miejsca: co jest teraz i jak to się zmieni do wieczora.
 *
 * Po co w aplikacji o parkach: to decyzja, czy wychodzić, i o której. Prognoza
 * na cały dzień nie odpowiada na to pytanie tak dobrze jak „za trzy godziny
 * przestanie", dlatego godziny idą pasem, po którym się przewija, a nie jedną
 * liczbą na dzień.
 *
 * Godziny, które już minęły, zostają na pasie wyszarzone. Wiedzieć, że rano
 * lało, też jest informacją: kałuże w dolinie zostają na pół dnia.
 */

const ICONS: Record<Sky, React.ReactNode> = {
  clear: <Sun />,
  'mostly-clear': <CloudSun />,
  cloudy: <CloudSun />,
  overcast: <Cloud />,
  fog: <CloudFog />,
  drizzle: <CloudDrizzle />,
  rain: <CloudRain />,
  downpour: <CloudRainWind />,
  snow: <CloudSnow />,
  storm: <CloudLightning />,
}

const fmtAt = (at: number) =>
  new Date(at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })

export function WeatherStrip({
  parkId,
  coords,
}: {
  parkId: string
  coords: [number, number]
}) {
  const [w, setW] = useState<Weather | null>(null)
  const hoursRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let alive = true
    setW(null)
    void getWeather(parkId, coords).then((next) => {
      if (alive) setW(next)
    })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkId])

  /*
   * Pas zaczyna się na „teraz”, nie o północy. Bez tego pierwsze, co widać, to
   * wyszarzony poranek, czyli godziny, na które i tak nie masz już wpływu.
   * Przewinięcie w lewo wraca do rana, bo to bywa potrzebne: poranne lanie
   * znaczy kałuże po południu.
   */
  useLayoutEffect(() => {
    const box = hoursRef.current
    const now = box?.querySelector('.-now') as HTMLElement | null
    if (box && now) box.scrollLeft = Math.max(0, now.offsetLeft - box.offsetLeft - 6)
  }, [w])

  /* bez danych i bez zapasu nie pokazujemy pustego pudełka */
  if (!w) return null

  const nowSky = sky(w.now.code)
  const hourNow = new Date().getHours()
  /* najbliższe godziny z przodu, ale bez ucinania rana: przewiń, jeśli chcesz */
  const hours = w.hours

  return (
    <section className="park-weather" aria-label="Pogoda">
      <div className="park-weather__now">
        <span className={`park-weather__icon -${nowSky.sky}`} aria-hidden="true">
          {ICONS[nowSky.sky]}
        </span>
        <span className="park-weather__temp">
          {w.now.temp}
          <span className="park-weather__deg">°</span>
        </span>
        <span className="park-weather__meta">
          <span className="t-body-sm park-weather__sky">{nowSky.label}</span>
          <span className="t-caption park-weather__sub">
            odczuwalne {w.now.feels}°
            <span aria-hidden="true"> · </span>
            <Wind size={12} aria-hidden="true" /> {w.now.wind} km/h
          </span>
        </span>
      </div>

      <div className="park-weather__hours" role="list" ref={hoursRef}>
        {hours.map((h) => {
          const s = sky(h.code)
          const past = h.h < hourNow
          return (
            <div
              key={h.h}
              role="listitem"
              className={`park-weather__hour${past ? ' -past' : ''}${h.h === hourNow ? ' -now' : ''}`}
            >
              <span className="t-caption park-weather__clock">
                {h.h === hourNow ? 'teraz' : `${h.h}`}
              </span>
              <span className={`park-weather__hicon -${s.sky}`} aria-label={s.label}>
                {ICONS[s.sky]}
              </span>
              <span className="park-weather__htemp">{h.temp}°</span>
              {/* szansa opadu tylko od 20 procent: niżej to szum, nie prognoza */}
              {h.rain >= 20 && (
                <span className="t-caption park-weather__rain">
                  <Umbrella size={11} aria-hidden="true" />
                  {h.rain}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      <p className="t-caption park-weather__source">
        {w.stale
          ? `Ostatnia prognoza z godziny ${fmtAt(w.at)}, bez sieci nowszej nie mam.`
          : `Prognoza Open-Meteo, dane z godziny ${fmtAt(w.at)}.`}
      </p>
    </section>
  )
}
