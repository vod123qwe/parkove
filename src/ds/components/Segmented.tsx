import { useLayoutEffect, useRef, useState } from 'react'
import { cx } from '../cx'
import './segmented.css'

export type SegmentedOption<T extends string> = { value: T; label: string }

export type SegmentedProps<T extends string> = {
  options: Array<SegmentedOption<T>>
  value: T
  onChange: (value: T) => void
  'aria-label'?: string
  className?: string
  /**
   * 'pill' (domyślnie): zatopiona pigułka z wypukłym kciukiem, dobra pod
   * palec na telefonie. 'tabs': tekstowe zakładki z podkreśleniem, dla
   * układu webowego (Jarek 2026-10-10: pigułka z czterema opcjami w panelu
   * 440 px „źle wygląda na web"). Ten sam model, ten sam przesuwany
   * wskaźnik, inny strój: w zakładkach wskaźnik jest kreską pod aktywną.
   */
  variant?: 'pill' | 'tabs'
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  variant = 'pill',
  ...rest
}: SegmentedProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null)

  // the raised background is one element gliding between segments
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const measure = () => {
      const active = root.querySelector<HTMLElement>('.pk-segmented__btn.-active')
      if (active) setThumb({ left: active.offsetLeft, width: active.offsetWidth })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    return () => ro.disconnect()
  }, [value, options.length])

  return (
    <div ref={rootRef} className={cx('pk-segmented', variant === 'tabs' && '-tabs', className)} role="radiogroup" {...rest}>
      {thumb && (
        <span
          className="pk-segmented__thumb"
          style={{ transform: `translateX(${thumb.left}px)`, width: thumb.width }}
          aria-hidden="true"
        />
      )}
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={cx('pk-segmented__btn', value === o.value && '-active')}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
