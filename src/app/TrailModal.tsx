import { useEffect, useMemo, useRef, useState } from 'react'
import { Car, Check, Coffee, Footprints, Pencil, Plus, Signpost, ToyBrick, Trash2 } from 'lucide-react'
import { Button, Modal, PlaceRow, Segmented } from '../ds'
import { TileMap } from './TileMap'
import { COLOUR_PL, TRAIL_INK, trailsFor } from './data/trails'
import type { Trail } from './data/trails'
import { formatDistance } from './geo'
import { chooseTrail, useGameState } from './state'
import { plPunkty } from './naming'
import { questForPark } from './data/quests'
import { PARKING } from './data/parking'
import { amenitiesFor, isFood } from './data/amenities'
import { buildMyTrail, dropMyTrail, myTrailsFor, routeMyTrail } from './customtrail'
import { TrailEditor } from './TrailEditor'
import type { RoutedTrip, Stop } from './customtrail'

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

/** pętla, gdy koniec linii wraca pod sam początek */
function isLoop(t: Trail) {
  const a = t.line[0]
  const b = t.line[t.line.length - 1]
  if (!a || !b) return false
  const dx = (a[0] - b[0]) * 71500
  const dy = (a[1] - b[1]) * 111300
  return Math.hypot(dx, dy) < 120
}

/*
 * Ksztalt trasy jednym slowem. Generator odroznia petle od spaceru miara
 * zawracania (docs/trails.md) i zapisuje to w NAZWIE, bo geometria konca
 * tego nie powie: obejscie parku zawsze wraca na start, tylko spacer robi
 * to czesciowo ta sama sciezka. Dlatego czytamy nazwe, nie tylko domkniecie.
 */
function shape(t: Trail): 'pętla' | 'spacer' | 'przejście' {
  if (t.name.startsWith('Spacer')) return 'spacer'
  return isLoop(t) ? 'pętla' : 'przejście'
}

/*
 * Kategorie wyboru. Kolejnosc jest odpowiedzia na "co dzis robimy": najpierw
 * petle (pokazuja park), potem zbieranie punktow (mechanika gry), potem
 * przejscie, szlaki z terenu i wlasne uklady.
 */
/*
 * Rola trasy, ktora moze jej brakowac: dane liczone przed 2026-08-25 nie maja
 * pola role, a caly katalog przeliczymy dopiero przelotem. Do tego czasu
 * wnioskujemy role z identyfikatora, zeby kategorie nie klamaly.
 */
function roleOf(t: Trail): string {
  if (t.role) return t.role
  if (t.kind === 'osm') return 'osm'
  if (t.id.startsWith('my-')) return 'mine'
  if (t.id === 'przez-park') return 'przejscie'
  if (t.id.startsWith('petla') || t.id.startsWith('wokol')) return 'petla'
  return 'punkty'
}

const GROUPS: Array<{ key: string; label: string; pick: (all: Trail[]) => Trail[] }> = [
  { key: 'petla', label: 'PĘTLE PO PARKU', pick: (all) => all.filter((t) => roleOf(t) === 'petla') },
  {
    key: 'punkty',
    label: 'PRZEZ PUNKTY WYPRAWY',
    pick: (all) => all.filter((t) => roleOf(t) === 'punkty'),
  },
  { key: 'przejscie', label: 'PRZEJŚCIE', pick: (all) => all.filter((t) => roleOf(t) === 'przejscie') },
  { key: 'osm', label: 'SZLAKI ZNAKOWANE', pick: (all) => all.filter((t) => roleOf(t) === 'osm') },
  { key: 'mine', label: 'TWOJE UKŁADY', pick: (all) => all.filter((t) => roleOf(t) === 'mine') },
]

/** krotka etykieta na pigulke wariantu, gdy generator nie dal nazwy */
function shortName(t: Trail) {
  if (t.colour) return COLOUR_PL[t.colour] ?? t.name
  return t.name.replace(/^Pętla |^Trasa |^Spacer /, '')
}

