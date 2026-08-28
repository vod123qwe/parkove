import { useMemo, useState } from 'react'
import { Camera, Footprints, Mic, Route, Sparkles, StickyNote } from 'lucide-react'
import { Button, Chip, Polaroid, Stat, StatGrid, StoryCard } from '../ds'
import type { Journey } from './state'
import { useMarks } from './photos'
import type { WalkMark } from './photos'
import parksData from './data/parks.json'
import { MemoryViewer } from './MemoryViewer'
import { TileMap } from './TileMap'
import { asset } from './assets'
import {
  plMiejsca,
  plNagrania,
  plNotatki,
  plural,
  plWspomnienia,
  plWyprawy,
  plZdjecia,
} from './naming'

type MemoryFilter = 'all' | 'photo' | 'note' | 'audio'

const DEMO_JOURNEYS: Journey[] = [
  {
    id: 'demo-skalki', parkId: 'skalki-twardowskiego', name: 'Wieczór na Skałkach',
    startedAt: new Date(2026, 7, 18, 18, 10).getTime(), endedAt: new Date(2026, 7, 18, 19, 2).getTime(),
    distanceM: 2800, points: ['twardowski'],
    note: 'Zostaliśmy chwilę dłużej przy punkcie widokowym. Miasto było cichsze niż zwykle.',
    track: [[19.9058, 50.0431], [19.9072, 50.0423], [19.9064, 50.0408], [19.9094, 50.0401], [19.9081, 50.0420]],
  },
  {
    id: 'demo-zakrzowek', parkId: 'zakrzowek', name: 'Pierwszy chłodny poranek',
    startedAt: new Date(2026, 6, 27, 7, 35).getTime(), endedAt: new Date(2026, 6, 27, 8, 16).getTime(),
    distanceM: 1900, points: ['view'],
    note: 'Najlepszy moment był jeszcze przed tłumem, kiedy tafla wody była zupełnie nieruchoma.',
    track: [[19.9121, 50.0391], [19.9142, 50.0385], [19.9148, 50.0368], [19.9127, 50.0361], [19.9118, 50.0376]],
  },
]

const DEMO_MARKS: Array<WalkMark & { url?: string }> = [
  { id: 'demo-photo-sunset', kind: 'photo', parkId: 'skalki-twardowskiego', journeyId: 'demo-skalki', caption: 'Jeszcze pięć minut przed zejściem.', at: new Date(2026, 7, 18, 18, 54).getTime(), coords: [19.9079, 50.0406], url: asset('demo/skalki-sunset.jpg') },
  { id: 'demo-audio-skalki', kind: 'audio', parkId: 'skalki-twardowskiego', journeyId: 'demo-skalki', caption: 'Myśl przy skale Twardowskiego', at: new Date(2026, 7, 18, 18, 43).getTime(), coords: [19.9072, 50.0411], url: asset('demo/twardowski-glos.wav') },
  { id: 'demo-note-skalki', kind: 'note', parkId: 'skalki-twardowskiego', journeyId: 'demo-skalki', caption: 'Czy legenda staje się prawdziwsza, kiedy miejsce pomaga nam w nią uwierzyć?', at: new Date(2026, 7, 18, 18, 42).getTime(), coords: [19.9072, 50.0411] },
  { id: 'demo-photo-rocks', kind: 'photo', parkId: 'skalki-twardowskiego', journeyId: 'demo-skalki', caption: 'Słońce weszło między skały.', at: new Date(2026, 7, 18, 18, 29).getTime(), coords: [19.9067, 50.0421], url: asset('demo/skalki-rocks.jpg') },
  { id: 'demo-photo-path', kind: 'photo', parkId: 'skalki-twardowskiego', journeyId: 'demo-skalki', caption: 'Ścieżka była węższa, niż pamiętałem.', at: new Date(2026, 7, 18, 18, 18).getTime(), coords: [19.9060, 50.0428], url: asset('demo/skalki-path.jpg') },
  { id: 'demo-note-zakrzowek', kind: 'note', parkId: 'zakrzowek', journeyId: 'demo-zakrzowek', caption: 'Wrócić tu jesienią, o tej samej porze.', at: new Date(2026, 6, 27, 8, 4).getTime() },
]

