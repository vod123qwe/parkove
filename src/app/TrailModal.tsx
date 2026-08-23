import { useMemo, useState } from 'react'
import { Car, Check, Coffee, Footprints, Plus, Signpost, ToyBrick, Trash2 } from 'lucide-react'
import { Button, Modal, PlaceRow } from '../ds'
import { TileMap } from './TileMap'
import { COLOUR_PL, TRAIL_INK, trailsFor } from './data/trails'
import type { Trail } from './data/trails'
import { formatDistance } from './geo'
import { chooseTrail, useGameState } from './state'
import { plPunkty } from './naming'
import { questForPark } from './data/quests'
import { PARKING } from './data/parking'
import { amenitiesFor, isFood } from './data/amenities'
import { buildMyTrail, dropMyTrail, myTrailsFor } from './customtrail'
import type { Stop } from './customtrail'

/**
 * Wybór szlaku dla miejsca, i układanie własnego.
 *
 * Dwa rodzaje gotowych wariantów stoją tu obok siebie świadomie (decyzja Jarka
 * 2026-08-22: „jedno i drugie"). Szlak znakowany to prawda z terenu, więc
 * dostaje swój kolor i nazwę taką, jaką znajdziesz na drzewie. Trasa przez
 * punkty jest nasza: router pieszy układa kolejność punktów wyprawy i wraca
 * na parking.
 *
 * Doszło **układanie własnej trasy** (Jarek: „chciałbym móc wybrać parking i
 * oznaczyć, czy parking ma być wliczony w ścieżkę"). Cofa to poprzednią decyzję
 * o wariantach bez edycji, ale nie do końca: układasz w domu, bo router jest w
 * sieci, a potem trasa leży zapisana i działa offline jak każda inna. Ten sam
 * podział, co przy pobieraniu mapy.
 */

function pillsFor(t: Trail) {
  const out = [formatDistance(t.m), `${t.min} min`]
  if (t.kind === 'points' && t.stops?.length) out.push(`${t.stops.length} ${plPunkty(t.stops.length)}`)
  if (t.kind === 'osm') out.push('znakowany')
  return out
}

const ICON: Record<Stop['kind'], React.ReactNode> = {
  parking: <Car size={15} />,
  poi: <Footprints size={15} />,
  play: <ToyBrick size={15} />,
  food: <Coffee size={15} />,
}

