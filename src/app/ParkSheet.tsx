import { useEffect, useState } from 'react'
import {
  BusFront,
  Check,
  ChevronRight,
  CircleParking,
  Coffee,
  Compass,
  MapPin,
  Square,
  ToyBrick,
  Trees,
} from 'lucide-react'
import {
  BottomSheet,
  Button,
  Carousel,
  Collapsible,
  List,
  ListItem,
  MediaHero,
  ProgressRing,
  Stamp,
} from '../ds'
import { KIND_META } from './kinds'
import { suggestedParking } from './data/parking'
import { PhotoButton } from './PhotoButton'
import { PARK_INFO } from './data/parkinfo'
import { amenitiesFor, isFood } from './data/amenities'
import { MODE_LABEL, TRANSIT, transitDirectionsUrl } from './data/transit'
import { asset } from './assets'
import { checkIn, collectPoint, startExpedition, stopExpedition, useGameState } from './state'
import { walkName } from './naming'
import { distanceToParkM, formatDistance, pointInPark } from './geo'
import type { ParkGeometry, Pt } from './geo'
import { pointsTotal, questForPark } from './data/quests'
import type { QuestPoi } from './data/quests'

export type ParkFeature = {
  id: string
  properties: { id: string; name: string; kind: string; areaHa: number; center: [number, number] }
  geometry: ParkGeometry
}

type Status =
  | { s: 'idle' }
  | { s: 'locating' }
  | { s: 'success'; first: boolean }
  | { s: 'far'; distance: string }
  | { s: 'error'; message: string }

const CHECKIN_BUFFER_M = 100

