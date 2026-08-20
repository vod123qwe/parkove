import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../cx'
import './chip.css'

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
  icon?: ReactNode
}

export function Chip({ selected, icon, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx('pk-chip', selected && '-selected', className)}
      {...rest}
    >
      {icon != null && <span className="pk-chip__icon">{icon}</span>}
      {children}
    </button>
  )
}
