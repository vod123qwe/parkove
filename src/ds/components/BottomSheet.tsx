import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../cx'
import { useOverlay } from '../useOverlay'
import './bottomsheet.css'

export type BottomSheetProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  /** false: no scrim, the page behind stays interactive (map sheets) */
  modal?: boolean
  /** full-bleed media at the top; it replaces the text header (title lives on the image) */
  hero?: ReactNode
  /** the grabber; off when the sheet is really a card that belongs to a screen */
  handle?: boolean
  /**
   * Lowest resting height in px. With it the sheet cannot be dragged away: it
   * settles here instead, showing whatever fits (a title and one button), which
   * is what you want when the sheet IS the screen's content.
   */
  minHeight?: number
}

// iOS-like sheet: two detents (auto-height and full), draggable anywhere,
// inner scroll only at full; a downward drag from scrollTop 0 collapses.
// Every close path animates out through useOverlay before unmounting.
type Detent = 'min' | 'auto' | 'full'

const FULL_VH = 0.92
const AUTO_VH = 0.62
const DETENT_GAP_MIN = 48
const RUBBER = 0.4
const EXIT_MS = 240
// content scrolls this far under the header, fading out in its gradient+blur;
// keep in sync with the overlap values in bottomsheet.css
const HEAD_OVERLAP = 28

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className,
  modal = true,
  hero,
  handle = true,
  minHeight,
}: BottomSheetProps) {
  const { shown, closing, requestClose } = useOverlay(open, onClose, EXIT_MS)
  const panelRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [detent, setDetent] = useState<Detent>('auto')
  const [heights, setHeights] = useState<{ full: number; auto: number } | null>(null)
  const drag = useRef<{
    startY: number
    startT: number
    lastY: number
    lastTime: number
    velocity: number
    mode: 'pending' | 'drag' | 'scroll'
  } | null>(null)
  const translate = useRef(0)

  const measure = useCallback(() => {
    const head = headRef.current
    const content = contentRef.current
    if (!head || !content) return
    const vh = window.innerHeight
    // in hero mode the handle floats over the image, so it takes no layout space
    const headH = hero != null ? 0 : Math.max(0, head.offsetHeight - HEAD_OVERLAP)
    const natural = headH + content.scrollHeight + 4
    const full = Math.min(natural, vh * FULL_VH)
    let auto = Math.min(natural, vh * AUTO_VH)
    if (full - auto < DETENT_GAP_MIN) auto = full
    setHeights({ full, auto })
  }, [hero])

  useLayoutEffect(() => {
    if (!shown) return
    setDetent('auto')
    measure()
  }, [shown, measure])

  useEffect(() => {
    if (!shown) return
    const content = contentRef.current
    const ro = content ? new ResizeObserver(measure) : null
    if (content?.firstElementChild) ro?.observe(content.firstElementChild)
    window.addEventListener('resize', measure)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('keydown', onKey)
    }
  }, [shown, measure, requestClose])

  const setTranslate = (t: number, animate: boolean) => {
    const el = panelRef.current
    if (!el) return
    translate.current = t
    el.style.transition = animate ? '' : 'none'
    el.style.transform = `translateY(${t}px)`
    /*
     * Ile panelu wisi pod ekranem. Arkusz na detencie „auto" jest wyższy od
     * widoku i zjechany w dół, więc cokolwiek przyklejonego do dołu kontenera
     * ląduje poza ekranem. Pasek akcji odejmuje tę wartosć i siada na dole
     * WIDOCZNEJ części.
     */
    el.style.setProperty('--pk-sheet-shift', `${Math.max(0, t)}px`)
  }

  const restingT = useCallback(
    (d: Detent) => {
      if (!heights) return 0
      if (d === 'full') return 0
      if (d === 'min') return Math.max(0, heights.full - (minHeight ?? heights.auto))
      return heights.full - heights.auto
    },
    [heights, minHeight],
  )

  useLayoutEffect(() => {
    if (!shown || !heights || closing) return
    setTranslate(restingT(detent), true)
  }, [shown, heights, detent, closing, restingT])

  // exit: slide the panel below the viewport while the scrim fades
  useLayoutEffect(() => {
    if (closing) setTranslate((heights?.full ?? window.innerHeight) + 24, true)
  }, [closing, heights])

  // block native pull-to-scroll only when the sheet itself takes the gesture
  useEffect(() => {
    const content = contentRef.current
    if (!shown || !content) return
    const onTouchMove = (e: TouchEvent) => {
      if (drag.current?.mode === 'drag') e.preventDefault()
    }
    content.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => content.removeEventListener('touchmove', onTouchMove)
  }, [shown])

  if (!shown) return null

  const canScroll = () => {
    const c = contentRef.current
    return !!c && c.scrollHeight > c.clientHeight + 1
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (!heights || closing) return
    drag.current = {
      startY: e.clientY,
      startT: translate.current,
      lastY: e.clientY,
      lastTime: performance.now(),
      velocity: 0,
      mode: 'pending',
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || !heights || closing) return
    const dy = e.clientY - d.startY
    const now = performance.now()
    const dt = now - d.lastTime
    if (dt > 0) d.velocity = (e.clientY - d.lastY) / dt
    d.lastY = e.clientY
    d.lastTime = now

    if (d.mode === 'pending') {
      if (Math.abs(dy) < 6) return
      const content = contentRef.current
      const inContent = content?.contains(e.target as Node) ?? false
      const scrolled = (content?.scrollTop ?? 0) > 0
      if (detent === 'full' && inContent && (scrolled || (dy < 0 && canScroll()))) {
        d.mode = 'scroll'
        return
      }
      d.mode = 'drag'
      try {
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      } catch {
        // capture refused: the drag continues on this element anyway
      }
    }
    if (d.mode !== 'drag') return

    let t = d.startT + dy
    if (t < 0) t = -Math.pow(-t, RUBBER) * 2 // rubber band above full
    setTranslate(t, false)
  }

  const onPointerUp = () => {
    const d = drag.current
    drag.current = null
    if (!d || d.mode !== 'drag' || !heights || closing) return
    const t = translate.current
    const v = d.velocity
    const autoT = restingT('auto')
    const closeT = heights.full
    const closeThreshold = autoT + Math.max(80, (closeT - autoT) * 0.4)

    if (v > 0.65 || t > closeThreshold) {
      if (detent === 'full' && heights.auto < heights.full && t < autoT + 80) {
        setDetent('auto')
        setTranslate(autoT, true)
      } else if (minHeight != null) {
        // a sheet with a floor never leaves: it settles at its smallest size
        setDetent('min')
        setTranslate(restingT('min'), true)
      } else {
        requestClose()
      }
      return
    }
    if (v < -0.35 || t < autoT * 0.6) {
      setDetent('full')
      setTranslate(0, true)
      return
    }
    setDetent(t < autoT / 2 ? 'full' : 'auto')
    setTranslate(t < autoT / 2 ? 0 : autoT, true)
  }

  const onWheel = (e: React.WheelEvent) => {
    if (detent === 'auto' && e.deltaY > 8 && heights && heights.auto < heights.full) setDetent('full')
  }

  const gap = heights ? heights.full - heights.auto : 0

  return (
    <div className={cx('pk-sheet', closing && '-closing', !modal && '-nonmodal', className)}>
      {modal && <div className="pk-sheet__scrim" onClick={requestClose} />}
      <div
        ref={panelRef}
        className={cx('pk-sheet__panel', detent === 'full' && gap > 0 && '-full')}
        style={heights ? { height: heights.full } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div ref={headRef} className={cx('pk-sheet__head', hero != null && '-overlay')}>
          {/*
            Dwa poziomy rozmycia pod tytułem, oba schowane pod kryjącą częścią
            zasłony (patrz bottomsheet.css: maska nie obcina backdrop-filter).
            --h mówi, jak głęboko w pas sięga pasmo.
          */}
          <div className="pk-sheet__glass" aria-hidden="true">
            <span style={{ '--b': '60px', '--h': '24%' } as CSSProperties} />
            <span style={{ '--b': '30px', '--h': '44%' } as CSSProperties} />
            <span style={{ '--b': '12px', '--h': '66%' } as CSSProperties} />
            <span style={{ '--b': '3px', '--h': '88%' } as CSSProperties} />
          </div>
          {handle && (
            <div className="pk-sheet__grab">
              <div className="pk-sheet__handle" />
            </div>
          )}
          {hero == null && title != null && <h2 className="pk-sheet__title t-headline">{title}</h2>}
        </div>
        <div ref={contentRef} className={cx('pk-sheet__content', hero != null && '-hero')}>
          {hero}
          <div className="pk-sheet__inner">{children}</div>
        </div>
      </div>
    </div>
  )
}
