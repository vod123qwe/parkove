import { useMemo, useState } from 'react'
import { Award, Camera, Clock, Footprints, Mic, Pencil, Route, StickyNote, Trees } from 'lucide-react'
import { Carousel, Modal, Polaroid, Stat, StatGrid } from '../ds'
import { useGameState } from './state'
import { usePhotos } from './photos'
import { getName, greeting, setName as saveName } from './profile'
import {
  plMiejsca,
  plNaklejki,
  plNagrania,
  plNotatki,
  plOdpowiedzi,
  plPunkty,
  plRazy,
  plWyprawy,
  plZdjecia,
} from './naming'
import { CATEGORY_LABEL, QUESTS, questForPark } from './data/quests'
import type { PoiCategory } from './data/quests'
import { stampNeed } from './progress'
import parksData from './data/parks.json'

/**
 * Moje liczby.
 *
 * Zastąpiło „Hej" i profil-worek (Jarek, 2026-08-22: „zamiast hej, niech to
 * będzie widok z moimi statystykami"). Zasada wyboru liczb: **każda ma coś
 * mówić o tobie**, a nie tylko rosnąć. Kilometry i wyprawy to skala, rozkład
 * kategorii mówi, jakim jesteście typem chodzących, godzina startu mówi, kiedy
 * wam wychodzi wyjść, a „najbliżej naklejki" to jedyna liczba, która jest
 * zaproszeniem: da się ją zmienić dzisiaj.
 *
 * Czego tu nie ma: rankingów i porównań z kimkolwiek. Ta aplikacja nie ma
 * innych ludzi i nie będzie mieć.
 */

const FEATURES = (parksData as {
  features: Array<{ id: string; properties: { name: string } }>
}).features

const parkName = (id: string) => FEATURES.find((f) => f.id === id)?.properties.name ?? id

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })


