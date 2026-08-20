import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../cx'
import './collapsible.css'

export type CollapsibleProps = {
  children: ReactNode
  /** lines shown when collapsed */
  lines?: number
  moreLabel?: string
  lessLabel?: string
  className?: string
}

/**
 * Long text folded to a few lines. Height animates between the collapsed and
 * full size, so unfolding glides instead of snapping (line-clamp cannot animate).
 */
export function Collapsible({
  children,
  lines = 4,
  moreLabel = 'Więcej',
  lessLabel = 'Mniej',
  className,
}: CollapsibleProps) {
  const [open, setOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [heights, setHeights] = useState<{ collapsed: number; full: number } | null>(null)

  const measure = useCallback(() => {
    const el = bodyRef.current
    if (!el) return
    const lh = parseFloat(getComputedStyle(el).lineHeight) || 24
    setHeights({ collapsed: Math.round(lh * lines), full: el.scrollHeight })
  }, [lines])

  useLayoutEffect(() => {
    measure()
    const el = bodyRef.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure])

  const collapsedTaller = heights ? heights.full <= heights.collapsed + 4 : false

  return (
    <div className={cx('pk-collapsible', className)}>
      <div
        ref={bodyRef}
        className={cx('pk-collapsible__body', !open && !collapsedTaller && '-clamped')}
        style={
          heights && !collapsedTaller
            ? { maxHeight: open ? heights.full : heights.collapsed }
            : undefined
        }
      >
        {children}
      </div>
      {!collapsedTaller && (
        <button className="pk-collapsible__toggle" onClick={() => setOpen((v) => !v)}>
          {open ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  )
}
