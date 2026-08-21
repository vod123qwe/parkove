import { Trees } from 'lucide-react'
import { Modal, Stamp } from '../ds'
import { useGameState } from './state'
import { isParkComplete } from './progress'
import parksData from './data/parks.json'
import type { ParkFeature } from './ParkSheet'

const FEATURES = parksData.features as unknown as ParkFeature[]

/** the collection: every park sticker, pale until collected */
export function StampsModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean
  onClose: () => void
  /** dotknięcie pieczątki: ekran, który mówi za co jest i ile brakuje */
  onPick?: (parkId: string) => void
}) {
  const { parks } = useGameState()
  const earned = FEATURES.filter((f) => isParkComplete(f.id, parks)).length
  const sorted = [...FEATURES].sort((a, b) => {
    const ea = isParkComplete(a.id, parks)
    const eb = isParkComplete(b.id, parks)
    if (ea !== eb) return ea ? -1 : 1
    return a.properties.name.localeCompare(b.properties.name, 'pl')
  })

  return (
    <Modal open={open} onClose={onClose} title="Pieczątki" action="back" presentation="push">
      <p className="t-body-sm stamps-lead">
        Zdobyte: <strong>{earned}</strong> z {FEATURES.length}. Większość dostajesz za punkty
        wyprawy, część miejsc ma próg niższy niż komplet. Dotknij pieczątki, żeby zobaczyć,
        za co dokładnie jest ta jedna.
      </p>
      <div className="stamps-grid">
        {sorted.map((f) => (
          <Stamp
            key={f.id}
            parkId={f.id}
            name={f.properties.name}
            earned={isParkComplete(f.id, parks)}
            size="md"
            showName
            fallback={<Trees />}
            onClick={onPick ? () => onPick(f.id) : undefined}
          />
        ))}
      </div>
    </Modal>
  )
}
