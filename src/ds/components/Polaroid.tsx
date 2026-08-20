import type { CSSProperties } from 'react'
import { cx } from '../cx'
import './polaroid.css'

export type PolaroidProps = {
  src: string
  caption?: string
  meta?: string
  /** deterministic tilt so a row of them looks hand-placed, not glitchy */
  tilt?: number
  onClick?: () => void
  className?: string
}

/** a photo in a paper frame, caption written underneath */
export function Polaroid({ src, caption, meta, tilt = 0, onClick, className }: PolaroidProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag
      className={cx('pk-polaroid', className)}
      style={{ '--pk-tilt': `${tilt}deg` } as CSSProperties}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <span className="pk-polaroid__frame">
        <img src={src} alt={caption ?? ''} loading="lazy" />
      </span>
      <span className="pk-polaroid__text">
        {caption != null && <span className="pk-polaroid__caption">{caption}</span>}
        {meta != null && <span className="pk-polaroid__meta">{meta}</span>}
      </span>
    </Tag>
  )
}
