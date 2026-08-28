import type { ReactNode } from 'react'
import { cx } from '../cx'
import './storycard.css'

export type StoryCardProps = {
  eyebrow?: string
  title: string
  meta?: string
  /** polaroidy albo kafle trasy, pełną szerokością pod treścią */
  gallery?: ReactNode
  children?: ReactNode
  /** jedna akcja na całą szerokość karty */
  action?: ReactNode
  onClick?: () => void
  className?: string
}

/*
 * Karta jednego rozdziału w chronologicznym feedzie. Przebudowa 2026-08-28
 * (Jarek): bez chevrona i bez zdjęcia z lewej. Treść idzie pełną szerokością
 * z większymi odstępami, zdjęcia leżą pod nią jako polaroidy (DS Polaroid),
 * a akcja rozciąga się na całą kartę. Galeria siedzi wewnątrz przycisku
 * karty, więc jej elementy NIE mogą być klikalne (Polaroid bez onClick).
 */
export function StoryCard({ eyebrow, title, meta, gallery, children, action, onClick, className }: StoryCardProps) {
  const content = (
    <>
      <span className="pk-storycard__body">
        {eyebrow != null && <span className="pk-storycard__eyebrow">{eyebrow}</span>}
        <span className="pk-storycard__title">{title}</span>
        {meta != null && <span className="pk-storycard__meta">{meta}</span>}
        {children}
      </span>
      {gallery != null && <span className="pk-storycard__gallery">{gallery}</span>}
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
