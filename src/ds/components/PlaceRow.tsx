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
  /** akcja po prawej: jedna, ikonowa, o innej intencji niż dotknięcie wiersza */
  action?: ReactNode
  /** kadr mapy w tym kaflu: każde miejsce pokazuje swoje własne dojście */
  map?: ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Wiersz miejsca: parkingu, kawiarni, placu zabaw.
 *
 * Powstał z konkretnego błędu: nazwy ucinały się w wąskiej komórce, a opisy
 * leżały pod listą jako osobny blok, więc czytając opis nie wiedziałeś już,
 * o którym wierszu mowa. Tutaj wszystko jest w jednej komórce: pełna nazwa
 * (może zawinąć), znaczniki i dwa zdania. Akcja po prawej zostaje ikoną, bo ma
 * inną intencję niż dotknięcie samego wiersza.
 */
export function PlaceRow({
  index,
  icon,
  title,
  pills,
  note,
  action,
  map,
  selected,
  onClick,
  className,
}: PlaceRowProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={cx('pk-placerow', selected && '-selected', className)}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {map != null && <span className="pk-placerow__map">{map}</span>}
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
      {action != null && <span className="pk-placerow__action">{action}</span>}
    </Tag>
  )
}
