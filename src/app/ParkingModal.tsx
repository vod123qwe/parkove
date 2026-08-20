import { CircleParking, Navigation } from 'lucide-react'
import { IconButton, List, ListItem, Modal } from '../ds'
import { OCCUPANCY_LABEL, PARKING } from './data/parking'

const navigateTo = ([lng, lat]: [number, number]) => {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
}

export function ParkingModal({
  parkId,
  parkName,
  open,
  onClose,
}: {
  parkId: string
  parkName: string
  open: boolean
  onClose: () => void
}) {
  const spots = PARKING[parkId] ?? []
  return (
    <Modal open={open} onClose={onClose} title="Parking" action="back">
      <p className="t-body-sm parking-lead">
        Sugerowane miejsca parkingowe przy: <strong>{parkName}</strong>. Pierwsze na liście
        pokazujemy na mapie.
      </p>
      <List className="parking-list">
        {spots.map((s, i) => (
          <ListItem
            key={s.id}
            icon={<CircleParking />}
            leadTone={i === 0 ? 'accent' : 'neutral'}
            title={s.name}
            meta={`${s.fee}${s.occupancy ? ` · ${OCCUPANCY_LABEL[s.occupancy]}` : ''}`}
            trailing={
              <IconButton aria-label={`Prowadź: ${s.name}`} variant="tonal" onClick={() => navigateTo(s.coords)}>
                <Navigation size={18} />
              </IconButton>
            }
          />
        ))}
      </List>
      {spots.map((s) => (
        <p key={s.id} className="t-caption parking-hint">
          <strong>{s.name}:</strong> {s.hint}
        </p>
      ))}
    </Modal>
  )
}
