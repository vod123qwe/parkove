import { useEffect, useState } from 'react'
import { useGameState } from './state'

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} H` : `${m} MIN`
}

/**
 * Wysiłek do tej pory, jako mała pastylka u góry ekranu.
 *
 * Wcześniej stała tu szeroka karta z nazwą wyprawy, pierścieniem postępu i
 * następnym punktem. Miała trzy wady naraz: rozpychała się pod przycisk menu i
 * oba białe tła się zlewały, pokazywała to samo zero dwa razy (pusty pierścień
 * i tekst „0/3"), a nazwa wyprawy w trakcie chodzenia nie służy do niczego.
 * Postęp i następny punkt zjechały na dół, do kciuka. Tu został sam licznik.
 */
export function ExpeditionStatus() {
  const { expedition } = useGameState()
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 10000)
    return () => clearInterval(t)
  }, [])

  if (!expedition) return null
  const km = (expedition.distanceM / 1000).toFixed(1).replace('.', ',')

  return (
    <div className="app-timepill">
      <span className="app-timepill__live" aria-hidden="true" />
      {fmtTime(Date.now() - expedition.startedAt)} · {km} KM
    </div>
  )
}
