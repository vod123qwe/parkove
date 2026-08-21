import { useState } from 'react'
import type { CSSProperties, ReactNode, UIEvent } from 'react'
import { cx } from '../cx'
import type { HeroImage } from './MediaHero'
import './photoslider.css'

export type PhotoSliderProps = {
  images: HeroImage[]
  /** frame proportions; 4:3 reads as a photograph, 16:9 as a landscape */
  ratio?: '4:3' | '3:2' | '16:9' | '1:1'
  /** shown when there are no images */
  fallback?: ReactNode
  /** credit under the photo, not on it: nobody reads white text on grass */
  showCredit?: boolean
  className?: string
  'aria-label'?: string
}

const RATIO: Record<string, string> = {
  '4:3': '4 / 3',
  '3:2': '3 / 2',
  '16:9': '16 / 9',
  '1:1': '1 / 1',
}

/**
 * Inset gallery: one photo fills the container width, rounded, and the strip
 * snaps from one to the next.
 *
 * Different animal than MediaHero. The hero is full bleed with the title written
 * on the image, which works for a cover; this one sits **under** a title, keeps
 * the page margins and lets the photograph be a photograph. Credit and dots live
 * below the frame.
 */
export function PhotoSlider({
  images,
  ratio = '4:3',
  fallback,
  showCredit = true,
  className,
  ...rest
}: PhotoSliderProps) {
  const [index, setIndex] = useState(0)

  /* krok to szerokość kadru plus przerwa, bo kadry stoją obok siebie z odstępem */
  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const first = el.firstElementChild as HTMLElement | null
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    const step = first ? first.offsetWidth + gap : el.clientWidth
    if (step <= 0) return
    const i = Math.min(Math.max(Math.round(el.scrollLeft / step), 0), images.length - 1)
    if (i !== index) setIndex(i)
  }

  const credit = showCredit ? images[index]?.credit : undefined
  const style = { '--pk-slider-ratio': RATIO[ratio] } as CSSProperties

  return (
    <div className={cx('pk-slider', className)} style={style} {...rest}>
      {images.length > 0 ? (
        <div className="pk-slider__strip" onScroll={onScroll} role="list">
          {images.map((img) => (
            <div className="pk-slider__slide" key={img.src} role="listitem">
              <img src={img.src} alt="" loading="lazy" />
            </div>
          ))}
        </div>
      ) : (
        <div className="pk-slider__slide -empty">{fallback}</div>
      )}
      {(images.length > 1 || credit != null) && (
        <div className="pk-slider__foot">
          {images.length > 1 && (
            <div className="pk-slider__dots" aria-hidden="true">
              {images.map((img, i) => (
                <span key={img.src} className={cx('pk-slider__dot', i === index && '-active')} />
              ))}
            </div>
          )}
          {credit != null && <p className="pk-slider__credit t-caption">{credit}</p>}
        </div>
      )}
    </div>
  )
}
