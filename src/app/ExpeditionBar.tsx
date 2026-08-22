import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { CarFront, List as ListIcon, Mic, Navigation, Plus, Square, StickyNote, X } from 'lucide-react'
import { Button } from '../ds'
import { useGameState } from './state'
import { questForPark } from './data/quests'
import { distanceM, distanceToParkM, formatDistance } from './geo'
import { bearing } from './heading'
import parksData from './data/parks.json'
import { PhotoButton } from './PhotoButton'
import { VoiceRecorder } from './VoiceRecorder'
import { addMark, deleteMark, listMarks } from './photos'

/** próg, od którego konkretny punkt zaczyna mieć znaczenie */
const NEAR_M = 300

/** zwinięta karta wyprawy: pamiętamy między uruchomieniami */
const FOLD_KEY = 'pk-exp-folded'
/** ruch poniżej tego progu to dotknięcie, nie przeciąganie */
const TAP_SLOP = 6

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${m} min`
}

/**
 * Cały HUD wyprawy: co dalej i co można zrobić.
 *
 * Wcześniej wyprawa mówiła z dwóch miejsc naraz. Góra podawała nazwę, punkty i
 * następny cel, dół w tym samym czasie czas i dystans. Teraz jedna karta na
 * dole mówi, co dalej, a pod nią trzy okrągłe przyciski robią to, co można
 * zrobić. Bez strzałki i bez kompasu: świadoma decyzja, żeby nie prosić o
 * dostęp do żyroskopu i nie udawać nawigacji.
 */
export function ExpeditionBar({
  onRequestStop,
  onPhoto,
  onMark,
  onOpenPoints,
  spotCard,
  targetId,
  heading,
}: {
  /** ending is irreversible, so the bar only asks for it */
  onRequestStop: () => void
  /** a picture only gets a notice: writing can wait */
  onPhoto?: (markId: string) => void
  /** a note or a recording opens right away, because it needs words */
  onMark?: (markId: string) => void
  /** karta miejsca z listą punktów */
  onOpenPoints?: () => void
  /** wybrana kawiarnia albo plac zabaw: zajmuje miejsce karty „co dalej" */
  spotCard?: ReactNode
  /** mały cel wybrany z listy punktów: wypiera automatyczny „najbliższy" */
  targetId?: string | null
  /** kierunek telefonu w stopniach; null, gdy nie ma kompasu albo zgody */
  heading?: number | null
}) {
  const { expedition, parks } = useGameState()
  /*
   * Zwijanie karty palcem. Swipe w dol zabiera gore (kreski postepu, cel i
   * dystans) i zostawia sam pasek z czasem, kilometrami i punktami. Wysokosc
   * idzie za palcem, wiec widzisz, ze to jedna rzecz, ktora sie skraca, a nie
   * dwie karty, ktore sie podmieniaja. Stan przezywa przeladowanie, bo w
   * terenie aplikacja moze wstac od nowa, a decyzja "chce miec wiecej mapy"
   * zostaje ta sama.
   */
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(FOLD_KEY) === '1')
  const [drag, setDrag] = useState<number | null>(null)
  const [snapping, setSnapping] = useState(false)
  const foldRef = useRef<HTMLDivElement>(null)
  const [foldH, setFoldH] = useState(0)
  const grab = useRef<{ y: number; h: number; moved: boolean } | null>(null)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [pop, setPop] = useState(false)
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 10000)
    return () => clearInterval(t)
  }, [])

  /* wysokość zwijanej części mierzona, nie zgadywana: treść zmienia się w trasie */
  useLayoutEffect(() => {
    const el = foldRef.current
    if (el) setFoldH(el.scrollHeight)
  })

  const fold = drag ?? (collapsed ? 1 : 0)

  const onDown = (e: React.PointerEvent) => {
    const el = foldRef.current
    grab.current = { y: e.clientY, h: el?.scrollHeight || foldH || 1, moved: false }
  }
  const onMove = (e: React.PointerEvent) => {
    const g = grab.current
    if (!g) return
    const dy = e.clientY - g.y
    if (!g.moved && Math.abs(dy) < TAP_SLOP) return
    g.moved = true
    const p = collapsed ? 1 - Math.max(0, -dy) / g.h : Math.max(0, dy) / g.h
    setDrag(Math.min(1, Math.max(0, p)))
  }
  const onUp = () => {
    const g = grab.current
    grab.current = null
    if (!g?.moved) {
      setDrag(null)
      return
    }
    const target = (drag ?? (collapsed ? 1 : 0)) > 0.5 ? 1 : 0
    setSnapping(true)
    setDrag(target)
    window.setTimeout(() => {
      setCollapsed(target === 1)
      localStorage.setItem(FOLD_KEY, target === 1 ? '1' : '0')
      setDrag(null)
      setSnapping(false)
    }, 220)
  }

  // the stack sinks back one by one, so it has to outlive the click that closed it
  const shut = () => {
    setClosing(true)
    window.setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, 400)
  }

  if (!expedition) return null
  const here = expedition.where?.coords ?? expedition.track[expedition.track.length - 1]

  const quest = questForPark(expedition.parkId)
  const collected = new Set(parks[expedition.parkId]?.points ?? [])
  const total = quest?.pois.length ?? 0
  const done = quest ? quest.pois.filter((p) => collected.has(p.id)).length : 0
  const park = (parksData as { features: Array<{ id: string; geometry: unknown }> }).features.find(
    (f) => f.id === expedition.parkId,
  )
  const toPark =
    here && park ? distanceToParkM(here, park.geometry as never) : null
  /*
   * Cel wybrany ręcznie wygrywa z najbliższym: to Ty decydujesz, gdzie idziesz.
   * Zdobycie celu zwalnia miejsce i karta wraca do najbliższego sama.
   */
  const picked =
    targetId && quest && here && !collected.has(targetId)
      ? quest.pois.find((p) => p.id === targetId)
      : undefined
  const next =
    quest && here
      ? picked
        ? { p: picked, d: distanceM(here, picked.coords) }
        : quest.pois
            .filter((p) => !collected.has(p.id))
            .map((p) => ({ p, d: distanceM(here, p.coords) }))
            .sort((a, b) => a.d - b.d)[0]
      : null

  /*
   * Blisko konkretnie, daleko ogólnie: dopóki jesteś kilometry od parku, nazwa
   * konkretnego punktu nic nie znaczy, więc pasek mówi o dojściu do parku.
   */
  const far = toPark != null && toPark > NEAR_M
  const label = !here
    ? 'szukam sygnału'
    : far
      ? 'do parku'
      : next
        ? picked
          ? 'twój cel'
          : 'następny punkt'
        : total > 0
          ? 'komplet punktów'
          : 'nagrywam spacer'
  const name = !here
    ? 'poczekaj chwilę'
    : far
      ? (park ? expedition.name : 'w drodze')
      : next
        ? next.p.name
        : total > 0
          ? 'kończysz kiedy chcesz'
          : 'idź, gdzie chcesz'
  const away = !here ? null : far ? toPark : (next?.d ?? null)
  /* strzałka pokazuje azymut do celu pomniejszony o to, w którą stronę trzymasz
     telefon; bez kompasu (heading == null) nie ma strzałki */
  const arrow =
    heading != null && here && next && !far ? (bearing(here, next.p.coords) - heading + 360) % 360 : null

  return (
    <>
      {/* a tap anywhere else closes the menu instead of poking the map */}
      {open && !closing && (
        <button className="app-addmenu__catch" aria-label="Zamknij menu" onClick={shut} />
      )}

      {open && (
        <div className={`app-addmenu${closing ? ' -out' : ''}`}>
          {/* progressive blur trzema pasmami, jak we wspomnieniach: mapa nie
              znika, tylko cofa się o krok */}
          <div className="app-addmenu__glass" aria-hidden="true">
            <span style={{ '--b': '3px', '--from': '0%', '--to': '46%' } as CSSProperties} />
            <span style={{ '--b': '9px', '--from': '22%', '--to': '72%' } as CSSProperties} />
            <span style={{ '--b': '18px', '--from': '48%', '--to': '100%' } as CSSProperties} />
          </div>
          <div className="app-addmenu__stack">
            <Button
              className="app-addmenu__item"
              style={{ '--rise': 2, '--sink': 0 } as CSSProperties}
              icon={<Mic size={20} />}
              onClick={() => {
                shut()
                setRecording(true)
              }}
            >
              Nagraj wspomnienie
            </Button>
            {/*
              Auto nie jest wspomnieniem, ale mieszka w tym samym menu, bo to
              też „rzecz zostawiona sobie na później". Jedno auto na wyprawę:
              nowy wpis zastępuje stary, żeby nie zbierać pięciu miejsc parkowania.
            */}
            {here && (
              <Button
                className="app-addmenu__item"
                style={{ '--rise': 3, '--sink': 3 } as CSSProperties}
                icon={<CarFront size={20} />}
                onClick={async () => {
                  shut()
                  const old = (await listMarks()).find(
                    (m) => m.kind === 'car' && m.journeyId === expedition.id,
                  )
                  if (old) await deleteMark(old.id)
                  await addMark({
                    kind: 'car',
                    parkId: expedition.parkId,
                    journeyId: expedition.id,
                    coords: here,
                    caption: '',
                  })
                }}
              >
                Tu stoi auto
              </Button>
            )}
            <Button
              className="app-addmenu__item"
              style={{ '--rise': 1, '--sink': 1 } as CSSProperties}
              icon={<StickyNote size={20} />}
              onClick={async () => {
                shut()
                const saved = await addMark({
                  kind: 'note',
                  parkId: expedition.parkId,
                  journeyId: expedition.id,
                  coords: here,
                  caption: '',
                })
                onMark?.(saved.id)
              }}
            >
              Zapisz wspomnienie
            </Button>
            <PhotoButton
              parkId={expedition.parkId}
              journeyId={expedition.id}
              coords={here}
              label="Zrób zdjęcie"
              full={false}
              className="app-addmenu__item"
              style={{ '--rise': 0, '--sink': 2 } as CSSProperties}
              onSaved={(id) => {
                shut()
                onPhoto?.(id)
              }}
            />
            <div className="app-addmenu__close">
              <button className="app-addmenu__x" aria-label="Zamknij" onClick={shut}>
                <X size={24} />
              </button>
              <span className="app-expaction__label">Zamknij</span>
            </div>
          </div>
        </div>
      )}

      {recording && (
        <VoiceRecorder
          parkId={expedition.parkId}
          journeyId={expedition.id}
          coords={here}
          onClose={() => setRecording(false)}
          onSaved={onMark}
        />
      )}

      <div className="app-expbar">
        {/* odrobina progressive bluru w tym samym gradiencie: dwa pasma, żeby
            mapa pod HUD-em cofnęła się o pół kroku, a nie zniknęła */}
        <div className="app-expbar__floor" aria-hidden="true">
          <span style={{ '--b': '2px', '--from': '0%', '--to': '58%' } as CSSProperties} />
          <span style={{ '--b': '6px', '--from': '30%', '--to': '100%' } as CSSProperties} />
        </div>
        {spotCard ? (
          <div className="app-expbar__swap">{spotCard}</div>
        ) : (
        <>
        {/*
          Karta jest przyciskiem: dotknięcie otwiera to, o czym mówi. Blisko to
          historia następnego punktu, daleko karta miejsca. Bez tego była jedyną
          rzeczą na ekranie, która wygląda jak kafelek i nic nie robi.
        */}
        <button
          className={`app-nextstop${fold > 0.98 ? ' -folded' : ''}`}
          onClick={() => {
            /* przeciągnięcie nie jest dotknięciem: inaczej zwinięcie otwierałoby listę */
            if (grab.current?.moved) return
            onOpenPoints?.()
          }}
          disabled={!onOpenPoints}
          aria-label={`${label}: ${name}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
        <div
          className={`app-nextstop__fold${snapping ? ' -snap' : ''}`}
          ref={foldRef}
          style={
            drag != null || collapsed
              ? { height: Math.round(foldH * (1 - fold)), opacity: Math.max(0, 1 - fold * 1.6) }
              : undefined
          }
        >
          {total > 0 && (
            <div className="app-nextstop__dashes" aria-label={`Zebrane ${done} z ${total}`}>
              {Array.from({ length: total }, (_, i) => (
                <span key={i} className={i < done ? 'is-on' : undefined} />
              ))}
            </div>
          )}
          <div className="app-nextstop__row">
            <div className="app-nextstop__text">
              <span className="app-nextstop__label">{label}</span>
              <span className="t-body-strong app-nextstop__name">{name}</span>
            </div>
            {away == null && total > 0 && (
              <span className="app-nextstop__away">
                {done}
                <span className="app-nextstop__unit">z {total}</span>
              </span>
            )}
            {away != null && (
              <span className="app-nextstop__away">
                {/* strzałka tylko z prawdziwym kompasem: zgadywany kierunek myli w terenie */}
                {arrow != null && (
                  <Navigation
                    size={15}
                    className="app-nextstop__arrow"
                    style={{ transform: `rotate(${arrow}deg)` }}
                    aria-hidden="true"
                  />
                )}
                {formatDistance(away).replace(/\s*(m|km)$/, '')}
                <span className="app-nextstop__unit">{formatDistance(away).endsWith('km') ? 'km' : 'm'}</span>
              </span>
            )}
          </div>

        </div>

          {/*
            Wysiłek i postęp w jednej linii, oddzielone włoskową kreską. Dotąd
            czas z kilometrami stały w osobnej pastylce u góry ekranu, czyli
            wyprawa mówiła z dwóch miejsc. Teraz mówi z jednego. To jest też
            wszystko, co zostaje po zwinięciu karty palcem w dół.
          */}
          <div className="app-nextstop__stats">
            <span>
              <strong>{fmtTime(Date.now() - expedition.startedAt)}</strong> w trasie
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <strong>{(expedition.distanceM / 1000).toFixed(1).replace('.', ',')} km</strong>
            </span>
            {total > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  <strong>
                    {done} z {total}
                  </strong>{' '}
                  {done === 1 ? 'punkt' : 'punktów'}
                </span>
              </>
            )}
          </div>
        </button>
        </>
        )}

        <div className="app-expactions">
          <div className="app-expaction">
            <button className="app-expaction__btn" aria-label="Zakończ wyprawę" onClick={onRequestStop}>
              <Square size={18} />
            </button>
            <span className="app-expaction__label">Koniec</span>
          </div>
          <div className="app-expaction">
            <button
              className={`app-expaction__btn -primary${open ? ' -open' : ''}${pop ? ' -pop' : ''}`}
              aria-label={open ? 'Zamknij' : 'Dodaj zdjęcie, nagranie albo notatkę'}
              aria-expanded={open}
              onClick={() => {
                // sprężynka trwa tyle, ile animacja: potem klasa schodzi, żeby
                // dała się odpalić ponownie
                setPop(true)
                window.setTimeout(() => setPop(false), 380)
                if (open) shut()
                else setOpen(true)
              }}
            >
              {open ? <X size={24} /> : <Plus size={26} />}
            </button>
            <span className="app-expaction__label">Wspomnienie</span>
          </div>
          <div className="app-expaction">
            <button
              className="app-expaction__btn"
              aria-label="Punkty tego miejsca"
              onClick={onOpenPoints}
              disabled={!onOpenPoints}
            >
              <ListIcon size={18} />
            </button>
            <span className="app-expaction__label">Punkty</span>
          </div>
        </div>
      </div>
    </>
  )
}
