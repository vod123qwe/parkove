import type { ReactNode } from 'react'
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
 */
export function ActionBar({ children, className }: ActionBarProps) {
  return <div className={cx('pk-actionbar', className)}>{children}</div>
}
