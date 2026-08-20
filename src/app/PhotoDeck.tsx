import { useCallback, useEffect, useRef } from 'react'
import { Polaroid } from '../ds'
import type { WalkMark } from './photos'

const fmtClock = (at: number) =>
  new Date(at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })

/** how far from the middle a card still counts as "coming forward" */
const REACH = 0.55

/**
 * A deck of prints you push through with a finger. Whichever one is nearest
 * the middle comes to the front, straightens up and grows a little, and the
 * ones leaving lean back into the pile. Driven from the scroll position rather
 * than by CSS alone, so it behaves the same on a phone as on a desktop.
 */
export function PhotoDeck({
  photos,
  onOpen,
}: {
  photos: Array<WalkMark & { url?: string }>
  onOpen: (id: string) => void
}) {
  const rail = useRef<HTMLDivElement>(null)
  const frame = useRef(0)

  const arrange = useCallback(() => {
    const el = rail.current
    if (!el) return
    const mid = el.scrollLeft + el.clientWidth / 2
    for (const node of Array.from(el.children) as HTMLElement[]) {
      const centre = node.offsetLeft + node.offsetWidth / 2
      // -1 to 1 across the visible width: 0 means dead centre
      const d = (centre - mid) / (el.clientWidth / 2)
      const near = Math.max(0, 1 - Math.abs(d) / REACH)
      const tilt = d * 5 + (1 - near) * (d < 0 ? -2 : 2)
      node.style.transform = `rotate(${tilt.toFixed(2)}deg) scale(${(1 + 0.05 * near).toFixed(3)})`
      node.style.zIndex = String(10 + Math.round(near * 90))
    }
  }, [])

  useEffect(() => {
    arrange()
    const el = rail.current
    if (!el) return
    const onScroll = () => {
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(arrange)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame.current)
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [arrange, photos.length])

  return (
    <div className="journey__deck" ref={rail} role="list" aria-label="Zdjęcia z tej wyprawy">
      {photos.map((ph) => (
        <Polaroid
          key={ph.id}
          src={ph.url!}
          caption={ph.caption || undefined}
          meta={fmtClock(ph.at)}
          onClick={() => onOpen(ph.id)}
        />
      ))}
    </div>
  )
}
