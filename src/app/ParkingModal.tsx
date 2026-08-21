import { useState } from 'react'
import { Navigation } from 'lucide-react'
import { IconButton, Modal, PlaceRow } from '../ds'
import { TileMap } from './TileMap'
import { OCCUPANCY_LABEL, PARKING } from './data/parking'

const navigateTo = ([lng, lat]: [number, number]) => {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
}

/**
 * Parkingi przy jednym miejscu.
 *
 * Przebudowane po uwadze Jarka: wcześniej nazwy ucinały się w wąskiej komórce,
 * a opisy leżały pod listą osobnym blokiem, więc czytając opis nie wiedziałeś
 * już, o którym parkingu mowa. Teraz każdy wiersz ma pełną nazwę, opłatę jako
 * znacznik i swoje dwa zdania, a nad listą jest szkic pokazujący, który jest z
 * której strony. Dotknięcie wiersza zaznacza pin, strzałka prowadzi w Google:
 * dwie różne intencje, dwa różne dotknięcia.
 */
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
  const [picked, setPicked] = useState<string | null>(null)
  return (
    <Modal open={open} onClose={onClose} title="Parking" action="back" presentation="push">
      <p className="t-body-sm parking-lead">
        Sugerowane miejsca przy: <strong>{parkName}</strong>. Każdy kafel ma swój kadr mapy z
        dojściem do granicy parku, a strzałka prowadzi nawigacją.
      </p>
      <div className="app-placelist">
        {spots.map((s, i) => (
          <PlaceRow
            key={s.id}
            index={i + 1}
            map={<TileMap parkId={parkId} point={s.coords} />}
            title={s.name}
            pills={[s.fee, s.occupancy ? OCCUPANCY_LABEL[s.occupancy] : null].filter(Boolean) as string[]}
            note={s.hint}
            selected={picked === s.id}
            onClick={() => setPicked(picked === s.id ? null : s.id)}
            action={
              <IconButton
                aria-label={`Prowadź: ${s.name}`}
                variant="tonal"
                onClick={() => navigateTo(s.coords)}
              >
                <Navigation size={18} />
              </IconButton>
            }
          />
        ))}
      </div>
    </Modal>
  )
}
