import type { ReactNode } from 'react'
import { cx } from '../cx'
import './badge.css'

export type ParkBadgeState = 'locked' | 'visited' | 'completed'

export type ParkBadgeProps = {
  state: ParkBadgeState
  /** park glyph, e.g. a Lucide icon */
  icon: ReactNode
  label?: string
  size?: 'md' | 'lg'
  className?: string
}

export function ParkBadge({ state, icon, label, size = 'md', className }: ParkBadgeProps) {
  return (
    <div className={cx('pk-badge', `-${state}`, `-${size}`, className)}>
      <div className="pk-badge__disc">{icon}</div>
      {label != null && <span className="pk-badge__label">{label}</span>}
    </div>
  )
}
