import { Trees } from 'lucide-react'
import { Modal, Stamp } from '../ds'
import { useGameState } from './state'
import parksData from './data/parks.json'
import type { ParkFeature } from './ParkSheet'

const FEATURES = parksData.features as unknown as ParkFeature[]

/** the collection: every park sticker, pale until collected */
export function StampsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { parks } = useGameState()
  const earned = FEATURES.filter((f) => parks[f.id]).length
  const sorted = [...FEATURES].sort((a, b) => {
    const ea = !!parks[a.id]
    const eb = !!parks[b.id]
    if (ea !== eb) return ea ? -1 : 1
    return a.properties.name.localeCompare(b.properties.name, 'pl')
  })

  return (
    <Modal open={open} onClose={onClose} title="Pieczątki" action="back">
      <p className="t-body-sm stamps-lead">
        Zdobyte: <strong>{earned}</strong> z {FEATURES.length}. Pieczątkę dostajesz przy pierwszej
        wizycie w parku.
      </p>
      <div className="stamps-grid">
        {sorted.map((f) => (
          <Stamp
            key={f.id}
            parkId={f.id}
            name={f.properties.name}
            earned={!!parks[f.id]}
            size="md"
            showName
            fallback={<Trees />}
          />
        ))}
      </div>
    </Modal>
  )
}
