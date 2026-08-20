import type { ReactNode } from 'react'
import { cx } from '../cx'
import './carousel.css'

export type CarouselProps = {
  children: ReactNode
  className?: string
  'aria-label'?: string
}

/** horizontal snap carousel; children define their own card width */
export function Carousel({ children, className, ...rest }: CarouselProps) {
  return (
    <div className={cx('pk-carousel', className)} role="list" {...rest}>
      {children}
    </div>
  )
}
