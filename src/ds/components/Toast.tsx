import { useEffect } from 'react'
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

  useEffect(() => {
    if (!shown || closing || !autoMs) return
    const timer = window.setTimeout(requestClose, autoMs)
    return () => window.clearTimeout(timer)
    // title in the deps: a new notice reusing the same toast restarts the clock
  }, [shown, closing, autoMs, title, requestClose])

  if (!shown) return null

  return (
    <div
      className={cx('pk-toast', `-${tone}`, closing && '-closing', className)}
      style={{ '--pk-toast-offset': `${offset}px` } as CSSProperties}
      role="status"
      aria-live="polite"
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