export function ParkSheet({
  park,
  onClose,
  onReveal,
  onOpenPoi,
  onOpenParking,
  onOpenAmenity,
}: {
  park: ParkFeature | null
  onClose: () => void
  onReveal: (poi: QuestPoi) => void
  onOpenPoi: (poi: QuestPoi) => void
  onOpenParking: () => void
  onOpenAmenity: (kind: 'food' | 'playground') => void
}) {
  const { parks, expedition } = useGameState()
  const [status, setStatus] = useState<Status>({ s: 'idle' })

  useEffect(() => {
    setStatus({ s: 'idle' })
  }, [park?.id])

  if (!park) return null
  const progress = parks[park.id]
  const visited = !!progress
  const kind = KIND_META[park.properties.kind] ?? KIND_META.park
  const ha = String(park.properties.areaHa).replace('.', ',')
  const quest = questForPark(park.id)
  const total = pointsTotal(park.id)
  const collected = new Set(progress?.points ?? [])
  const earned = quest ? collected.size : visited ? 1 : 0
  const onExpeditionHere = expedition?.parkId === park.id

  const doCheckIn = () => {
    if (!navigator.geolocation) {
      setStatus({ s: 'error', message: 'Ta przeglądarka nie udostępnia lokalizacji.' })
      return
    }
    setStatus({ s: 'locating' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const pt: Pt = [pos.coords.longitude, pos.coords.latitude]
        const inside = pointInPark(pt, park.geometry)
        const dist = inside ? 0 : distanceToParkM(pt, park.geometry)
        if (inside || dist <= CHECKIN_BUFFER_M) {
          checkIn(park.id)
          setStatus({ s: 'success', first: !visited })
        } else {
          setStatus({ s: 'far', distance: formatDistance(dist) })
        }
      },
      () => setStatus({ s: 'error', message: 'Nie udało się odczytać lokalizacji. Sprawdź uprawnienia.' }),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    )
  }

  const simulateVisit = () => {
    checkIn(park.id)
    setStatus({ s: 'success', first: !visited })
  }

  const simulateNextPoi = () => {
    if (!quest) return
    const next = quest.pois.find((p) => !collected.has(p.id))
    if (!next) return
    collectPoint(park.id, next.id)
    onReveal(next)
  }

  const info = PARK_INFO[park.id]
  const spots = amenitiesFor(park.id)
  const hasFood = spots.some((a) => isFood(a.kind))
  const hasPlay = spots.some((a) => !isFood(a.kind))
  const heroMeta = `${kind.label} · ${ha} ha${quest ? ` · quest: ${quest.pois.length} punktów` : ''}`

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={park.properties.name}
      modal={false}
      hero={
        <div className="park-heroslot">
          <MediaHero
            images={info?.photos?.map((p) => ({ src: asset(p.src), credit: p.credit })) ?? []}
            title={park.properties.name}
            meta={heroMeta}
            fallback={<Trees strokeWidth={1.5} />}
          />
          <Stamp
            parkId={park.id}
            name={park.properties.name}
            earned={visited}
            size="md"
            fallback={<Trees />}
            className={`park-herostamp${visited ? '' : ' -locked'}`}
          />
        </div>
      }
    >
      <div className="park-progress">
        <ProgressRing value={(earned / total) * 100} size="lg" label={`${earned}/${total}`} />
        <div className="park-progress__text">
          {earned >= total ? (
            <>
              <p className="t-body-strong">Zahaczony w całości!</p>
              <p className="t-body-sm park-muted">
                {progress!.visits === 1 ? '1 wizyta' : `${progress!.visits} wizyt`} · złota odznaka
              </p>
            </>
          ) : visited ? (
            <>
              <p className="t-body-strong">Odwiedzony</p>
              <p className="t-body-sm park-muted">
                {quest
                  ? `Zebrano ${earned} z ${total} punktów wyprawy.`
                  : `${progress!.visits === 1 ? '1 wizyta' : `${progress!.visits} wizyt`} · ostatnia ${new Date(progress!.lastAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}`}
              </p>
            </>
          ) : (
            <>
              <p className="t-body-strong">Jeszcze nieodkryty</p>
              <p className="t-body-sm park-muted">
                {quest
                  ? 'Wystartuj wyprawę i zbieraj punkty. Historie odblokują się na miejscu.'
                  : 'Wejdź do parku i zamelduj się, żeby odkryć go na mapie.'}
              </p>
            </>
          )}
        </div>
      </div>

      {info?.description && (
        <Collapsible className="park-about" lines={4}>
          {info.description.map((p, i) => (
            <p key={i} className="t-body park-about__para">
              {p}
            </p>
          ))}
        </Collapsible>
      )}

      {info?.amenities && (
        <List className="park-amenities">
          {info.amenities.playground && (
            <ListItem
              className="-stacked"
              icon={<ToyBrick />}
              leadTone={info.amenities.playground.has ? 'accent' : 'neutral'}
              title={info.amenities.playground.has ? 'Plac zabaw' : 'Bez placu zabaw'}
              meta={info.amenities.playground.note}
              trailing={hasPlay ? <ChevronRight size={18} className="park-parking__chevron" /> : undefined}
              onClick={hasPlay ? () => onOpenAmenity('playground') : undefined}
            />
          )}
          {info.amenities.food && (
            <ListItem
              className="-stacked"
              icon={<Coffee />}
              leadTone={info.amenities.food.has ? 'accent' : 'neutral'}
              title={info.amenities.food.has ? 'Kawiarnia lub jedzenie' : 'Bez gastronomii'}
              meta={info.amenities.food.note}
              trailing={hasFood ? <ChevronRight size={18} className="park-parking__chevron" /> : undefined}
              onClick={hasFood ? () => onOpenAmenity('food') : undefined}
            />
          )}
        </List>
      )}

      {quest && (
        <Carousel className="park-carousel" aria-label="Punkty wyprawy">
          {quest.pois.map((poi) => {
            const got = collected.has(poi.id)
            return (
              <button key={poi.id} className="poicard" onClick={() => onOpenPoi(poi)} role="listitem">
                <div className="poicard__media">
                  {poi.photo ? <img src={asset(poi.photo)} alt="" loading="lazy" /> : <MapPin />}
                  {got && (
                    <span className="poicard__check">
                      <Check size={13} />
                    </span>
                  )}
                </div>
                <p className="poicard__name">{poi.name}</p>
                <p className="poicard__teaser t-caption">{got ? 'Odkryty · czytaj więcej' : poi.teaser}</p>
              </button>
            )
          })}
        </Carousel>
      )}

      {suggestedParking(park.id) && (
        <button className="park-parking -info" onClick={onOpenParking}>
          <CircleParking size={18} />
          <div className="park-parking__body">
            <p className="t-label park-parking__name">{suggestedParking(park.id)!.name}</p>
            <p className="t-caption park-parking__hint">
              {suggestedParking(park.id)!.fee} · {suggestedParking(park.id)!.hint}
            </p>
          </div>
          <ChevronRight size={18} className="park-parking__chevron" />
        </button>
      )}

      {TRANSIT[park.id] && (
        <button
          className="park-parking"
          onClick={() =>
            window.open(transitDirectionsUrl(park.properties.center), '_blank', 'noopener')
          }
        >
          <BusFront size={18} />
          <div className="park-parking__body">
            <p className="t-label park-parking__name">
              {MODE_LABEL[TRANSIT[park.id].mode]}: {TRANSIT[park.id].stop}
            </p>
            <p className="t-caption park-parking__hint">
              {TRANSIT[park.id].lines ? `Linie ${TRANSIT[park.id].lines}. ` : ''}
              {TRANSIT[park.id].note} Dotknij, żeby Google Maps wyliczyło trasę z Twojego miejsca.
            </p>
          </div>
          <ChevronRight size={18} className="park-parking__chevron" />
        </button>
      )}

      {status.s === 'success' && (
        <p className="t-body-sm park-status -ok" role="status">
          {status.first ? 'Zaliczone! Park odkryty na mapie.' : 'Zameldowano kolejną wizytę.'}
        </p>
      )}
      {status.s === 'far' && (
        <p className="t-body-sm park-status -bad" role="status">
          Jesteś {status.distance} od granicy. Podejdź bliżej i spróbuj ponownie.
        </p>
      )}
      {status.s === 'error' && (
        <p className="t-body-sm park-status -bad" role="status">
          {status.message}
        </p>
      )}

      {quest ? (
        <>
          {onExpeditionHere ? (
            <Button full size="lg" icon={<Square size={18} />} onClick={stopExpedition}>
              Zakończ wyprawę
            </Button>
          ) : (
            <Button full size="lg" icon={<Compass size={18} />} onClick={() => {
              // the tap is the gesture iOS needs before it will consider notifications
              if ('Notification' in window && Notification.permission === 'default')
                void Notification.requestPermission().catch(() => {})
              startExpedition(park.id, walkName(park.properties.name))
              onClose()
            }}>
              Start wyprawy
            </Button>
          )}
          <Button
            full
            variant="tonal"
            icon={<MapPin size={16} />}
            onClick={doCheckIn}
            disabled={status.s === 'locating'}
            className="park-secondbtn"
          >
            {status.s === 'locating' ? 'Sprawdzam pozycję…' : 'Jestem tu (meldunek)'}
          </Button>
          <PhotoButton
            parkId={park.id}
            defaultCaption={park.properties.name}
            className="park-secondbtn"
            variant="ghost"
          />
        </>
      ) : (
        <Button full size="lg" icon={<MapPin size={18} />} onClick={doCheckIn} disabled={status.s === 'locating'}>
          {status.s === 'locating' ? 'Sprawdzam pozycję…' : 'Jestem tu'}
        </Button>
      )}

      {info?.photos && info.photos.some((p) => p.credit) && (
        <p className="t-caption park-credits">
          Zdjęcia: {info.photos.map((p) => p.credit).filter(Boolean).join(' · ')}
        </p>
      )}

      {import.meta.env.DEV && (
        <>
          {quest && earned < total && (
            <Button full variant="ghost" onClick={simulateNextPoi} className="park-devbtn">
              Symuluj następny punkt (dev)
            </Button>
          )}
          {!visited && (
            <Button full variant="ghost" onClick={simulateVisit} className="park-devbtn">
              Symuluj obecność (dev)
            </Button>
          )}
        </>
      )}
    </BottomSheet>
  )
}