export function StatsModal({
  open,
  onClose,
  onOpenPark,
}: {
  open: boolean
  onClose: () => void
  /** dotknięcie miejsca zamyka ekran i pokazuje je na mapie */
  onOpenPark: (parkId: string) => void
}) {
  const { parks: progress, journeys, answers } = useGameState()
  const marks = usePhotos()
  const photos = marks.filter((m) => m.kind === 'photo' && m.url)
  const [name, setNameState] = useState(getName)
  const [editing, setEditing] = useState(false)

  const commitName = (value: string) => {
    setNameState(value)
    saveName(value)
    setEditing(false)
  }

  const stats = useMemo(() => {
    const km = journeys.reduce((s, j) => s + j.distanceM, 0) / 1000
    const ms = journeys.reduce((s, j) => s + (j.endedAt - j.startedAt), 0)
    const visited = Object.keys(progress).length
    const points = Object.values(progress).reduce((s, p) => s + p.points.length, 0)
    const pointsAll = QUESTS.reduce((s, q) => s + q.pois.length, 0)
    const stamps = Object.entries(progress).filter(([id, p]) => {
      const need = stampNeed(id)
      return need > 0 ? p.points.length >= need : p.visits > 0
    }).length

    /* rekord i pierwsza wyprawa: dwie daty, ktore cos znacza */
    const longest = journeys.reduce<(typeof journeys)[number] | null>(
      (best, j) => (!best || j.distanceM > best.distanceM ? j : best),
      null,
    )
    const first = journeys.reduce<(typeof journeys)[number] | null>(
      (old, j) => (!old || j.startedAt < old.startedAt ? j : old),
      null,
    )
    const last = journeys.reduce<(typeof journeys)[number] | null>(
      (recent, j) => (!recent || j.startedAt > recent.startedAt ? j : recent),
      null,
    )

    /* ulubione: najwiecej wizyt, a przy remisie to odwiedzone najswiezej */
    const favourite = Object.entries(progress)
      .sort((a, b) => b[1].visits - a[1].visits || b[1].lastAt.localeCompare(a[1].lastAt))[0]

    /* co lubicie: rozklad odkrytych punktow po kategoriach */
    const byCategory = new Map<PoiCategory, number>()
    for (const [parkId, p] of Object.entries(progress)) {
      const quest = questForPark(parkId)
      if (!quest) continue
      for (const poi of quest.pois)
        if (p.points.includes(poi.id))
          byCategory.set(poi.category, (byCategory.get(poi.category) ?? 0) + 1)
    }
    const taste = [...byCategory.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

    /* kiedy wychodzicie: najczestsza godzina startu */
    const hours = new Map<number, number>()
    for (const j of journeys) {
      const h = new Date(j.startedAt).getHours()
      hours.set(h, (hours.get(h) ?? 0) + 1)
    }
    const favHour = [...hours.entries()].sort((a, b) => b[1] - a[1])[0]

    /* najblizej naklejki: jedna rzecz, ktora da sie zrobic dzisiaj */
    let close: { parkId: string; got: number; need: number } | null = null
    for (const q of QUESTS) {
      const need = stampNeed(q.parkId)
      const got = progress[q.parkId]?.points.length ?? 0
      if (got >= need || got === 0) continue
      if (!close || need - got < close.need - close.got) close = { parkId: q.parkId, got, need }
    }

    return {
      km,
      ms,
      visited,
      points,
      pointsAll,
      stamps,
      longest,
      first,
      last,
      favourite,
      taste,
      favHour,
      close,
      photos: marks.filter((m) => m.kind === 'photo').length,
      notes: marks.filter((m) => m.kind === 'note').length,
      voices: marks.filter((m) => m.kind === 'audio').length,
      dilemmas: Object.keys(answers).length,
    }
  }, [progress, journeys, marks, answers])

  const hours = Math.floor(stats.ms / 3600000)
  const mins = Math.round((stats.ms % 3600000) / 60000)
  const timeLabel = stats.ms === 0 ? '0' : hours > 0 ? `${hours} h ${String(mins).padStart(2, '0')}` : `${mins} min`
  const tasteMax = stats.taste[0]?.[1] ?? 1

  return (
    <Modal open={open} onClose={onClose} title="Moje liczby" action="back" presentation="push">
      {/* imię zostaje tu, bo to jedyne miejsce, w którym apka mówi do ciebie */}
      <div className="stats__hello">
        {editing ? (
          <input
            className="marksheet__input"
            defaultValue={name}
            autoFocus
            placeholder="Jak masz na imię?"
            onBlur={(e) => commitName(e.target.value.trim())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
          />
        ) : (
          <button className="stats__name" onClick={() => setEditing(true)}>
            {greeting(name)} <Pencil size={14} />
          </button>
        )}
      </div>

      <StatGrid>
        <Stat icon={<Route />} value={stats.km.toFixed(1).replace('.', ',')} label="kilometrów" />
        <Stat icon={<Footprints />} value={String(journeys.length)} label={plWyprawy(journeys.length)} />
        <Stat icon={<Clock />} value={timeLabel} label="w terenie" />
        <Stat icon={<Award />} value={String(stats.stamps)} label={plNaklejki(stats.stamps)} />
      </StatGrid>

      <h3 className="t-title stats__title">Odkryte</h3>
      <p className="t-body-sm stats__line">
        <strong>{stats.visited}</strong> z {FEATURES.length - 1} {plMiejsca(FEATURES.length - 1)} i{' '}
        <strong>{stats.points}</strong> z {stats.pointsAll} {plPunkty(stats.pointsAll)}.
        {stats.close && (
          <>
            {' '}
            Najbliżej naklejki jesteś w{' '}
            <button className="stats__link" onClick={() => onOpenPark(stats.close!.parkId)}>
              {parkName(stats.close.parkId)}
            </button>
            : {stats.close.got} z {stats.close.need} {plPunkty(stats.close.need)}.
          </>
        )}
      </p>

      {stats.taste.length > 0 && (
        <>
          <h3 className="t-title stats__title">Co lubicie</h3>
          <p className="t-body-sm stats__line">
            Rozkład odkrytych punktów. Mówi więcej niż suma: pokazuje, po co tam chodzicie.
          </p>
          <div className="stats__bars">
            {stats.taste.map(([cat, n]) => (
              <div key={cat} className="stats__bar">
                <span className="t-caption stats__barlabel">{CATEGORY_LABEL[cat]}</span>
                <span className="stats__bartrack">
                  <span className="stats__barfill" style={{ width: `${(n / tasteMax) * 100}%` }} />
                </span>
                <span className="t-caption stats__barnum">{n}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {(stats.longest || stats.favourite || stats.favHour) && (
        <>
          <h3 className="t-title stats__title">Rekordy i nawyki</h3>
          <ul className="stats__facts">
            {stats.longest && (
              <li>
                Najdłuższa wyprawa: <strong>{(stats.longest.distanceM / 1000).toFixed(1).replace('.', ',')} km</strong>,{' '}
                {parkName(stats.longest.parkId)}, {fmtDate(stats.longest.startedAt)}.
              </li>
            )}
            {/* nazwa po dwukropku: polskiej odmiany nazw wlasnych nie da sie szablonem */}
            {stats.favourite && (
              <li>
                Najczęściej wracacie: <strong>{parkName(stats.favourite[0])}</strong>,{' '}
                {stats.favourite[1].visits} {plRazy(stats.favourite[1].visits)}.
              </li>
            )}
            {stats.favHour && (
              <li>
                Najczęściej wychodzicie około <strong>{stats.favHour[0]}:00</strong>.
              </li>
            )}
            {stats.first && <li>Chodzicie od {fmtDate(stats.first.startedAt)}.</li>}
            {stats.last && <li>Ostatnia wyprawa: {fmtDate(stats.last.startedAt)}.</li>}
          </ul>
        </>
      )}

      {/*
        Zdjęcia zostają tutaj, bo to jedyna rzecz w tej apce, która jest tak samo
        Twoja jak liczby, tylko przyjemniejsza do patrzenia. Wcześniej mieszkały w
        profilu, który zniknął.
      */}
      {photos.length > 0 && (
        <>
          <h3 className="t-title stats__title">Zdjęcia z wypraw</h3>
          <Carousel fade={false} className="prof-photos" aria-label="Zdjęcia z wypraw">
            {photos.map((ph, i) => (
              <Polaroid
                key={ph.id}
                src={ph.url!}
                caption={ph.caption || undefined}
                meta={`${parkName(ph.parkId)} · ${fmtDate(ph.at)}`}
                tilt={i % 2 ? 1.5 : -1.5}
              />
            ))}
          </Carousel>
        </>
      )}

      <h3 className="t-title stats__title">Zostawione ślady</h3>
      <div className="stats__marks">
        <span className="stats__mark">
          <Camera size={15} /> {stats.photos} {plZdjecia(stats.photos)}
        </span>
        <span className="stats__mark">
          <StickyNote size={15} /> {stats.notes} {plNotatki(stats.notes)}
        </span>
        <span className="stats__mark">
          <Mic size={15} /> {stats.voices} {plNagrania(stats.voices)}
        </span>
        <span className="stats__mark">
          <Trees size={15} /> {stats.dilemmas} {plOdpowiedzi(stats.dilemmas)} na dylematy
        </span>
      </div>
    </Modal>
  )
}
