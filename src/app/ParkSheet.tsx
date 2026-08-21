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
  ActionBar,
  BottomSheet,
  Button,
  Carousel,
  Collapsible,
  PhotoSlider,
  ProgressRing,
  Stamp,
} from '../ds'
import { KIND_META } from './kinds'
import { suggestedParking } from './data/parking'
import { PhotoButton } from './PhotoButton'
import { PARK_INFO } from './data/parkinfo'
import { amenitiesFor, isFood, topChips } from './data/amenities'
import { MODE_LABEL, TRANSIT, transitDirectionsUrl } from './data/transit'
import { asset } from './assets'
import { checkIn, collectPoint, stopExpedition, useGameState } from './state'
import { stampNeed } from './progress'
import { beginWalk } from './walk'
import { distanceToParkM, formatDistance, pointInPark } from './geo'
import type { ParkGeometry, Pt } from './geo'
import { pointsTotal, questForPark, photosForPark } from './data/quests'
import type { QuestPoi } from './data/quests'

export type ParkFeature = {
  id: string
  properties: {
    id: string
    name: string
    kind: string
    areaHa: number
    center: [number, number]
    /** which collection a place belongs to; missing means a Kraków park */
    group?: 'dolinki'
  }
  geometry: ParkGeometry
}

type Status =
  | { s: 'idle' }
  | { s: 'locating' }
  | { s: 'success'; first: boolean }
  | { s: 'far'; distance: string }
  | { s: 'error'; message: string }

const CHECKIN_BUFFER_M = 100

/*
 * Podpis pod zdjęciem: autor i licencja, bez nazwy serwisu. CC wymaga
 * autorstwa i licencji, a „· Wikimedia Commons" na końcu zawijało każdy
 * podpis na dwie linie szarego tekstu pod każdym zdjęciem.
 */
const shortCredit = (c?: string) => c?.replace(/\s*·\s*Wikimedia Commons\s*$/, '')