export function TrailModal({
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
  const state = useGameState()
  const ready = trailsFor(parkId)
  const [mine, setMine] = useState(() => myTrailsFor(parkId))
  const trails = [...mine, ...ready]
  const chosenId = state.trails[parkId] ?? null

  /*
   * Wszystko, co w tym miejscu da się postawić na trasie. Parkingi na górze, bo
   * od nich się zaczyna i kończy, potem punkty wyprawy, a na końcu plac zabaw i
   * kawa: to one decydują, czy wyprawa da się przeżyć z dzieckiem.
   */
  const items = useMemo<Stop[]>(() => {
    const out: Stop[] = []
    for (const p of PARKING[parkId] ?? [])
      out.push({ id: `park-${p.name}`, name: p.name, coords: p.coords, kind: 'parking' })
    for (const poi of questForPark(parkId)?.pois ?? [])
      out.push({ id: poi.id, name: poi.name, coords: poi.coords, kind: 'poi' })
    for (const a of amenitiesFor(parkId))
      out.push({
        id: a.id,
        name: a.name,
        coords: a.coords,
        kind: isFood(a.kind) ? 'food' : 'play',
      })
    return out
  }, [parkId])

  const [picking, setPicking] = useState(false)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  const toggle = (id: string) =>
    setPicked((was) => {
      const next = new Set(was)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const chosen = items.filter((i) => picked.has(i.id))
  const withParking = chosen.some((i) => i.kind === 'parking')

  const make = async () => {
    setBusy(true)
    setProblem(null)
    const n = mine.length + 1
    const out = await buildMyTrail(parkId, chosen, `Moja trasa ${n}`)
    setBusy(false)
    if ('error' in out) {
      setProblem(out.error)
      return
    }
    setMine(myTrailsFor(parkId))
    setPicked(new Set())
    setPicking(false)
    chooseTrail(parkId, out.trail.id)
  }

  return (
    <Modal open={open} onClose={onClose} title="Szlak" action="back" presentation="push">
      {/* wyjaśnienie raz, nad listą: w każdym kaflu były to same dwa zdania */}
      <p className="t-body-sm parking-lead">
        Warianty przejścia przez <strong>{parkName}</strong>. Pętle liczymy ścieżkami od
        sugerowanego parkingu, a szlaki znakowane bierzemy z terenu i przycinamy do granic miejsca.
        Wybrany rysuje się na mapie i zostaje na wyprawę, a dotknięcie go jeszcze raz zdejmuje.
      </p>

      {/*
        Układanie własnej trasy. Zwinięte, dopóki go nie otworzysz: lista
        gotowych wariantów jest odpowiedzią w 90 procentach przypadków, a
        checkboxy są dla tych pozostałych.
      */}
      {items.length >= 2 && (
        <div className="mytrail">
          {!picking ? (
            <Button
              variant="tonal"
              size="md"
              icon={<Plus size={17} />}
              onClick={() => setPicking(true)}
            >
              Ułóż własną trasę
            </Button>
          ) : (
            <>
              <p className="t-body-sm mytrail__lead">
                Zaznacz, co ma być na trasie. Router ułoży kolejność sam. Z zaznaczonym parkingiem
                trasa wraca do niego, bo tam stoi auto; bez parkingu to przejście od pierwszego do
                ostatniego punktu.
              </p>
              <div className="mytrail__list">
                {items.map((it) => {
                  const on = picked.has(it.id)
                  return (
                    <button
                      key={it.id}
                      className={`mytrail__item pk-press${on ? ' -on' : ''}`}
                      role="checkbox"
                      aria-checked={on}
                      onClick={() => toggle(it.id)}
                    >
                      <span className="mytrail__box" aria-hidden="true">
                        {on && <Check size={13} />}
                      </span>
                      <span className="mytrail__icon" aria-hidden="true">
                        {ICON[it.kind]}
                      </span>
                      <span className="mytrail__name">{it.name}</span>
                      {it.kind === 'parking' && <span className="mytrail__tag">parking</span>}
                    </button>
                  )
                })}
              </div>
              {problem && (
                <p className="t-caption mytrail__problem" role="status">
                  {problem}
                </p>
              )}
              <div className="mytrail__acts">
                <Button variant="ghost" size="md" onClick={() => setPicking(false)}>
                  Anuluj
                </Button>
                <Button
                  size="md"
                  disabled={chosen.length < 2 || busy}
                  onClick={() => void make()}
                  icon={<Footprints size={17} />}
                >
                  {busy
                    ? 'Układam…'
                    : chosen.length < 2
                      ? 'Zaznacz dwa punkty'
                      : `Ułóż przez ${chosen.length}${withParking ? ' i wróć' : ''}`}
                </Button>
              </div>
              <p className="t-caption mytrail__note">
                Układanie potrzebuje sieci, bo router jest w internecie. Gotowa trasa zostaje
                zapisana i działa potem bez zasięgu.
              </p>
            </>
          )}
        </div>
      )}

      <div className="app-placelist">
        {trails.map((t) => {
          const on = chosenId === t.id
          const own = t.id.startsWith('my-')
          const ink = t.colour ? TRAIL_INK[t.colour] : undefined
          const row = (
            <PlaceRow
              key={t.id}
              icon={on ? <Check size={16} /> : t.kind === 'osm' ? <Signpost size={16} /> : <Footprints size={16} />}
              map={
                <TileMap
                  parkId={parkId}
                  line={t.line}
                  ink={ink}
                  height={148}
                  caption={
                    t.kind === 'osm'
                      ? `odcinek w granicach miejsca, ${formatDistance(t.m)}`
                      : `pętla od parkingu, ${formatDistance(t.m)}`
                  }
                />
              }
              title={t.name}
              pills={own ? [...pillsFor(t), 'moja'] : pillsFor(t)}
              note={
                t.kind === 'osm'
                  ? t.note
                  : own
                    ? t.note
                    : 'Wraca w to samo miejsce, więc auto zostaje tam, gdzie stoi.'
              }
              selected={on}
              onClick={() => {
                chooseTrail(parkId, t.id)
                onClose()
              }}
            />
          )
          /* kosz obok wiersza, bo PlaceRow nie ma slotu na akcje: wlasna trasa
             musi dac sie usunac, gotowa nie ma czego usuwac */
          if (!own) return row
          return (
            <div className="mytrail__row" key={t.id}>
              {row}
              <button
                className="mytrail__drop pk-press"
                aria-label="Usuń moją trasę"
                onClick={() => {
                  dropMyTrail(parkId, t.id)
                  setMine(myTrailsFor(parkId))
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          )
        })}
      </div>
      {trails.some((t) => t.colour) && (
        <p className="t-caption park-credits">
          Kolory szlaków i ich przebieg z OpenStreetMap. W terenie szukaj znaku w kolorze:{' '}
          {[...new Set(trails.map((t) => t.colour).filter(Boolean))]
            .map((c) => COLOUR_PL[c as string])
            .join(', ')}
          .
        </p>
      )}
    </Modal>
  )
}
