import { cx } from '../cx'
import './progressring.css'

const SIZES = { sm: 36, md: 56, lg: 96 } as const
const STROKES = { sm: 3.5, md: 4.5, lg: 7 } as const

export type ProgressRingProps = {
  /** 0..100 */
  value: number
  size?: keyof typeof SIZES
  /** shown inside the ring on md and lg */
  label?: string
  className?: string
}

export function ProgressRing({ value, size = 'md', label, className }: ProgressRingProps) {
  const v = Math.max(0, Math.min(100, value))
  const px = SIZES[size]
  const stroke = STROKES[size]
  const r = (px - stroke) / 2
  const c = 2 * Math.PI * r
  const complete = v >= 100
  const text = label ?? `${Math.round(v)}%`

  return (
    <div
      className={cx('pk-ring', `-${size}`, complete && '-complete', className)}
      role="img"
      aria-label={`Progress ${Math.round(v)}%`}
    >
      <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`}>
        <circle className="pk-ring__track" cx={px / 2} cy={px / 2} r={r} strokeWidth={stroke} />
        <circle
          className="pk-ring__value"
          cx={px / 2}
          cy={px / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v / 100)}
        />
      </svg>
      {size !== 'sm' && <span className="pk-ring__label">{text}</span>}
    </div>
  )
}
