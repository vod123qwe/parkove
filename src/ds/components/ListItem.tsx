import type { ReactNode } from 'react'
import { cx } from '../cx'
import './listitem.css'

export type ListItemProps = {
  icon?: ReactNode
  /** leading disc tone; accent for visited things, gold for completed */
  leadTone?: 'neutral' | 'accent' | 'gold'
  title: string
  meta?: string
  trailing?: ReactNode
  onClick?: () => void
  className?: string
}

export function ListItem({
  icon,
  leadTone = 'neutral',
  title,
  meta,
  trailing,
  onClick,
  className,
}: ListItemProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={cx('pk-listitem', className)} onClick={onClick} type={onClick ? 'button' : undefined}>
      {icon != null && <span className={cx('pk-listitem__lead', `-${leadTone}`)}>{icon}</span>}
      <span className="pk-listitem__text">
        <span className="pk-listitem__title">{title}</span>
        {meta != null && <span className="pk-listitem__meta">{meta}</span>}
      </span>
      {trailing != null && <span className="pk-listitem__trailing">{trailing}</span>}
    </Tag>
  )
}
