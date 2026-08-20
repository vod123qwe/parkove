import { MessageCircleQuestion } from 'lucide-react'
import { cx } from '../ds'
import { answerDilemma, answerKey, useGameState } from './state'
import type { PoiDilemma } from './data/quests'

/**
 * The question a place asks. Shown under the reveal: pick a side, then the
 * app argues the other one. There is no correct answer on purpose.
 */
export function Dilemma({
  parkId,
  poiId,
  dilemma,
}: {
  parkId: string
  poiId: string
  dilemma: PoiDilemma
}) {
  const { answers } = useGameState()
  const chosen = answers[answerKey(parkId, poiId)]
  const answered = chosen !== undefined

  return (
    <section className="dilemma">
      <p className="t-label dilemma__kicker">
        <MessageCircleQuestion size={14} /> Pytanie tego miejsca
      </p>
      <p className="t-body dilemma__question">{dilemma.question}</p>
      <div className="dilemma__options">
        {dilemma.options.map((opt, i) => (
          <button
            key={opt}
            className={cx('dilemma__opt', answered && i === chosen && '-chosen', answered && i !== chosen && '-muted')}
            onClick={() => answerDilemma(parkId, poiId, i)}
          >
            {opt}
          </button>
        ))}
      </div>
      {answered && (
        <div className="dilemma__counter">
          <p className="t-label dilemma__counter-label">A z drugiej strony</p>
          <p className="t-body-sm dilemma__counter-text">{dilemma.counterpoint}</p>
        </div>
      )}
    </section>
  )
}
