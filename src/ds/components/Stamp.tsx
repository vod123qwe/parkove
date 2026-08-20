import { useState } from 'react'
import type { ReactNode } from 'react'
import { cx } from '../cx'
import './stamp.css'

export type StampProps = {
  /** park id; the artwork lives at <base>stamps/<id>.png */
  parkId: string
  name: string
  earned?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** shown while the artwork is missing */
  fallback?: ReactNode
  showName?: boolean
  className?: string
}

/** collectible park sticker: full colour once earned, a pale ghost before that */
export function Stamp({
  parkId,
  name,
  earned = false,
  size = 'md',
  fallback,
  showName = false,
  className,
}: StampProps) {
  const [missing, setMissing] = useState(false)
  return (
    <div
      className={cx('pk-stamp', `-${size}`, earned ? '-earned' : '-locked', className)}
      title={name}
    >
      <div className="pk-stamp__art">
        {missing ? (
          <div className="pk-stamp__placeholder">{fallback}</div>
        ) : (
          <img
            src={`${import.meta.env.BASE_URL}stamps/${parkId}.png`}
            alt={name}
            loading="lazy"
            onError={() => setMissing(true)}
          />
        )}
      </div>
      {showName && <span className="pk-stamp__name">{name}</span>}
    </div>
  )
}
