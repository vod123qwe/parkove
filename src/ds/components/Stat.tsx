import { cx } from '../cx'
import './stat.css'

export type StatProps = {
  value: string
  label: string
  className?: string
}

export function Stat({ value, label, className }: StatProps) {
  return (
    <div className={cx('pk-stat', className)}>
      <span className="pk-stat__value">{value}</span>
      <span className="pk-stat__label">{label}</span>
    </div>
  )
}