function pillsFor(t: Trail) {
  const out = [formatDistance(t.m), `${t.min} min`]
  /*
   * Pokrycie na pigulce, bo to jedyna liczba, ktora odpowiada na pytanie
   * "czy zobaczymy park, czy przejdziemy skrajem" (Jarek 2026-08-25). Miara
   * i progi: docs/trails.md.
   */
  if (t.cov != null && t.cov >= 25) out.push(`${t.cov}% parku`)
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

  /*
   * Ktory wariant pokazuje kategoria. Wybor jest lokalny dla ekranu: dopiero
   * dotkniecie karty zapisuje trase na wyprawe.
   */
  const [variantAt, setVariantAt] = useState<Record<string, number>>({})
  /*
   * Edytor otwiera sie jako OSOBNY EKRAN (Jarek 2026-08-25: "zeby mapa byla
   * wieksza"). Trzymamy tu tylko przystanki, od ktorych ma zaczac.
   */
  const [editorFrom, setEditorFrom] = useState<string[] | null>(null)
  const [picking, setPicking] = useState(false)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)

  /*
   * Podgląd na żywo (uwaga Jarka): każda zmiana zaznaczenia po chwili pyta
   * router i rysuje trasę na mapce nad listą. Debounce 600 ms, żeby seria
   * tapnięć nie sypała zapytaniami; spóźniona odpowiedź starszego zapytania
   * wypada po numerze biegu, więc mapka nigdy nie cofa się do starej trasy.
   */
  const [preview, setPreview] = useState<RoutedTrip | null>(null)
  const [previewBusy, setPreviewBusy] = useState(false)
  const previewRun = useRef(0)

  const toggle = (id: string) =>
    setPicked((was) => {
      const next = new Set(was)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const chosen = items.filter((i) => picked.has(i.id))
  const withParking = chosen.some((i) => i.kind === 'parking')

  useEffect(() => {
    if (!picking) return
    const run = ++previewRun.current
    if (chosen.length < 2) {
      setPreview(null)
      setPreviewBusy(false)
      return
    }
    setPreviewBusy(true)
    const timer = window.setTimeout(() => {
      void routeMyTrail(chosen).then((out) => {
        if (previewRun.current !== run) return
        setPreviewBusy(false)
        setPreview('error' in out ? null : out.trip)
      })
    }, 600)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picking, picked])

  const make = async () => {
    setBusy(true)
    setProblem(null)
    const n = mine.length + 1
    const out = await buildMyTrail(parkId, chosen, `Moja trasa ${n}`, preview ?? undefined)
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

  /* jeden wiersz trasy: mapka, nazwa, pigulki, akcje. Wspolny dla kategorii */
  const renderRow = (t: Trail) => {
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
                : `${shape(t)}, ${formatDistance(t.m)}`
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
              : shape(t) === 'pętla'
                ? 'Pętla: kończy się tam, gdzie się zaczęła.'
                : shape(t) === 'spacer'
                  ? 'Wraca na start, ale część drogi pokonasz dwa razy.'
                  : 'Przejście przez park, bez powrotu na start.'
        }
        selected={on}
        onClick={() => {
          chooseTrail(parkId, t.id)
          onClose()
        }}
      />
    )
    /*
     * Akcje obok wiersza, bo PlaceRow nie ma slotu: własna trasa ma kosz, a
     * gotowa trasa punktowa ma ołówek (Jarek: "albo wziąć ją i edytować,
     * dodając ręcznie punkt"). Ołówek wsypuje przystanki do kreatora.
     */
    const editable = !own && t.kind === 'points' && (t.stops?.length ?? 0) >= 2
    if (!own && !editable) return row
    return (
      <div className="mytrail__row" key={t.id}>
        {row}
        {own ? (
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
        ) : (
          <button
            className="mytrail__drop pk-press"
            aria-label={`Edytuj trasę ${t.name} na mapie`}
            onClick={() => setEditorFrom(t.stops ?? [])}
          >
            <Pencil size={16} />
          </button>
        )}
      </div>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Szlak" action="back" presentation="push">
      {/* wyjaśnienie raz, nad listą: w każdym kaflu były to same dwa zdania */}
      <p className="t-body-sm parking-lead">
        Trasy przez <strong>{parkName}</strong>. Dotknięcie wybiera, drugie zdejmuje.
        Parking dokładasz sam: ołówek przy trasie otwiera ją w kreatorze.
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
                Zaznaczaj punkty, mapka rysuje trasę na żywo. Z parkingiem trasa wraca do niego;
                bez niego idzie od pierwszego do ostatniego punktu.
              </p>
              <div className={`mytrail__preview${previewBusy ? ' -busy' : ''}`}>
                {preview ? (
                  <TileMap
                    parkId={parkId}
                    line={preview.line}
                    height={148}
                    caption={`${formatDistance(preview.m)} · ${preview.min} min${previewBusy ? ' · liczę…' : ''}`}
                  />
                ) : (
                  <p className="t-caption mytrail__previewhint">
                    {chosen.length < 2
                      ? 'Podgląd pokaże się od dwóch punktów.'
                      : previewBusy
                        ? 'Liczę trasę…'
                        : 'Nie udało się policzyć podglądu. Sieć jest?'}
                  </p>
                )}
              </div>
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
                Układanie potrzebuje sieci; zapisana trasa działa potem offline.
              </p>
            </>
          )}
        </div>
      )}

      {/*
        KATEGORIE, nie jedna dluga lista (Jarek 2026-08-25: "sekcja sciezki
        moze sie dzielic na takie kategorie i moge wewnatrz nich wybrac
        jedna"). W kategorii z kilkoma wariantami stoi rzad pigulek, a karta
        pokazuje wybrany: porownanie jest przeklikaniem, nie przewijaniem
        czterech mapek pod sobą.
      */}
      {GROUPS.map((g) => {
        const items = g.pick(trails)
        if (!items.length) return null
        const idx = Math.min(variantAt[g.key] ?? 0, items.length - 1)
        const shown = items[idx]
        return (
          <section key={g.key} className="trailgroup">
            <p className="t-caption trailgroup__head">
              {g.label}
              {items.length > 1 && <span className="trailgroup__count">{items.length}</span>}
            </p>
            {items.length > 1 && (
              /* ten sam Segmented, co przy zakladkach miejsc i na Osiagnieciach */
              <Segmented
                className="trailgroup__variants"
                aria-label={`Warianty: ${g.label}`}
                options={items.map((t, i) => ({ value: String(i), label: t.variant ?? shortName(t) }))}
                value={String(idx)}
                onChange={(v) => setVariantAt((was) => ({ ...was, [g.key]: Number(v) }))}
              />
            )}
            {renderRow(shown)}
          </section>
        )
      })}

      {trails.some((t) => t.colour) && (
        <p className="t-caption park-credits">
          Kolory szlaków i ich przebieg z OpenStreetMap. W terenie szukaj znaku w kolorze:{' '}
          {[...new Set(trails.map((t) => t.colour).filter(Boolean))]
            .map((c) => COLOUR_PL[c as string])
            .join(', ')}
          .
        </p>
      )}
      {editorFrom && (
        <TrailEditor
          parkId={parkId}
          parkName={parkName}
          initialStops={editorFrom}
          onClose={() => setEditorFrom(null)}
          onSaved={(id) => {
            setEditorFrom(null)
            setMine(myTrailsFor(parkId))
            chooseTrail(parkId, id)
            onClose()
          }}
        />
      )}
    </Modal>
  )
}