export function ParkSheet({
  park,
  onClose,
  onReveal,
  onOpenPoi,
  onOpenParking,
  onOpenAmenity,
  onPhotoSaved,
}: {
  park: ParkFeature | null
  onClose: () => void
  onReveal: (poi: QuestPoi) => void
  onOpenPoi: (poi: QuestPoi) => void
  onOpenParking: () => void
  onOpenAmenity: (kind: 'food' | 'playground') => void
  /** a fresh picture opens its own sheet, where the caption gets written */
  onPhotoSaved: (photoId: string) => void
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
  /*
   * Nagłówek bierze zdjęcia parku, a gdy ich nie ma, zdjęcia jego punktów.
   * Pięć pilotażowych parków miało opisane punkty ze zdjęciami i mimo to pustą
   * ikonę na górze karty, bo nikt nie wpisał im galerii osobno.
   */
  const gallery = (() => {
    const own = info?.photos ?? []
    const fromPois = photosForPark(park.id)
    const seen = new Set(own.map((p) => p.src))
    return [...own, ...fromPois.filter((p) => !seen.has(p.src))]
  })()
  const spots = amenitiesFor(park.id)
  /** polska odmiana: 1 miejsce, 2 miejsca, 5 miejsc */
  const plPlaces = (n: number) =>
    n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'miejsca' : 'miejsc'
  const foodCount = spots.filter((a) => isFood(a.kind)).length
  /* cechy z OSM: nawierzchnia i wiek u placu, kuchnia i ogrodek u jedzenia */
  const playChips = topChips(park.id, false)
  const foodChips = topChips(park.id, true)
  const playCount = spots.length - foodCount
  const hasFood = foodCount > 0
  const hasPlay = playCount > 0
  const plPoints = (n: number) =>
    n === 1 ? 'punkt' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'punkty' : 'punktów'
  const heroMeta = `${kind.label} · ${ha} ha${quest ? ` · ${quest.pois.length} ${plPoints(quest.pois.length)}` : ''}`

  /*
   * Ile trzeba na pieczątkę (reguła mieszka w progress.ts) i jak to powiedzieć.
   * Miejsce bez questa daje pieczątkę za samo bycie na miejscu.
   */
  const need = stampNeed(park.id)
  const hasStamp = need > 0 ? earned >= need : visited
  const left = Math.max(0, need - earned)
  const stampNote = hasStamp
    ? need > 0
      ? `Zdobyta za ${need} ${plPoints(need)} wyprawy.`
      : 'Zdobyta za meldunek na miejscu.'
    : need > 0
      ? `Za ${need} ${plPoints(need)} wyprawy. Brakuje ${left}.`
      : 'Za meldunek na miejscu. Zamelduj się, gdy tam będziesz.'
  /* jedna linijka autorstwa pod całością, bez powtarzania tego samego nazwiska */
  const creditLine = [
    ...new Set(gallery.map((g) => shortCredit(g.credit)?.replace(/^Fot\.\s*/, '')).filter(Boolean)),
  ].join(' · ')

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={park.properties.name}
      modal={false}
    >
      {/*
        Tytuł mieszka w nagłówku arkusza, NAD zdjęciami. Na zdjęciu potrzebował
        scrimu, który połykał górną część kadru, a nazwa i tak walczyła z trawaą.
        Zdjęcia dostały własny slider w marginesach strony, jedno na ekran.
      */}
      <p className="t-body-sm park-herometa">{heroMeta}</p>
      <div className="park-gallery">
        <PhotoSlider
          images={gallery.map((p) => ({ src: asset(p.src) }))}
          ratio="16:9"
          showCredit={false}
          fallback={<Trees strokeWidth={1.5} />}
          aria-label={`Zdjęcia: ${park.properties.name}`}
        />
      </div>
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

      {/*
        Dwa pudełka obok siebie zamiast dwóch wierszy listy: plac zabaw i kawa to
        jedno pytanie („da się tam wyjść z dzieckiem?"), więc odpowiedź powinna
        być jednym spojrzeniem, a nie czytaniem dwóch akapitów.
      */}
      {info?.amenities && (
        <div className="park-amenities">
          {info.amenities.playground && (
            <button
              className={`park-amenity${info.amenities.playground.has ? ' -yes' : ''}`}
              onClick={hasPlay ? () => onOpenAmenity('playground') : undefined}
              disabled={!hasPlay}
            >
              <ToyBrick size={20} />
              <span className="t-body-strong park-amenity__title">Plac zabaw</span>
              <span className="t-caption park-amenity__status">
                {info.amenities.playground.has
                  ? playCount > 1
                    ? `${playCount} w okolicy`
                    : 'jest na miejscu'
                  : 'nie ma'}
              </span>
              {playChips.length > 0 && (
                <span className="t-caption park-amenity__chips">{playChips.join(' · ')}</span>
              )}
              {hasPlay && (
                <span className="park-amenity__go" aria-hidden="true">
                  <ChevronRight size={16} />
                </span>
              )}
            </button>
          )}
          {info.amenities.food && (
            <button
              className={`park-amenity${info.amenities.food.has ? ' -yes' : ''}`}
              onClick={hasFood ? () => onOpenAmenity('food') : undefined}
              disabled={!hasFood}
            >
              <Coffee size={20} />
              <span className="t-body-strong park-amenity__title">Kawa i jedzenie</span>
              <span className="t-caption park-amenity__status">
                {info.amenities.food.has
                  ? foodCount > 1
                    ? `${foodCount} ${plPlaces(foodCount)} w okolicy`
                    : 'jedno miejsce'
                  : 'nie ma'}
              </span>
              {foodChips.length > 0 && (
                <span className="t-caption park-amenity__chips">{foodChips.join(' · ')}</span>
              )}
              {hasFood && (
                <span className="park-amenity__go" aria-hidden="true">
                  <ChevronRight size={16} />
                </span>
              )}
            </button>
          )}
        </div>
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

      {/* meldunek i zdjęcie zostają w treści; decyzja siedzi w pasku na dole */}
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
        onSaved={onPhotoSaved}
        className="park-secondbtn"
        variant="ghost"
      />

      {/*
        Pieczątka dostaje własną komórkę między liniami: nalepka po lewej, po prawej
        za co jest i czy już jest. Na zdjęciu ginieła, a nad zdjęciami udawała
        część nagłówka, którym nie jest.
      */}
      <div className="park-stampcell">
        <Stamp
          parkId={park.id}
          name={park.properties.name}
          earned={hasStamp}
          size="md"
          fallback={<Trees />}
          className={`park-stampcell__art${hasStamp ? '' : ' -locked'}`}
        />
        <div className="park-stampcell__text">
          <p className="t-body-strong">Pieczątka miejsca</p>
          <p className="t-caption park-muted">{stampNote}</p>
        </div>
      </div>

      {creditLine && <p className="t-caption park-credits">Zdjęcia: {creditLine}</p>}

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

      {/* jedna decyzja, przyklejona do dołu: reszta karty przewija się pod nią */}
      <ActionBar>
        {onExpeditionHere ? (
          <Button full size="lg" icon={<Square size={18} />} onClick={stopExpedition}>
            Zakończ wyprawę
          </Button>
        ) : (
          <Button
            full
            size="lg"
            icon={<Compass size={18} />}
            onClick={() => {
              beginWalk(park.id, park.properties.name)
              onClose()
            }}
          >
            Start wyprawy
          </Button>
        )}
      </ActionBar>
    </BottomSheet>
  )
}
