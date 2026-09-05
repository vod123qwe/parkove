import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Baby,
  BookOpen,
  Check,
  Clock,
  Gem,
  MapPin,
  MountainSnow,
  RotateCcw,
  Sparkles,
  TreePine,
  Waves,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { Button, NavBar } from '../ds'
import { QUESTIONS, match } from './data/match'
import type { Answer, Feature, Match } from './data/match'
import { PARK_INFO } from './data/parkinfo'
import { fmtKm, fmtVisitMin } from './data/visit'
import { kindIcon } from './kinds'
import { asset } from './assets'
import { startMatchBg } from './matchbg'
import type { MatchBg } from './matchbg'
import { useGameState } from './state'

/**
 * Dokąd dziś: dziewięć kart do przesunięcia, na końcu najwyżej trzy miejsca.
 *
 * Gest jest tu treścią, a nie ozdobą. Lista z filtrami wymaga, żebyś wiedział,
 * czego szukasz; przesuwanie kart pozwala odpowiadać na to, na co masz ochotę,
 * i dopiero z tych odpowiedzi robi się wybór. Dlatego karta zawsze ma też dwa
 * przyciski: gest jest szybszy, ale nie może być jedyną drogą.
 *
 * Logika dopasowania siedzi w data/match.ts, a tło w matchbg.ts. Tutaj jest
 * tylko ekran.
 */

const ICONS: Record<string, ReactNode> = {
  pin: <MapPin />,
  clock: <Clock />,
  child: <Baby />,
  sparkles: <Sparkles />,
  mountain: <MountainSnow />,
  tree: <TreePine />,
  waves: <Waves />,
  rock: <Gem />,
  book: <BookOpen />,
}

/** po tylu pikselach puszczenie karty liczy się jako odpowiedź */
const THRESHOLD = 92

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

  /* przeciąganie: dx w pikselach, `leaving` to kierunek odlatującej karty */
  const [dx, setDx] = useState(0)
  const [leaving, setLeaving] = useState<-1 | 1 | 0>(0)
  const dragging = useRef(false)
  const startX = useRef(0)

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
    bg.current?.setTilt(Math.max(-1, Math.min(1, dx / 150)))
  }, [dx])

  const question = QUESTIONS[step]
  const done = step >= QUESTIONS.length

  const answer = useCallback(
    (value: Answer) => {
      const q = QUESTIONS[step]
      if (!q) return
      const next = { ...answers, [q.id]: value }
      setAnswers(next)
      setLeaving(value === 'yes' ? 1 : -1)
      /* karta odlatuje, dopiero potem podmieniamy treść: inaczej tekst mruga */
      window.setTimeout(() => {
        setLeaving(0)
        setDx(0)
        if (step + 1 >= QUESTIONS.length) setResults(match(next, visited, 3))
        setStep(step + 1)
      }, 220)
    },
    [answers, step, visited],
  )

  /* klawiatura: strzałki działają tak samo jak gest, bo to ten sam wybór */
  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') answer('yes')
      if (e.key === 'ArrowLeft') answer('no')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [answer, done])

  const onDown = (e: React.PointerEvent) => {
    if (leaving) return
    dragging.current = true
    startX.current = e.clientX
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    setDx(e.clientX - startX.current)
  }
  const onUp = () => {
    if (!dragging.current) return
    dragging.current = false
    if (dx > THRESHOLD) answer('yes')
    else if (dx < -THRESHOLD) answer('no')
    else setDx(0)
  }

  const restart = () => {
    setAnswers({})
    setResults(null)
    setStep(0)
    setDx(0)
    bg.current?.setTilt(0)
  }

  const offset = leaving ? leaving * window.innerWidth * 1.2 : dx
  const tilt = offset / 26
  const yes = dx > 40
  const no = dx < -40

  return createPortal(
    <div className="mtch">
      <canvas ref={canvasRef} className="mtch__bg" aria-hidden="true" />
      <NavBar className="mtch__nav" title="Dokąd dziś?" variant="back" transparent onAction={onClose} />

      {!done ? (
        <div className="mtch__stage">
          <p className="t-caption mtch__count">
            Pytanie {step + 1} z {QUESTIONS.length}
          </p>
          <div className="mtch__progress" aria-hidden="true">
            <span style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
          </div>

          <div className="mtch__deck">
            {/* karta pod spodem: widać, że to talia, a nie jedna plansza */}
            <div className="mtch-card -under" aria-hidden="true" />
            <div
              className={`mtch-card${leaving ? ' -leaving' : ''}`}
              style={{ transform: `translateX(${offset}px) rotate(${tilt}deg)` }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
            >
              <span className={`mtch-card__verdict -yes${yes ? ' -on' : ''}`}>tak</span>
              <span className={`mtch-card__verdict -no${no ? ' -on' : ''}`}>nie</span>
              <span className="mtch-card__icon">{ICONS[question.icon] ?? <Sparkles />}</span>
              <h2 className="t-headline mtch-card__text">{question.text}</h2>
              <p className="t-body-sm mtch-card__hint">{question.hint}</p>
            </div>
          </div>

          <div className="mtch__actions">
            <button className="mtch__vote -no" onClick={() => answer('no')} aria-label="Nie dziś">
              <X size={26} />
            </button>
            <button className="mtch__skip" onClick={() => answer('skip')}>
              Wszystko jedno
            </button>
            <button className="mtch__vote -yes" onClick={() => answer('yes')} aria-label="Tak, chcę">
              <Check size={26} />
            </button>
          </div>
          <p className="t-caption mtch__tip">Przesuń kartę w prawo albo w lewo.</p>
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
