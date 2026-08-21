import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { List as ListIcon, Mic, Plus, Square, StickyNote, X } from 'lucide-react'
import { Button } from '../ds'
import { useGameState } from './state'
import { questForPark } from './data/quests'
import { distanceM, distanceToParkM, formatDistance } from './geo'
import parksData from './data/parks.json'
import { PhotoButton } from './PhotoButton'
import { VoiceRecorder } from './VoiceRecorder'
import { addMark } from './photos'

/** próg, od którego konkretny punkt zaczyna mieć znaczenie */
const NEAR_M = 300

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
}: {
  /** ending is irreversible, so the bar only asks for it */
  onRequestStop: () => void
  /** a picture only gets a notice: writing can wait */
  onPhoto?: (markId: string) => void
  /** a note or a recording opens right away, because it needs words */
  onMark?: (markId: string) => void
  /** karta miejsca z listą punktów */
  onOpenPoints?: () => void
}) {
  const { expedition, parks } = useGameState()
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 10000)
    return () => clearInterval(t)
  }, [])

  // the stack sinks back one by one, so it has to outlive the click that closed it
  const shut = () => {
    setClosing(true)
    window.setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, 280)
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
  const next =
    quest && here
      ? quest.pois
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
        ? 'następny punkt'
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
        {/* co dalej: postęp kreskami, potem nazwa i odległość, bez strzałki */}
        <div className="app-nextstop">
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
            {away != null && <span className="app-nextstop__away">{formatDistance(away)}</span>}
          </div>
        </div>

        <div className="app-expactions">
          <div className="app-expaction">
            <button className="app-expaction__btn" aria-label="Zakończ wyprawę" onClick={onRequestStop}>
              <Square size={18} />
            </button>
            <span className="app-expaction__label">Koniec</span>
          </div>
          <div className="app-expaction">
            <button
              className={`app-expaction__btn -primary${open ? ' -open' : ''}`}
              aria-label={open ? 'Zamknij' : 'Dodaj zdjęcie, nagranie albo notatkę'}
              aria-expanded={open}
              onClick={() => (open ? shut() : setOpen(true))}
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
