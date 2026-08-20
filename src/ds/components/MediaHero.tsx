import { useRef, useState } from 'react'
import type { UIEvent } from 'react'
import { cx } from '../cx'
import './mediahero.css'

export type HeroImage = { src: string; credit?: string }

export type MediaHeroProps = {
  images: HeroImage[]
  title: string
  meta?: string
  /** shown when there are no images */
  fallback?: React.ReactNode
  /** photo credit over the image; off by default, attribution belongs in the body */
  showCredit?: boolean
  className?: string
}

/**
 * Full-bleed header image with the title written on it. Multiple images become
 * a swipeable strip with dots; the credit belongs to the visible image.
 */
export function MediaHero({
  images,
  title,
  meta,
  fallback,
  showCredit = false,
  className,
}: MediaHeroProps) {
  const stripRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const i = Math.round(el.scrollLeft / el.clientWidth)
    if (i !== index) setIndex(i)
  }

  return (
    <div className={cx('pk-hero', className)}>
      {images.length > 0 ? (
        <div className="pk-hero__strip" ref={stripRef} onScroll={onScroll}>
          {images.map((img) => (
            <img key={img.src} src={img.src} alt="" loading="lazy" className="pk-hero__img" />
          ))}
        </div>
      ) : (
        <div className="pk-hero__fallback">{fallback}</div>
      )}
      <div className="pk-hero__scrim" />
      <div className="pk-hero__text">
        <h2 className="pk-hero__title">{title}</h2>
        {meta != null && <p className="pk-hero__meta">{meta}</p>}
      </div>
      {images.length > 1 && (
        <div className="pk-hero__dots" aria-hidden="true">
          {images.map((img, i) => (
            <span key={img.src} className={cx('pk-hero__dot', i === index && '-active')} />
          ))}
        </div>
      )}
      {showCredit && images[index]?.credit && (
        <p className="pk-hero__credit">{images[index].credit}</p>
      )}
    </div>
  )
}
