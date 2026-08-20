import { useRef } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../cx'
import { useOverlay } from '../useOverlay'
import './peekcard.css'

export type PeekCardProps = {
  open: boolean
  /** drag down or the dismiss affordance */
  onDismiss: () => void
  /** drag up: the caller usually swaps the peek for a full sheet */
  onExpand?: () => void
  /** horizontal swipe: +1 next page, -1 previous; the caller owns the pages */
  onPageSwipe?: (dir: 1 | -1) => void
  /** current page index and total, for the dots and directional animation */
  page?: number
  pages?: number
  /** button row under the dots, e.g. "Zobacz szczegóły miejsca" */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * Non-modal floating card docked above the bottom edge; the map stays live.
 * Drag up expands, drag down dismisses. Horizontal swipe pages: the content
 * follows the finger inside the card and enters from the swipe direction.
 */
export function PeekCard({
  open,
  onDismiss,
  onExpand,
  onPageSwipe,
  page = 0,
  pages = 1,
  action,
  children,
  className,
}: PeekCardProps) {
  const { shown, closing, requestClose } = useOverlay(open, onDismiss, 200)
  const cardRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const prevPage = useRef(page)
  const drag = useRef<{ startX: number; startY: number; dx: number; dy: number; axis: 'x' | 'y' | null } | null>(null)

  const dir = page >= prevPage.current ? 1 : -1
  prevPage.current = page

  if (!shown) return null

  const setCardDrag = (dy: number, animate: boolean) => {
    const el = cardRef.current
    if (!el) return
    el.style.transition = animate ? '' : 'none'
    el.style.transform = `translateY(${dy}px)`
  }

  const setPageDrag = (dx: number | null) => {
    const el = pageRef.current
    if (!el) return
    if (dx === null) {
      el.style.transition = ''
      el.style.transform = ''
      el.style.opacity = ''
      return
    }
    el.style.transition = 'none'
    el.style.transform = `translateX(${dx * 0.8}px)`
    el.style.opacity = String(Math.max(0.35, 1 - Math.abs(dx) / 220))
  }

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { startX: e.clientX, startY: e.clientY, dx: 0, dy: 0, axis: null }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    d.dx = e.clientX - d.startX
    d.dy = e.clientY - d.startY
    if (!d.axis && (Math.abs(d.dx) > 8 || Math.abs(d.dy) > 8)) {
      d.axis = Math.abs(d.dx) > Math.abs(d.dy) ? 'x' : 'y'
    }
    if (d.axis === 'x' && onPageSwipe) {
      // rubber-band when there is no page in that direction
      const blocked = (d.dx < 0 && page >= pages - 1) || (d.dx > 0 && page <= 0)
      setPageDrag(blocked ? d.dx * 0.25 : d.dx)
    } else if (d.axis === 'y') {
      setCardDrag(d.dy > 0 ? d.dy : -Math.pow(-d.dy, 0.6) * 1.6, false)
    }
  }

  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (d.axis === 'x' && onPageSwipe) {
      const next = d.dx < 0 ? 1 : -1
      const blocked = (next === 1 && page >= pages - 1) || (next === -1 && page <= 0)
      setPageDrag(null)
      if (Math.abs(d.dx) > 44 && !blocked) onPageSwipe(next as 1 | -1)
      return
    }
    if (d.axis === 'y') {
      if (d.dy < -36 && onExpand) {
        setCardDrag(0, true)
        onExpand()
        return
      }
      if (d.dy > 52) {
        requestClose()
        return
      }
    }
    setCardDrag(0, true)
  }

  return (
    <div
      ref={cardRef}
      className={cx('pk-peek', closing && '-closing', className)}
      role="dialog"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="pk-peek__handle" />
      <div ref={pageRef} key={page} className={cx('pk-peek__page', dir > 0 ? '-next' : '-prev')}>
        {children}
      </div>
      {pages > 1 && (
        <div className="pk-peek__dots" aria-hidden="true">
          {Array.from({ length: pages }, (_, i) => (
            <span key={i} className={cx('pk-peek__dot', i === page && '-active')} />
          ))}
        </div>
      )}
      {action != null && <div className="pk-peek__action">{action}</div>}
    </div>
  )
}
