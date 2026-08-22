import { Footprints, MapPin } from 'lucide-react'
import { Modal } from '../ds'
import { useGameState } from './state'
import type { Journey } from './state'
import parksData from './data/parks.json'
import { KIND_META } from './kinds'

/**
 * Moje wyprawy jako lista wizualna.
 *
 * Wcześniej były wierszami w profilu: ikona, nazwa i sucha linijka liczb. Jarek
 * poprosił o „jakąś ładniejszą formę, może wizualną", i tym czymś jest **własny
 * ślad**. Każda wyprawa ma inny kształt, więc kafel ze śladem rozpoznajesz z
 * odległości metra, tak jak zdjęcie rozpoznaje się szybciej niż podpis.
 *
 * Ślad rysujemy z zapisanego, uproszczonego przebiegu (`journey.track`), bez
 * mapy: dwadzieścia miniatur to dwadzieścia kontekstów graficznych, a tu liczy
 * się sam kształt drogi, nie to, co pod nią leżało.
 */

const parkName = (id: string) =>
  (parksData as { features: Array<{ id: string; properties: { name: string; kind: string } }> }).features.find(
    (f) => f.id === id,
  )?.properties ?? { name: id, kind: 'park' }

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })

const fmtDuration = (ms: number) => {
  const m = Math.max(1, Math.round(ms / 60000))
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`
}

/** ślad jako polilinia w kwadracie 64×64, wpisana w dostępne miejsce */
function TrackArt({ track }: { track: Array<[number, number]> }) {
  if (track.length < 2)
    return (
      <span className="jrn__art -empty" aria-hidden="true">
        <MapPin size={18} />
      </span>
    )
  const lons = track.map((c) => c[0])
  const lats = track.map((c) => c[1])
  const minX = Math.min(...lons)
  const maxX = Math.max(...lons)
  const minY = Math.min(...lats)
  const maxY = Math.max(...lats)
  /* skala wspólna dla obu osi, żeby kształt nie był rozciągnięty */
  const span = Math.max(maxX - minX, maxY - minY) || 1e-5
  const pad = 8
  const size = 64
  const scale = (size - pad * 2) / span
  const offX = (size - (maxX - minX) * scale) / 2
  const offY = (size - (maxY - minY) * scale) / 2
  const pts = track
    .map((c) => {
      const x = (c[0] - minX) * scale + offX
      /* szerokość geograficzna rośnie w górę, a piksele w dół */
      const y = size - ((c[1] - minY) * scale + offY)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="jrn__art" aria-hidden="true">
      <polyline points={pts} className="jrn__line" />
      <circle cx={pts.split(' ')[0].split(',')[0]} cy={pts.split(' ')[0].split(',')[1]} r="3.2" className="jrn__start" />
    </svg>
  )
}

export function JourneysModal({
  open,
  onClose,
  onOpenJourney,
}: {
  open: boolean
  onClose: () => void
  onOpenJourney: (id: string) => void
}) {
  const { journeys } = useGameState()
  const rows = [...journeys].sort((a, b) => b.startedAt - a.startedAt)
  const km = (j: Journey) => (j.distanceM / 1000).toFixed(1).replace('.', ',')

  return (
    <Modal open={open} onClose={onClose} title="Moje wyprawy" action="back" presentation="push">
      {rows.length === 0 ? (
        <p className="t-body-sm settings-lead">
          Jeszcze nic tu nie ma. Wyprawa zapisuje się sama, gdy ją zakończysz, i wtedy zostaje z niej
          ślad, czas i punkty.
        </p>
      ) : (
        <>
          <p className="t-body-sm settings-lead">
            {rows.length} {rows.length === 1 ? 'wyprawa' : rows.length < 5 ? 'wyprawy' : 'wypraw'}, od
            najnowszej. Każdy kafel pokazuje kształt Twojej drogi.
          </p>
          <div className="jrn__list">
            {rows.map((j) => {
              const park = parkName(j.parkId)
              const kind = KIND_META[park.kind] ?? KIND_META.park
              return (
                <button key={j.id} className="jrn" onClick={() => onOpenJourney(j.id)}>
                  <TrackArt track={j.track} />
                  <span className="jrn__body">
                    <span className="t-body-strong jrn__name">{j.name ?? park.name}</span>
                    <span className="t-caption jrn__meta">{fmtDate(j.startedAt)}</span>
                    <span className="jrn__pills">
                      <span className="jrn__pill">{km(j)} km</span>
                      <span className="jrn__pill">{fmtDuration(j.endedAt - j.startedAt)}</span>
                      {j.points.length > 0 && (
                        <span className="jrn__pill -on">
                          <Footprints size={11} /> {j.points.length}
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="jrn__kind" aria-hidden="true">
                    {kind.icon}
                  </span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </Modal>
  )
}
