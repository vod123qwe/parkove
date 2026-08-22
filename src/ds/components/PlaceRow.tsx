import type { ReactNode } from 'react'
import { cx } from '../cx'
import './placerow.css'

export type PlaceRowProps = {
  /** numer na mini mapie; wiersz i pin mówią tym samym numerem */
  index?: number
  icon?: ReactNode
  title: string
  /** krótkie znaczniki: opłata, cechy, godziny */
  pills?: string[]
  /** dwa zdania, dlaczego to miejsce, w tej samej komórce co nazwa */
  note?: string
  /** dodatki pod opisem: linki wychodzące, np. opinie w Google */
  extra?: ReactNode
  /** akcja po prawej: jedna, ikonowa, o innej intencji niż dotknięcie wiersza */
  action?: ReactNode
  /** kadr mapy w tym kaflu: każde miejsce pokazuje swoje własne dojście */
  map?: ReactNode
  /** dotknięcie kadru: powiększony widok dojścia */
  onMapClick?: () => void
  selected?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Wiersz miejsca: parkingu, kawiarni, placu zabaw.
 *
 * Powstał z konkretnego błędu: nazwy ucinały się w wąskiej komórce, a opisy
 * leżały pod listą jako osobny blok, więc czytając opis nie wiedziałeś już,
 * o którym wierszu mowa. Tutaj wszystko jest w jednej komórce.
 *
 * Trzy intencje, trzy osobne elementy klikalne, i dlatego kontener jest divem,
 * a nie buttonem: kadr mapy otwiera powiększone dojście, treść wiersza wybiera
 * miejsce, a ikona po prawej robi rzecz wychodzącą z aplikacji. Przycisk w
 * przycisku byłby nie tylko niepoprawny, ale i nieklikalny na części telefonów.
 */
export function PlaceRow({
  index,
  icon,
  title,
  pills,
  note,
  extra,
  action,
  map,
  onMapClick,
  selected,
  onClick,
  className,
}: PlaceRowProps) {
  const Main = onClick ? 'button' : 'div'
  return (
    <div className={cx('pk-placerow', selected && '-selected', className)}>
      {map != null &&
        (onMapClick ? (
          <button className="pk-placerow__map" onClick={onMapClick} aria-label={`Dojście: ${title}`}>
            {map}
          </button>
        ) : (
          <div className="pk-placerow__map">{map}</div>
        ))}
      <Main
        className="pk-placerow__main"
        onClick={onClick}
        type={onClick ? 'button' : undefined}
      >
        <span className="pk-placerow__lead">{index != null ? index : icon}</span>
        <span className="pk-placerow__body">
          <span className="pk-placerow__title">{title}</span>
          {pills && pills.length > 0 && (
            <span className="pk-placerow__pills">
              {pills.map((p) => (
                <span key={p} className="pk-placerow__pill">
                  {p}
                </span>
              ))}
            </span>
          )}
          {note && <span className="pk-placerow__note">{note}</span>}
        </span>
      </Main>
      {/* akcja musi stac PRZED dodatkami, inaczej siatka wypycha ja do nowego wiersza */}
      {action != null && <div className="pk-placerow__action">{action}</div>}
      {extra != null && <div className="pk-placerow__extra">{extra}</div>}
    </div>
  )
}
