import type { HTMLAttributes } from 'react'
import { Trees } from 'lucide-react'
import { cx } from '../cx'
import { ProgressRing } from './ProgressRing'
import './card.css'

export type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div className={cx('pk-card', className)} {...rest}>
      {children}
    </div>
  )
}

export type ParkCardProps = {
  name: string
  /** e.g. district or short locality */
  meta: string
  /** cover image; when absent the card shows the not-yet-visited placeholder */
  photo?: string
  /** 0..100, park completion */
  progress: number
  visited?: boolean
  onClick?: () => void
  className?: string
}

export function ParkCard({ name, meta, photo, progress, visited, onClick, className }: ParkCardProps) {
  return (
    <article
      className={cx('pk-parkcard pk-card', !visited && '-unvisited', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <div className="pk-parkcard__cover">
        {photo ? (
          <img src={photo} alt="" loading="lazy" />
        ) : (
          <div className="pk-parkcard__placeholder" aria-hidden="true">
            <Trees />
          </div>
        )}
      </div>
      <div className="pk-parkcard__body">
        <div className="pk-parkcard__text">
          <h3 className="pk-parkcard__name t-title">{name}</h3>
          <p className="pk-parkcard__meta t-caption">{meta}</p>
        </div>
        <ProgressRing value={progress} size="sm" />
      </div>
    </article>
  )
}
