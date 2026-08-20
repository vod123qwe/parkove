import type { ReactNode } from 'react'
import { cx } from '../cx'
import './stat.css'

export type StatProps = {
  value: string
  label: string
  /** small mark in a tinted disc; turns the stat into a card */
  icon?: ReactNode
  className?: string
}

export function Stat({ value, label, icon, className }: StatProps) {
  return (
    <div className={cx('pk-stat', icon ? '-card' : null, className)}>
      {icon && <span className="pk-stat__icon">{icon}</span>}
      <span className="pk-stat__text">
        <span className="pk-stat__value">{value}</span>
        <span className="pk-stat__label">{label}</span>
      </span>
    </div>
  )
}

export type StatGridProps = { children: ReactNode; className?: string }

/**
 * Two columns of stat cards. A single row of four numbers reads as a cramped
 * table; in pairs each number gets room and its own icon to hold on to.
 */
export function StatGrid({ children, className }: StatGridProps) {
  return <div className={cx('pk-statgrid', className)}>{children}</div>
}
