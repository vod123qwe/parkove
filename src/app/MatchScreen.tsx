import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowDown,
  Baby,
  BookOpen,
  Check,
  Clock,
  Flower2,
  Gem,
  Leaf,
  MapPin,
  MountainSnow,
  RotateCcw,
  Sparkles,
  TramFront,
  TreePine,
  Waves,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Button, NavBar } from '../ds'
import { PHASE_LABEL, QUESTIONS, match } from './data/match'
import type { Answer, Feature, Match } from './data/match'
import { PARK_INFO } from './data/parkinfo'
import { fmtKm, fmtVisitMin } from './data/visit'
import { kindIcon } from './kinds'
import { asset } from './assets'
import { startMatchBg } from './matchbg'
import type { MatchBg } from './matchbg'
import { useGameState } from './state'

/**
 * Dokąd dziś: dwanaście kart do przesunięcia, na końcu najwyżej trzy miejsca.
 *
 * Trzy gesty, nie dwa (Jarek 2026-09-05): w prawo „tak", w lewo „nie",
 * w dół „wszystko jedno". Dół jest osobnym gestem, a nie przyciskiem, bo
 * przy dwunastu kartach przełączanie się między kciukiem na karcie i palcem
 * na przycisku psuje rytm. Przyciski zostają jako druga droga, dla
 * dostępności i dla tych, którzy wolą klikać.
 *
 * Karta to zdjęcie prawdziwego miejsca z apki, nie ikona. Ikona zostaje jako
 * mały znaczek, żeby karty w tej samej fazie dało się rozróżnić kątem oka.
 *
 * Logika dopasowania siedzi w data/match.ts, a tło w matchbg.ts. Tutaj jest
 * tylko ekran.
 */

const ICONS: Record<string, ReactNode> = {
  pin: <MapPin />,
  clock: <Clock />,
  child: <Baby />,
  tram: <TramFront />,
  sparkles: <Sparkles />,
  mountain: <MountainSnow />,
  tree: <TreePine />,
  waves: <Waves />,
  rock: <Gem />,
  book: <BookOpen />,
  flower: <Flower2 />,
  leaf: <Leaf />,
}

/** po tylu pikselach puszczenie karty liczy się jako odpowiedź */
const THRESHOLD_X = 92
const THRESHOLD_Y = 110

type Leaving = 'yes' | 'no' | 'skip' | null

