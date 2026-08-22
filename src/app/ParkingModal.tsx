import { useState } from 'react'
import { ArrowUpRight, Navigation, Star } from 'lucide-react'
import { IconButton, Modal, PlaceRow } from '../ds'
import { TileMap } from './TileMap'
import { RouteModal } from './RouteModal'
import { OCCUPANCY_LABEL, PARKING } from './data/parking'
import { walkRoute } from './data/walk-routes'
import { reviewsUrl } from './data/amenities'

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
  /* strzałka pokazuje najpierw dojście w dużym kadrze, a nawigacja jest w nim */
  const [routeFor, setRouteFor] = useState<string | null>(null)
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
            map={<TileMap parkId={parkId} point={s.coords} route={walkRoute(parkId, s.id)} showStraight />}
            onMapClick={() => setRouteFor(s.id)}
            title={s.name}
            pills={[s.fee, s.occupancy ? OCCUPANCY_LABEL[s.occupancy] : null].filter(Boolean) as string[]}
            note={s.hint}
            extra={
              <a
                className="app-chip -link t-caption"
                href={reviewsUrl(s.name, s.coords)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Star size={13} />
                Opinie i zdjęcia
                <ArrowUpRight size={13} className="app-chip__arrow" />
              </a>
            }
            selected={picked === s.id}
            onClick={() => setPicked(picked === s.id ? null : s.id)}
            action={
              <IconButton
                aria-label={`Prowadź: ${s.name}`}
                variant="tonal"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${s.coords[1]},${s.coords[0]}`,
                    '_blank',
                    'noopener',
                  )
                }
              >
                <Navigation size={18} />
              </IconButton>
            }
          />
        ))}
      </div>
      {(() => {
        const spot = spots.find((x) => x.id === routeFor)
        if (!spot) return null
        return (
          <RouteModal
            open
            onClose={() => setRouteFor(null)}
            parkId={parkId}
            title={spot.name}
            point={spot.coords}
            route={walkRoute(parkId, spot.id)}
          />
        )
      })()}
    </Modal>
  )
}
