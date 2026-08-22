import { ChevronRight, CircleParking, MapPin } from 'lucide-react'
import type { ParkFeature } from './ParkSheet'
import { heroPhoto } from './data/parkinfo'
import { photosForPark } from './data/quests'
import type { QuestPoi } from './data/quests'
import type { ParkingInfo } from './data/parking'
import { KIND_META } from './kinds'
import { asset } from './assets'

/** peek: the park in one glance; swipe up for the full sheet */
export function ParkPeekContent({
  park,
  earned,
  total,
}: {
  park: ParkFeature
  earned: number
  total: number
}) {
  const kind = KIND_META[park.properties.kind] ?? KIND_META.park
  /*
   * Miniatura zamiast pierścienia postępu (Jarek, 2026-08-22): postęp i tak
   * stoi słowami w podpisie („quest 0/3"), a puste kółko nie mówiło nic o
   * miejscu. Zdjęcie odpowiada na pytanie, które zadajesz na mapie: jak tam
   * jest. Punkt obok ma dokładnie taką samą miniaturę, więc karta jest spójna.
   */
  const photo = heroPhoto(park.id) ?? photosForPark(park.id)[0]?.src ?? null
  return (
    <div className="peek-park">
      <span className="peek-park__media">
        {photo ? <img src={asset(photo)} alt="" /> : kind.icon}
      </span>
      <div className="peek-park__text">
        <p className="peek-park__name">{park.properties.name}</p>
        <p className="t-caption peek-park__meta">
          {kind.label} · {String(park.properties.areaHa).replace('.', ',')} ha
          {total > 1 ? ` · quest ${earned}/${total}` : ''} · przeciągnij w górę
        </p>
      </div>
    </div>
  )
}

/** peek: the suggested parking; tap through for the full list */
export function ParkingPeekContent({ parking, onOpen }: { parking: ParkingInfo; onOpen: () => void }) {
  return (
    <button className="peek-poi" onClick={onOpen}>
      <span className="peek-poi__media -parking">
        <CircleParking />
      </span>
      <span className="peek-poi__text">
        <span className="peek-poi__name">{parking.name}</span>
        <span className="t-caption peek-poi__teaser">{parking.fee} · zobacz wszystkie sugestie</span>
      </span>
      <ChevronRight className="peek-poi__chevron" size={20} />
    </button>
  )
}

/** peek: one quest point; tap through for the full story */
export function PoiPeekContent({
  poi,
  collected,
  onOpen,
}: {
  poi: QuestPoi
  collected: boolean
  onOpen: () => void
}) {
  return (
    <button className="peek-poi" onClick={onOpen}>
      <span className="peek-poi__media">
        {poi.photo ? <img src={asset(poi.photo)} alt="" /> : <MapPin />}
      </span>
      <span className="peek-poi__text">
        <span className="peek-poi__name">{poi.name}</span>
        <span className="t-caption peek-poi__teaser">
          {collected ? 'Odkryty · przeczytaj całość' : poi.teaser}
        </span>
      </span>
      <ChevronRight className="peek-poi__chevron" size={20} />
    </button>
  )
}
