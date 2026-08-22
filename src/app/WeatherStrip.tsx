import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Clock, Umbrella, Wind } from 'lucide-react'
import { bestWindow, getWeather, sky } from './weather'
import type { Weather, Window } from './weather'
import { SKY_ICONS } from './skyIcons'

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

const fmtAt = (at: number) =>
  new Date(at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })

/**
 * Zdanie o oknie pogodowym. Jedno, bo to ma być odpowiedź, nie prognoza: albo
 * „wyjdź teraz", albo „poczekaj do czternastej", albo „dziś nie wyjdzie".
 */
function windowLine(w: Window) {
  const godziny = w.from === w.to ? `około ${w.from}` : `między ${w.from} a ${w.to}`
  const stopnie = w.tempMin === w.tempMax ? `${w.tempMax} stopni` : `${w.tempMin} do ${w.tempMax} stopni`
  if (w.kind === 'dry') return `Spokojnie do wieczora, ${stopnie}.`
  if (w.kind === 'wet') return `Dziś leje. Najmniej ${godziny}, i tak weź kurtkę.`
  return `Najlepiej ${godziny}, wtedy ${stopnie}.`
}

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
          {SKY_ICONS[nowSky.sky]}
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
                {SKY_ICONS[s.sky]}
              </span>
              <span className="park-weather__htemp">{h.temp}°</span>
              {/*
                Szansa opadu tylko od 20 procent: niżej to szum, nie prognoza.
                Wiersz jest jednak zawsze, tylko pusty, bo inaczej kolumny mają
                różne wysokości i pas traci rytm.
              */}
              <span className="t-caption park-weather__rain">
                {h.rain >= 20 && (
                  <>
                    <Umbrella size={11} aria-hidden="true" />
                    {h.rain}%
                  </>
                )}
              </span>
            </div>
          )
        })}
      </div>

      {/*
        Jedna linijka odpowiedzi pod pasem godzin. Pas mówi, jak będzie; ta
        linijka mówi, o której wyjść, bo tego nikt nie chce sam wyliczać.
      */}
      {(() => {
        const win = bestWindow(w.hours, hourNow)
        if (!win) return null
        return (
          <p className={`t-body-sm park-weather__window${win.kind === 'wet' ? ' -wet' : ''}`}>
            <Clock size={14} aria-hidden="true" />
            {windowLine(win)}
          </p>
        )
      })()}

      <p className="t-caption park-weather__source">
        {w.stale
          ? `Ostatnia prognoza z godziny ${fmtAt(w.at)}, bez sieci nowszej nie mam.`
          : `Prognoza Open-Meteo, dane z godziny ${fmtAt(w.at)}.`}
      </p>
    </section>
  )
}
