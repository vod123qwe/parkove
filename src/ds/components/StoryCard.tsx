import type { ReactNode } from 'react'
import { cx } from '../cx'
import './storycard.css'

export type StoryCardProps = {
  eyebrow?: string
  title: string
  meta?: string
  /** kadr na całą szerokość NAD treścią: mapa trasy, zdjęcie okładkowe */
  media?: ReactNode
  /** polaroidy pod treścią, lekko na siebie nachodzące */
  gallery?: ReactNode
  children?: ReactNode
  /** jedna akcja na całą szerokość karty */
  action?: ReactNode
  onClick?: () => void
  className?: string
}

/*
 * Karta jednego rozdziału w chronologicznym feedzie. Przebudowa 2026-08-28
 * (Jarek): bez chevrona i bez zdjęcia z lewej. Na górze kadr na całą szerokość
 * (mapa przebytej trasy), pod nim treść pełną szerokością, niżej zdjęcia jako
 * lekko nachodzące na siebie polaroidy (DS Polaroid), a na dole jedna akcja
 * przez całą kartę. Kadr i galeria siedzą WEWNĄTRZ przycisku karty, więc ich
 * elementy nie mogą być klikalne (Polaroid bez onClick, mapa bez interakcji).
 * Karta nie zmienia tła pod palcem: Jarek uznał szary błysk za brudny.
 */
export function StoryCard({ eyebrow, title, meta, media, gallery, children, action, onClick, className }: StoryCardProps) {
  const content = (
    <>
      {media != null && <span className="pk-storycard__media">{media}</span>}
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