export function MatchScreen({
  onClose,
  onPick,
}: {
  onClose: () => void
  onPick: (parkId: string) => void
}) {
  const { parks } = useGameState()
  const visited = useMemo(() => new Set(Object.keys(parks)), [parks])

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Record<Feature, Answer>>>({})
  const [results, setResults] = useState<Match[] | null>(null)

  /* przeciąganie w dwu osiach; `leaving` to kierunek odlatującej karty */
  const [drag, setDrag] = useState({ x: 0, y: 0 })
  const [leaving, setLeaving] = useState<Leaving>(null)
  const dragging = useRef(false)
  const start = useRef({ x: 0, y: 0 })
  /*
   * Ta sama pozycja co w stanie, ale w refie: pointerup potrafi przyjść w tej
   * samej klatce co ostatni pointermove, zanim React zdąży przerenderować,
   * i wtedy stan w domknięciu jest jeszcze stary. Szybki ruch kciukiem
   * w dół kończył się „nic się nie stało". Ref jest zawsze aktualny.
   */
  const pos = useRef({ x: 0, y: 0 })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bg = useRef<MatchBg | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    bg.current = startMatchBg(canvasRef.current)
    return () => {
      bg.current?.stop()
      bg.current = null
    }
  }, [])

  useEffect(() => {
    bg.current?.setTilt(Math.max(-1, Math.min(1, drag.x / 150)))
  }, [drag.x])

  /*
   * Zdjęcia następnych kart ładujemy z wyprzedzeniem: karta wjeżdża spod
   * spodu i ma być gotowa, a nie doładowywać się na oczach.
   */
  useEffect(() => {
    for (const q of QUESTIONS.slice(step + 1, step + 3)) {
      const img = new Image()
      img.src = asset(q.photo)
    }
  }, [step])

  const question = QUESTIONS[step]
  const nextQuestion = QUESTIONS[step + 1]
  const done = step >= QUESTIONS.length
  /* pierwsza karta nowej fazy dostaje nagłówek, żeby zmiana tonu była widoczna */
  const phaseStarts = !done && (step === 0 || QUESTIONS[step - 1].phase !== question.phase)

  const answer = useCallback(
    (value: Answer) => {
      const q = QUESTIONS[step]
      if (!q) return
      const next = { ...answers, [q.id]: value }
      setAnswers(next)
      setLeaving(value)
      /* karta odlatuje, dopiero potem podmieniamy treść: inaczej tekst mruga */
      window.setTimeout(() => {
        setLeaving(null)
        setDrag({ x: 0, y: 0 })
        if (step + 1 >= QUESTIONS.length) setResults(match(next, visited, 3))
        setStep(step + 1)
      }, 240)
    },
    [answers, step, visited],
  )

  /* klawiatura: strzałki działają tak samo jak gest, bo to ten sam wybór */
  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') answer('yes')
      if (e.key === 'ArrowLeft') answer('no')
      if (e.key === 'ArrowDown') answer('skip')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answer, done])

  /*
   * Ruch i puszczenie słuchamy na OKNIE, nie na karcie. Przechwycenie
   * wskaźnika przez kartę (setPointerCapture) gubiło pointerup przy szybkim
   * ruchu w dół i karta zostawała w połowie drogi. Okno dostaje wszystko,
   * niezależnie od tego, gdzie palec skończy.
   */
  const onDown = (e: React.PointerEvent) => {
    if (leaving) return
    dragging.current = true
    start.current = { x: e.clientX, y: e.clientY }
    pos.current = { x: 0, y: 0 }
    const move = (ev: PointerEvent) => {
      if (!dragging.current) return
      /* w górę karta nie idzie: to nie jest odpowiedź, więc trzymamy ją przy zerze */
      const next = { x: ev.clientX - start.current.x, y: Math.max(-24, ev.clientY - start.current.y) }
      pos.current = next
      setDrag(next)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      if (!dragging.current) return
      dragging.current = false
      const { x, y } = pos.current
      pos.current = { x: 0, y: 0 }
      /* dominująca oś decyduje: przekątna w prawo i w dół to nadal „tak" */
      if (y > THRESHOLD_Y && y > Math.abs(x)) answer('skip')
      else if (x > THRESHOLD_X) answer('yes')
      else if (x < -THRESHOLD_X) answer('no')
      else setDrag({ x: 0, y: 0 })
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const restart = () => {
    setAnswers({})
    setResults(null)
    setStep(0)
    setDrag({ x: 0, y: 0 })
    bg.current?.setTilt(0)
  }

  /* pozycja karty: w trakcie przeciągania za palcem, przy odlocie poza ekran */
  const fly = leaving === 'yes' ? { x: window.innerWidth * 1.2, y: drag.y }
    : leaving === 'no' ? { x: -window.innerWidth * 1.2, y: drag.y }
    : leaving === 'skip' ? { x: drag.x, y: window.innerHeight }
    : drag
  const rotate = fly.x / 26
  const verdict: Leaving = leaving
    ?? (drag.y > 60 && drag.y > Math.abs(drag.x) ? 'skip' : drag.x > 40 ? 'yes' : drag.x < -40 ? 'no' : null)

  return createPortal(
    <div className="mtch">
      <canvas ref={canvasRef} className="mtch__bg" aria-hidden="true" />
      <NavBar className="mtch__nav" title="Dokąd dziś?" variant="back" transparent onAction={onClose} />

      {!done ? (
        <div className="mtch__stage">
          <div className="mtch__head">
            <p className={`t-label mtch__phase${phaseStarts ? ' -fresh' : ''}`}>{PHASE_LABEL[question.phase]}</p>
            <p className="t-caption mtch__count">
              {step + 1} z {QUESTIONS.length}
            </p>
          </div>
          <div className="mtch__progress" aria-hidden="true">
            <span style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
          </div>

          <div className="mtch__deck">
            {/* następna karta czeka pod spodem: widać, że to talia */}
            {nextQuestion && (
              <div className="mtch-card -under" aria-hidden="true">
                <img className="mtch-card__photo" src={asset(nextQuestion.photo)} alt="" />
              </div>
            )}
            <div
              className={`mtch-card${leaving ? ' -leaving' : ''}`}
              style={{ transform: `translate(${fly.x}px, ${fly.y}px) rotate(${rotate}deg)` }}
              onPointerDown={onDown}
            >
              <img className="mtch-card__photo" src={asset(question.photo)} alt="" draggable={false} />
              <span className="mtch-card__shade" aria-hidden="true" />

              <span className={`mtch-card__verdict -yes${verdict === 'yes' ? ' -on' : ''}`}>tak</span>
              <span className={`mtch-card__verdict -no${verdict === 'no' ? ' -on' : ''}`}>nie</span>
              <span className={`mtch-card__verdict -skip${verdict === 'skip' ? ' -on' : ''}`}>wszystko jedno</span>

              <span className="mtch-card__icon">{ICONS[question.icon] ?? <Sparkles />}</span>
              <div className="mtch-card__body">
                <h2 className="t-headline mtch-card__text">{question.text}</h2>
                <p className="t-body-sm mtch-card__hint">{question.hint}</p>
              </div>
            </div>
          </div>

          <div className="mtch__actions">
            <button className="mtch__vote -no" onClick={() => answer('no')} aria-label="Nie dziś">
              <X size={26} />
            </button>
            <button className="mtch__vote -skip" onClick={() => answer('skip')} aria-label="Wszystko jedno">
              <ArrowDown size={20} />
            </button>
            <button className="mtch__vote -yes" onClick={() => answer('yes')} aria-label="Tak, chcę">
              <Check size={26} />
            </button>
          </div>
          <p className="t-caption mtch__tip">W prawo tak, w lewo nie, w dół wszystko jedno.</p>
        </div>
      ) : (
        <div className="mtch__results">
          <h2 className="t-headline mtch__resultsTitle">
            {results?.length ? 'Na dzisiaj pasuje to' : 'Nic nie pasuje'}
          </h2>
          <p className="t-body-sm mtch__resultsLead">
            {results?.length
              ? 'Trzy propozycje, od najlepiej dopasowanej. Wybierz jedną, a otworzę ją na mapie.'
              : 'Spróbuj odpowiedzieć inaczej, może za dużo rzeczy naraz.'}
          </p>

          <ol className="mtch__list">
            {results?.map((m, i) => {
              const photo = PARK_INFO[m.place.id]?.photos?.[0]?.src
              return (
                <li key={m.place.id}>
                  <button className="mtch-hit" onClick={() => onPick(m.place.id)}>
                    <span className="mtch-hit__rank">{i + 1}</span>
                    <span className="mtch-hit__photo">
                      {photo ? (
                        <img src={asset(photo)} alt="" loading="lazy" />
                      ) : (
                        <span className="mtch-hit__ph">{kindIcon(m.place.kind)}</span>
                      )}
                    </span>
                    <span className="mtch-hit__text">
                      <span className="t-body-strong mtch-hit__name">{m.place.name}</span>
                      <span className="t-caption mtch-hit__meta">
                        {fmtVisitMin(m.place.minutes)} · {fmtKm(m.place.km)} od Rynku
                      </span>
                      {m.reasons.length > 0 && (
                        <span className="mtch-hit__why">
                          {m.reasons.map((r) => (
                            <span key={r} className="mtch-hit__tag">
                              {r}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="mtch__again">
            <Button full variant="ghost" onClick={restart}>
              <RotateCcw size={16} /> Jeszcze raz
            </Button>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