/* przechyly miniaturek: deterministyczne, zeby rzad wygladal na odlozony reka */
const TILTS = [-2.4, 1.8, -1.1]

const park = (id: string) =>
  (parksData as { features: Array<{ id: string; properties: { name: string } }> })
    .features.find((item) => item.id === id)?.properties.name ?? id

const date = (ms: number) =>
  new Date(ms).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })

const month = (ms: number) =>
  new Date(ms).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })

const duration = (ms: number) => {
  const mins = Math.max(1, Math.round(ms / 60000))
  return mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${String(mins % 60).padStart(2, '0')}`
}

export function MemoryJournal({ journeys, onOpenJourney }: { journeys: Journey[]; onOpenJourney: (id: string) => void }) {
  const marks = useMarks().filter((mark) => mark.kind !== 'car')
  const [filter, setFilter] = useState<MemoryFilter>('all')
  const [memoryId, setMemoryId] = useState<string | null>(null)
  /* Bez historii pamiętnik otwiera się wypełniony przykładem, żeby pokazać,
     po co istnieje. Baner nazywa symulację wprost, a jego zamknięcie odsłania
     prawdziwy pusty stan. Nic z demo nie trafia do storage. */
  const [demo, setDemo] = useState(() => journeys.length === 0)
  const sourceJourneys = demo && journeys.length === 0 ? DEMO_JOURNEYS : journeys
  const sourceMarks = demo && journeys.length === 0 ? DEMO_MARKS : marks
  const rows = useMemo(() => [...sourceJourneys].sort((a, b) => b.startedAt - a.startedAt), [sourceJourneys])
  const journeyIds = useMemo(() => new Set(rows.map((journey) => journey.id)), [rows])
  const attachedMarks = sourceMarks.filter((mark) => mark.journeyId && journeyIds.has(mark.journeyId))
  const shown = rows.filter((journey) =>
    filter === 'all' || attachedMarks.some((mark) => mark.journeyId === journey.id && mark.kind === filter),
  )
  const viewerJourneyId = memoryId ? attachedMarks.find((mark) => mark.id === memoryId)?.journeyId : null
  const viewerMarks = viewerJourneyId ? attachedMarks.filter((mark) => mark.journeyId === viewerJourneyId) : []

  return (
    <div className="memjrnl">
      <header className="memjrnl__intro">
        <span className="memjrnl__kicker"><Sparkles size={14} /> Twój pamiętnik miejsc</span>
        <h2 className="memjrnl__title">Nie tylko gdzie byłeś. Co zostało.</h2>
        <p className="t-body-sm memjrnl__lead">Wyprawy, odkryte punkty i własne wspomnienia układają się tu w jedną historię.</p>
      </header>

      {demo && journeys.length === 0 && (
        <div className="memjrnl__demo t-caption">
          <span><Sparkles size={14} /> Podgląd koncepcji, dane przykładowe</span>
          <button type="button" onClick={() => { setDemo(false); setMemoryId(null) }}>Zamknij podgląd</button>
        </div>
      )}

      <StatGrid cols={3} className="memjrnl__stats">
        <Stat icon={<Footprints size={16} />} value={String(rows.length)} label={plWyprawy(rows.length)} />
        <Stat icon={<Camera size={16} />} value={String(attachedMarks.length)} label={plWspomnienia(attachedMarks.length)} />
        <Stat
          icon={<Route size={16} />}
          value={String(new Set(rows.map((journey) => journey.parkId)).size)}
          label={plMiejsca(new Set(rows.map((journey) => journey.parkId)).size)}
        />
      </StatGrid>

      <div className="memjrnl__filters" aria-label="Filtr wspomnień">
        <Chip selected={filter === 'all'} onClick={() => setFilter('all')}>Wszystko</Chip>
        <Chip icon={<Camera size={14} />} selected={filter === 'photo'} onClick={() => setFilter('photo')}>Zdjęcia</Chip>
        <Chip icon={<StickyNote size={14} />} selected={filter === 'note'} onClick={() => setFilter('note')}>Notatki</Chip>
        <Chip icon={<Mic size={14} />} selected={filter === 'audio'} onClick={() => setFilter('audio')}>Nagrania</Chip>
      </div>

      {rows.length === 0 ? (
        <div className="memjrnl__empty">
          <span className="memjrnl__emptyicon"><Sparkles size={22} /></span>
          <h3 className="t-title">Pierwszy rozdział jeszcze przed Tobą</h3>
          <p className="t-body-sm">Po zakończeniu wyprawy znajdziesz tu jej trasę, zdjęcia, notatki i odkryte punkty.</p>
          <Button variant="tonal" onClick={() => setDemo(true)}>Podejrzyj przykładowy pamiętnik</Button>
        </div>
      ) : shown.length === 0 ? (
        <p className="t-body-sm memjrnl__nothing">W tych wyprawach nie ma jeszcze takich wspomnień.</p>
      ) : (
        <div className="memjrnl__timeline">
          {shown.map((journey, index) => {
            const mine = attachedMarks.filter((mark) => mark.journeyId === journey.id)
            const photos = mine.filter((mark) => mark.kind === 'photo' && mark.url)
            const notes = mine.filter((mark) => mark.kind === 'note')
            const audio = mine.filter((mark) => mark.kind === 'audio')
            const previous = shown[index - 1]
            const startsMonth = !previous || month(previous.startedAt) !== month(journey.startedAt)
            const memories = [
              photos.length ? `${photos.length} ${plZdjecia(photos.length)}` : '',
              notes.length ? `${notes.length} ${plNotatki(notes.length)}` : '',
              audio.length ? `${audio.length} ${plNagrania(audio.length)}` : '',
            ].filter(Boolean)
            return (
              <section key={journey.id} className="memjrnl__chapter">
                {startsMonth && <h3 className="memjrnl__month">{month(journey.startedAt)}</h3>}
                <span className="memjrnl__dot" aria-hidden="true" />
                <StoryCard
                  eyebrow={date(journey.startedAt)}
                  title={journey.name ?? park(journey.parkId)}
                  meta={`${park(journey.parkId)} · ${(journey.distanceM / 1000).toFixed(1).replace('.', ',')} km · ${duration(journey.endedAt - journey.startedAt)}`}
                  media={
                    <TileMap
                      parkId={journey.parkId}
                      line={journey.track.length > 1 ? journey.track : undefined}
                      caption={null}
                      height={146}
                    />
                  }
                  gallery={
                    photos.length
                      ? photos.slice(0, 3).map((photo, at) => (
                          <Polaroid key={photo.id} src={photo.url ?? ''} tilt={TILTS[at % TILTS.length]} />
                        ))
                      : undefined
                  }
                  onClick={() => demo ? setMemoryId(mine[0]?.id ?? null) : onOpenJourney(journey.id)}
                  action={mine.length ? (
                    <Button variant="tonal" onClick={() => setMemoryId(mine[0].id)}>
                      {mine.length === 1
                        ? 'Przeglądaj wspomnienie'
                        : `Przeglądaj ${mine.length} ${plWspomnienia(mine.length)}`}
                    </Button>
                  ) : undefined}
                >
                  {journey.note && <span className="memjrnl__quote">„{journey.note}”</span>}
                  <span className="memjrnl__remains">
                    {memories.length
                      ? memories.join(' · ')
                      : journey.points.length
                        ? `${journey.points.length} ${plural(journey.points.length, 'odkryty punkt', 'odkryte punkty', 'odkrytych punktów')}`
                        : 'Został ślad tej drogi'}
                  </span>
                </StoryCard>
              </section>
            )
          })}
        </div>
      )}
      {memoryId && viewerMarks.length > 0 && (
        <MemoryViewer marks={viewerMarks} startId={memoryId} layer="journal" onClose={() => setMemoryId(null)} />
      )}
    </div>
  )
}
