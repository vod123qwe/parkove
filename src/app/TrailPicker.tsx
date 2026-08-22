import { useRef } from 'react'
import type { CSSProperties } from 'react'
import { Check, Footprints, Signpost, X } from 'lucide-react'
import { COLOUR_PL, TRAIL_INK } from './data/trails'
import type { Trail } from './data/trails'
import { formatDistance } from './geo'

/**
 * Wybieranie szlaku na mapie, w trakcie wyprawy.
 *
 * Zamówione tak (Jarek, 2026-08-22): mapa zostaje otwarta, akcje wyprawy znikają,
 * na środku zamiast plusa jest ptaszek „Wybierz", po lewej krzyżyk, a trasy
 * zmienia się przesunięciem w prawo i w lewo. Po wyborze szlak zostaje na mapie i
 * wracasz do trybu wyprawy, a moduły podmieniają się z powrotem.
 *
 * Dlaczego nie arkusz z listą (TrailModal zostaje do planowania w domu): w
 * terenie chcesz zobaczyć trasę na mapie, po której idziesz, a nie na małym
 * kadrze w kafelku. Tu mapa jest widokiem, a to pasek tylko nią przewija.
 */
export function TrailPicker({
  trails,
  index,
  onIndex,
  onPick,
  onClose,
}: {
  trails: Trail[]
  index: number
  onIndex: (next: number) => void
  onPick: (trail: Trail) => void
  onClose: () => void
}) {
  const drag = useRef<{ x: number; moved: boolean } | null>(null)
  const trail = trails[index]
  if (!trail) return null

  const step = (dir: 1 | -1) => {
    const next = (index + dir + trails.length) % trails.length
    onIndex(next)
  }

  /* przesunięcie palcem na pasku, nie na mapie: mapa ma zostać przesuwalna */
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, moved: false }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.moved) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) < 44) return
    d.moved = true
    step(dx < 0 ? 1 : -1)
  }
  const onUp = () => {
    drag.current = null
  }

  const ink = trail.colour ? TRAIL_INK[trail.colour] : undefined
  return (
    <div className="trailpick">
      <div
        className="trailpick__card"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="trailpick__row">
          <span className="trailpick__ink" style={ink ? { background: ink } : undefined}>
            {trail.kind === 'osm' ? <Signpost size={15} /> : <Footprints size={15} />}
          </span>
          <span className="trailpick__text">
            <span className="t-body-strong trailpick__name">{trail.name}</span>
            <span className="t-caption trailpick__meta">
              {formatDistance(trail.m)} · {trail.min} min
              {trail.kind === 'points' && trail.stops?.length
                ? ` · ${trail.stops.length} punktów`
                : ''}
              {trail.colour ? ` · znak ${COLOUR_PL[trail.colour]}` : ''}
            </span>
          </span>
        </div>
        {trail.note && <p className="t-caption trailpick__note">{trail.note}</p>}
        {trails.length > 1 && (
          <div className="trailpick__dots" aria-hidden="true">
            {trails.map((t, i) => (
              <span key={t.id} className={i === index ? 'is-on' : undefined} />
            ))}
          </div>
        )}
        {trails.length > 1 && (
          <p className="t-caption trailpick__hint">
            Przesuń w lewo albo w prawo, żeby zobaczyć inną trasę
          </p>
        )}
      </div>

      {/* akcje: krzyżyk po lewej, ptaszek na środku, tam gdzie był plus */}
      <div className="app-expactions">
        <div className="app-expaction">
          <button className="app-expaction__btn" aria-label="Zamknij wybór" onClick={onClose}>
            <X size={18} />
          </button>
          <span className="app-expaction__label">Zamknij</span>
        </div>
        <div className="app-expaction">
          <button
            className="app-expaction__btn -primary trailpick__ok"
            aria-label={`Wybierz: ${trail.name}`}
            onClick={() => onPick(trail)}
            style={{ '--tick': '1' } as CSSProperties}
          >
            <Check size={26} strokeWidth={3} />
          </button>
          <span className="app-expaction__label">Wybierz</span>
        </div>
        <div className="app-expaction" aria-hidden="true" />
      </div>
    </div>
  )
}
