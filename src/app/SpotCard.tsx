import { Compass, X } from 'lucide-react'
import { IconButton } from '../ds'
import { KIND_LABEL, walkUrl } from './data/amenities'
import type { AmenitySpot } from './data/amenities'
import type { WalkMark } from './photos'

/**
 * Wybrana kawiarnia, plac zabaw albo parking.
 *
 * Ta karta nie doklejaja się pod kartą wyprawy, a **zajmuje jej miejsce**: na
 * dole ekranu ma być jedna rzecz naraz, inaczej dwa białe prostokąty walczą o
 * to samo spojrzenie. Zamknięcie wraca do tego, co było.
 */
export function SpotCard({
  spot,
  placeName,
  photos,
  onOpenPhoto,
  onClose,
}: {
  spot: AmenitySpot
  placeName?: string
  /** Twoje zdjęcia zrobione w promieniu kilkudziesięciu metrów od tego pinu */
  photos: Array<WalkMark & { url?: string }>
  onOpenPhoto: (markId: string) => void
  onClose: () => void
}) {
  return (
    <div className="app-spotcard">
      {photos.length > 0 && (
        <div className="app-spotcard__shots">
          {photos.slice(0, 3).map((m) => (
            <button
              key={m.id}
              className="app-spotcard__shot"
              onClick={() => onOpenPhoto(m.id)}
              aria-label="Otwórz zdjęcie"
            >
              <img src={m.url} alt={m.caption || 'Zdjęcie tego miejsca'} />
            </button>
          ))}
        </div>
      )}
      <div className="app-spotcard__body">
        <p className="t-body-strong">{spot.name}</p>
        <p className="t-caption park-muted">
          {KIND_LABEL[spot.kind]}
          {placeName ? ` · ${placeName}` : ''}
        </p>
      </div>
      {/* same ikony: dwa napisy zjadały szerokość, której na 375 px nie ma */}
      <IconButton
        aria-label={`Prowadź: ${spot.name}`}
        variant="tonal"
        onClick={() => window.open(walkUrl(spot.coords), '_blank', 'noopener')}
      >
        <Compass size={18} />
      </IconButton>
      <IconButton aria-label="Zamknij" variant="ghost" onClick={onClose}>
        <X size={18} />
      </IconButton>
    </div>
  )
}
