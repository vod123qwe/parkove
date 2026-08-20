import type { ReactNode } from 'react'
import { cx } from '../cx'
import './list.css'

export type ListProps = {
  children: ReactNode
  /** hairline dividers between rows */
  divided?: boolean
  /** divider starts past the leading icon, iOS style */
  inset?: boolean
  className?: string
}

/** rows of ListItem separated by hairline dividers */
export function List({ children, divided = true, inset = true, className }: ListProps) {
  return (
    <div className={cx('pk-list', divided && '-divided', inset && '-inset', className)}>
      {children}
    </div>
  )
}
