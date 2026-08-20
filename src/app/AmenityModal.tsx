import { Coffee, Navigation, ToyBrick } from 'lucide-react'
import { IconButton, List, ListItem, Modal } from '../ds'
import { KIND_LABEL, amenitiesFor, isFood, walkUrl } from './data/amenities'

/** the list behind a food or playground pin, with walking directions */
export function AmenityModal({
  parkId,
  parkName,
  kind,
  onClose,
}: {
  parkId: string
  parkName: string
  kind: 'food' | 'playground' | null
  onClose: () => void
}) {
  const wantFood = kind === 'food'
  const spots = amenitiesFor(parkId).filter((s) => isFood(s.kind) === wantFood)

  return (
    <Modal
      presentation="push"
      open={kind != null}
      onClose={onClose}
      title={wantFood ? 'Kawiarnie i jedzenie' : 'Place zabaw'}
      action="back"
    >
      <p className="t-body-sm parking-lead">
        {wantFood ? 'Jedzenie i kawa' : 'Place zabaw'} w okolicy: <strong>{parkName}</strong>. Dane
        z OpenStreetMap, więc godziny warto sprawdzić na miejscu.
      </p>
      <List className="parking-list">
        {spots.map((s) => (
          <ListItem
            key={s.id}
            icon={wantFood ? <Coffee /> : <ToyBrick />}
            leadTone="accent"
            title={s.name}
            meta={KIND_LABEL[s.kind]}
            trailing={
              <IconButton
                aria-label={`Prowadź: ${s.name}`}
                variant="tonal"
                onClick={() => window.open(walkUrl(s.coords), '_blank', 'noopener')}
              >
                <Navigation size={18} />
              </IconButton>
            }
          />
        ))}
      </List>
    </Modal>
  )
}
