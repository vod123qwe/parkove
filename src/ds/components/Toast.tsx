import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cx } from '../cx'
import { useOverlay } from '../useOverlay'
import './toast.css'

export type ToastTone = 'info' | 'reward'

export type ToastProps = {
  open: boolean
  onClose: () => void
  /** short headline, one line */
  title: string
  /** one sentence at most: this is read while walking */
  text?: string
  icon?: ReactNode
  tone?: ToastTone
  /** primary action, e.g. reading the story behind a point */
  actionLabel?: string
  onAction?: () => void
  /** closes itself after this many ms; leave out for a notice that waits */
  autoMs?: number
  /** lifts the toast above whatever floats at the bottom (bar, peek card) */
  offset?: number
  className?: string
}

const EXIT = 220

/**
 * A notice that arrives during something else: a point within reach, a photo
 * saved. Anchored at the bottom because that is where the thumb is, and never
 * modal: the map underneath stays live.
 */
export function Toast({
  open,
  onClose,
  title,
  text,
  icon,
  tone = 'info',
  actionLabel,
  onAction,
  autoMs,
  offset = 0,
  className,
}: ToastProps) {
  const { shown, closing, requestClose } = useOverlay(open, onClose, EXIT)
  /*
   * Swipe w dol zamyka. Komunikat wchodzi od dolu, wiec zejscie w dol jest tym
   * samym ruchem odwrotnie i nie trzeba go sie uczyc. Krzyzyk zostaje, bo
   * przeciagniecie nie jest odkrywalne, ale przestaje byc jedyna droga: to
   * najmniejszy cel w calym komponencie, a czyta sie go w marszu.
   *
   * Karta jedzie za palcem tylko w dol (opor w gore, jak w arkuszach), i nie
   * zamyka sie od samego dotkniecia: 48 px to za duzo na przypadek.
   */
  const from = useRef<number | null>(null)
  const [pull, setPull] = useState(0)

  useEffect(() => {
    if (!shown || closing || !autoMs) return
    const timer = window.setTimeout(requestClose, autoMs)
    return () => window.clearTimeout(timer)
    // title in the deps: a new notice reusing the same toast restarts the clock
  }, [shown, closing, autoMs, title, requestClose])

  if (!shown) return null

  return (
    <div
      className={cx('pk-toast', `-${tone}`, closing && '-closing', pull > 0 && '-pulled', className)}
      style={
        {
          '--pk-toast-offset': `${offset}px`,
          '--pk-toast-pull': `${pull}px`,
        } as CSSProperties
      }
      role="status"
      aria-live="polite"
      onPointerDown={(e) => {
        from.current = e.clientY
      }}
      onPointerMove={(e) => {
        if (from.current === null) return
        const dy = e.clientY - from.current
        if (dy <= 0) return
        if (dy > 48) {
          from.current = null
          setPull(0)
          requestClose()
          return
        }
        setPull(dy)
      }}
      onPointerUp={() => {
        from.current = null
        setPull(0)
      }}
      onPointerCancel={() => {
        from.current = null
        setPull(0)
      }}
    >
      {icon && <span className="pk-toast__icon">{icon}</span>}
      <div className="pk-toast__body">
        <span className="pk-toast__title">{title}</span>
        {text && <span className="t-caption pk-toast__text">{text}</span>}
      </div>
      {actionLabel && onAction && (
        <button className="pk-toast__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      <button className="pk-toast__close" aria-label="Zamknij" onClick={requestClose}>
        <X size={16} />
      </button>
    </div>
  )
}
