import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'
import { cx } from '../cx'
import './storycard.css'

export type StoryCardProps = {
  eyebrow?: string
  title: string
  meta?: string
  visual?: ReactNode
  children?: ReactNode
  action?: ReactNode
  onClick?: () => void
  className?: string
}

/**
 * A roomy, editorial card for one chapter in a chronological feed.
 * Its visual is a slot, so a route, photograph or illustration still uses
 * the same card and the same interaction pattern.
 */
export function StoryCard({ eyebrow, title, meta, visual, children, action, onClick, className }: StoryCardProps) {
  const content = (
    <>
      {visual != null && <span className="pk-storycard__visual">{visual}</span>}
      <span className="pk-storycard__body">
        {eyebrow != null && <span className="pk-storycard__eyebrow">{eyebrow}</span>}
        <span className="pk-storycard__title">{title}</span>
        {meta != null && <span className="pk-storycard__meta">{meta}</span>}
        {children}
      </span>
      {onClick != null && <ChevronRight className="pk-storycard__chevron" aria-hidden="true" />}
    </>
  )

  return (
    <article className={cx('pk-storycard', className)}>
      {onClick ? (
        <button type="button" className="pk-storycard__tap" onClick={onClick}>{content}</button>
      ) : (
        <div className="pk-storycard__tap">{content}</div>
      )}
      {action != null && <div className="pk-storycard__action">{action}</div>}
    </article>
  )
}
