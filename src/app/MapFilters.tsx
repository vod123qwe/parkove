import { useEffect, useRef, useState } from 'react'
import { Coffee, CircleParking, Footprints, SlidersHorizontal, ToyBrick } from 'lucide-react'
import { Switch } from '../ds'
import { setFilter, useGameState } from './state'
import type { MapFilters as Filters } from './state'

/**
 * Co widać na mapie: filtry wybranego miejsca.
 *
 * Lewy górny róg, na wysokości menu, bo ten narożnik był pusty, a filtry
 * dotyczą mapy, nie ekranu. Pokazują się razem z wybranym miejscem i razem z
 * nim znikają: bez wybranego parku nie ma czego filtrować. Ustawienia zostają
 * zapisane, więc następny park otwiera się tak, jak zostawiłeś poprzedni.
 *
 * W trakcie wyprawy są widoczne cały czas, bo wtedy najbardziej się przydają:
 * to jedyny moment, gdy chcesz zdjąć z mapy wszystko poza szlakiem.
 */

/*
 * Podpis tylko tam, gdzie zarabia na swoją wysokość. Cztery wiersze z podpisami
 * robiły panel na 280 px i ostatni wiersz wchodził pod kartę miejsca. „Parkingi"
 * podpis mają, bo znaczą „wszystkie", a nie „jakikolwiek".
 */
const ROWS: Array<{ key: keyof Filters; label: string; hint?: string; icon: React.ReactNode }> = [
  { key: 'trail', label: 'Szlak', icon: <Footprints size={18} /> },
  {
    key: 'parking',
    label: 'Parkingi',
    hint: 'Wszystkie, nie tylko sugerowany',
    icon: <CircleParking size={18} />,
  },
  { key: 'play', label: 'Place zabaw', icon: <ToyBrick size={18} /> },
  { key: 'food', label: 'Kawa i jedzenie', icon: <Coffee size={18} /> },
]

export function MapFilters({ show }: { show: boolean }) {
  const { filters } = useGameState()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  /* wybór miejsca zniknął: panel też, żeby nie wisiał nad pustą mapą */
  useEffect(() => {
    if (!show) setOpen(false)
  }, [show])

  /* dotknięcie poza panelem zamyka go, ale nie zabiera dotknięcia mapie */
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  if (!show) return null
  const off = ROWS.filter((r) => !filters[r.key]).length

  return (
    <div className="app-filters" ref={wrap}>
      <button
        className={`app-filterbtn${open ? ' -open' : ''}`}
        aria-label="Co widać na mapie"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <SlidersHorizontal strokeWidth={2} />
        {/* licznik wyłączonych: inaczej nie wiadomo, że mapa czegoś nie pokazuje */}
        {off > 0 && <span className="app-filterbtn__count">{off}</span>}
      </button>
      {open && (
        <div className="app-filters__panel">
          <p className="t-caption app-filters__head">Co widać na mapie</p>
          {ROWS.map((r) => (
            <Switch
              key={r.key}
              icon={r.icon}
              label={r.label}
              hint={r.hint}
              checked={filters[r.key]}
              onChange={(on) => setFilter(r.key, on)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
