import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Footprints, MapPin, Route, Timer } from 'lucide-react'
import { NavBar, Segmented, Stat, StatGrid } from '../ds'
import { DiscoveriesScreen } from './DiscoveriesScreen'
import { useGameState } from './state'
import type { Journey } from './state'
import parksData from './data/parks.json'
import { KIND_META } from './kinds'
import { plWyprawy } from './naming'
import { useLightChrome } from '../ds/useLightChrome'

/**
 * Wyprawy i odkrycia POD JEDNYM DACHEM (Jarek 2026-08-25: „moje wyprawy to
 * bym jakoś połączył z moimi odkryciami, może jakiś przełącznik u góry,
 * i jakoś uspójnił te ekrany i dodał dane").
 *
 * Oba ekrany odpowiadają na to samo pytanie („gdzie byliśmy?"), tylko innym
 * językiem: wyprawy listą śladów, odkrycia mapą chmur. Dlatego jeden pełny
 * ekran, wspólny pasek i przełącznik, a nie dwa wejścia w menu.
 *
 * Dodane dane: nad listą wypraw stoi podsumowanie wszystkiego, co przeszliśmy
 * (wyprawy, kilometry, czas w drodze). Odkrycia mają swoją kartę liczb na
 * dole mapy, więc tam nic nie dokładamy.
 */

const parkName = (id: string) =>
  (
    parksData as { features: Array<{ id: string; properties: { name: string; kind: string } }> }
  ).features.find((f) => f.id === id)?.properties ?? { name: id, kind: 'park' }

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
      <circle
        cx={pts.split(' ')[0].split(',')[0]}
        cy={pts.split(' ')[0].split(',')[1]}
        r="3.2"
        className="jrn__start"
      />
    </svg>
  )
}

export type JournalTab = 'wyprawy' | 'odkrycia'

export function JournalScreen({
  initialTab = 'wyprawy',
  onClose,
  onOpenJourney,
}: {
  initialTab?: JournalTab
  onClose: () => void
  onOpenJourney: (id: string) => void
}) {
  const [tab, setTab] = useState<JournalTab>(initialTab)
  const { journeys } = useGameState()
  /* jasny pasek systemowy przy liście, ciemny nad mapą chmur */
  useLightChrome(tab === 'wyprawy')

  const rows = useMemo(() => [...journeys].sort((a, b) => b.startedAt - a.startedAt), [journeys])
  const km = (j: Journey) => (j.distanceM / 1000).toFixed(1).replace('.', ',')
  const totalKm = journeys.reduce((s, j) => s + j.distanceM, 0) / 1000
  const totalMs = journeys.reduce((s, j) => s + (j.endedAt - j.startedAt), 0)

  /*
   * PORTAL do body, ta sama lekcja co .jscreen i edytor trasy: app-shell ma
   * position: fixed, a Chromium robi z fixed kontekst stosu, wiec z-index 210
   * liczyl sie tylko WEWNATRZ shella i modal profilu (portal na body, 200)
   * zaslanial dziennik. Zmierzone elementFromPoint przed poprawka.
   */
  return createPortal(
    <div className={`jrnl${tab === 'odkrycia' ? ' -dark' : ''}`}>
      <NavBar
        className="jrnl__nav"
        title="Wyprawy i odkrycia"
        variant="back"
        scrolled
        onAction={onClose}
      />
      <div className="jrnl__seg">
        <Segmented
          aria-label="Widok dziennika"
          options={[
            { value: 'wyprawy', label: 'Wyprawy' },
            { value: 'odkrycia', label: 'Odkrycia' },
          ]}
          value={tab}
          onChange={(t) => setTab(t as JournalTab)}
        />
      </div>

      {tab === 'wyprawy' ? (
        <div className="jrnl__body">
          {rows.length === 0 ? (
            <p className="t-body-sm settings-lead">
              Jeszcze nic tu nie ma. Wyprawa zapisuje się sama, gdy ją zakończysz, i wtedy zostaje
              z niej ślad, czas i punkty.
            </p>
          ) : (
            <>
              <StatGrid cols={3} className="jrnl__stats">
                <Stat icon={<Footprints size={16} />} value={String(rows.length)} label={plWyprawy(rows.length)} />
                <Stat
                  icon={<Route size={16} />}
                  value={totalKm >= 10 ? String(Math.round(totalKm)) : totalKm.toFixed(1).replace('.', ',')}
                  label="km razem"
                />
                <Stat icon={<Timer size={16} />} value={fmtDuration(totalMs)} label="w drodze" />
              </StatGrid>
              <p className="t-caption jrnl__hint">
                Miniatura po lewej to kształt Twojej drogi, ze złotą kropką na starcie.
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
        </div>
      ) : (
        <div className="jrnl__disc">
          <DiscoveriesScreen embedded onClose={onClose} />
        </div>
      )}
    </div>,
    document.body,
  )
}
