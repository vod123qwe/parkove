import { useEffect } from 'react'
import { Trees } from 'lucide-react'
import { Button, Stamp } from '../ds'
import './stampcelebration.css'

/** the moment a park is collected: the sticker lands with a thump */
export function StampCelebration({
  parkId,
  parkName,
  onClose,
}: {
  parkId: string | null
  parkName: string
  onClose: () => void
}) {
  useEffect(() => {
    if (!parkId) return
    navigator.vibrate?.([40, 60, 120])
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [parkId, onClose])

  if (!parkId) return null

  return (
    <div className="celebrate" role="dialog" aria-modal="true">
      <div className="celebrate__scrim" onClick={onClose} />
      <div className="celebrate__body">
        <p className="celebrate__kicker t-label">Nowa pieczątka</p>
        <div className="celebrate__stamp">
          <Stamp parkId={parkId} name={parkName} earned size="xl" fallback={<Trees />} />
        </div>
        <h2 className="celebrate__name t-headline">{parkName}</h2>
        <p className="celebrate__sub t-body-sm">Dopisane do Twojej kolekcji.</p>
        <Button size="lg" onClick={onClose} className="celebrate__cta">
          Super
        </Button>
      </div>
    </div>
  )
}
