import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../cx'
import './actionbar.css'

export type ActionBarProps = {
  children: ReactNode
  className?: string
}

/**
 * The row of actions at the bottom of a sheet or a screen, stuck there while
 * the content scrolls past. The first child stretches, so the pattern is one
 * wide decision plus the small dangerous things beside it.
 *
 * The bar is glass, not a plate: a gradient plus three bands of blur, strongest
 * at the bottom edge. A solid fill with a hairline over it reads as a wall and
 * makes the sheet look shorter than it is.
 */
export function ActionBar({ children, className }: ActionBarProps) {
  return (
    <div className={cx('pk-actionbar', className)}>
      <div className="pk-actionbar__glass" aria-hidden="true">
        {/* najmocniejsze rozmycie najbliżej krawędzi, najsłabsze sięga najdalej */}
        <span style={{ '--b': '18px', '--k': 0.46 } as CSSProperties} />
        <span style={{ '--b': '9px', '--k': 0.72 } as CSSProperties} />
        <span style={{ '--b': '3px', '--k': 1 } as CSSProperties} />
      </div>
      <div className="pk-actionbar__row">{children}</div>
    </div>
  )
}
