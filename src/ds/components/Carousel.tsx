import type { ReactNode } from 'react'
import { cx } from '../cx'
import './carousel.css'

export type CarouselProps = {
  children: ReactNode
  /** edges fade out by default; off when the row sits inside a padded card */
  fade?: boolean
  className?: string
  'aria-label'?: string
}

/** horizontal snap carousel; children define their own card width */
export function Carousel({ children, fade = true, className, ...rest }: CarouselProps) {
  return (
    <div className={cx('pk-carousel', fade ? null : '-nofade', className)} role="list" {...rest}>
      {children}
    </div>
  )
}
