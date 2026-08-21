import { ArrowUpRight, Clock, Compass, Globe, Star, X } from 'lucide-react'
import { IconButton } from '../ds'
import { KIND_LABEL, fmtHours, isFood, reviewsUrl, walkUrl } from './data/amenities'
import { detailFor } from './data/amenity-details'
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
  parkId,
  placeName,
  photos,
  onOpenPhoto,
  onClose,
}: {
  spot: AmenitySpot
  /** park, w którym siedzi to miejsce: klucz do szczegółów z OSM */
  parkId?: string
  placeName?: string
  /** Twoje zdjęcia zrobione w promieniu kilkudziesięciu metrów od tego pinu */
  photos: Array<WalkMark & { url?: string }>
  onOpenPhoto: (markId: string) => void
  onClose: () => void
}) {
  const detail = parkId ? detailFor(parkId, spot.id) : null
  /*
   * Link ma sens tylko wtedy, gdy jest czego szukać: bezimienny „Plac zabaw"
   * w Google rozjedzie się na przypadkowy inny plac, więc go nie pokazujemy.
   */
  const hasPlace = isFood(spot.kind) || spot.name !== KIND_LABEL[spot.kind]
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
      {/* nagłówek to jedna linia z akcjami po prawej: ikony trzymają się nazwy,
          a nie środka całej karty, bo ta rośnie razem z cechami */}
      <div className="app-spotcard__head">
        <div className="app-spotcard__body">
          <p className="t-body-strong app-spotcard__name">{spot.name}</p>
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
      {/* co to za miejsce: dwa, trzy słowa z OSM zamiast samej nazwy */}
      {(detail?.chips.length || detail?.hours) && (
        <div className="app-chips">
          {detail.chips.map((c) => (
            <span key={c} className="app-chip t-caption">
              {c}
            </span>
          ))}
          {detail.hours && (
            <span className="app-chip -hours t-caption">
              <Clock size={12} />
              {fmtHours(detail.hours)}
            </span>
          )}
        </div>
      )}
      {/* zdjęć lokalu i dań nie trzymamy u siebie (patrz reviewsUrl): jedno
          dotknięcie prowadzi do galerii i opinii, które i tak są świeższe */}
      {hasPlace && (
        <div className="app-chips -links">
          <a
            className="app-chip -link t-caption"
            href={reviewsUrl(spot.name, spot.coords)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Star size={13} />
            Zdjęcia i opinie
            <ArrowUpRight size={13} className="app-chip__arrow" />
          </a>
          {detail?.site && (
            <a
              className="app-chip -link t-caption"
              href={detail.site}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Globe size={13} />
              Strona
              <ArrowUpRight size={13} className="app-chip__arrow" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}
