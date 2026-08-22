import { useState } from 'react'
import { CornerDownLeft, Sparkle } from 'lucide-react'
import { askAbout, askEnabled, askedToday } from './ask'

/**
 * Pytanie o punkt, gdy aplikacja nie ma odpowiedzi.
 *
 * Najważniejsza decyzja jest wizualna, nie techniczna: odpowiedź modelu **nie
 * może wyglądać jak treść, którą sprawdziliśmy**. Ma własne pudełko, własną
 * etykietę „odpowiada model" i inny kolor, tak samo jak legendy mają własny
 * krój. Aplikacja stoi na zasadzie, że nigdy nie udaje wiedzy, więc miejsce, w
 * którym wiedza jest niepewna, musi być widoczne z odległości metra.
 *
 * Pokazuje się tylko wtedy, gdy pośrednik jest wpisany (src/app/proxy.ts).
 */
export function AskBox({
  place,
  point,
  story,
}: {
  place: string
  point: string
  /** to, co aplikacja już o punkcie mówi: model ma się tego trzymać */
  story: string
}) {
  const [q, setQ] = useState('')
  const [thread, setThread] = useState<Array<{ q: string; a: string }>>([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!askEnabled()) return null

  const send = async () => {
    const question = q.trim()
    if (!question || busy) return
    setBusy(true)
    setErr(null)
    const res = await askAbout(question, { place, point, story })
    setBusy(false)
    if (res.error) {
      setErr(res.error)
      return
    }
    setThread((t) => [...t, { q: question, a: res.text ?? '' }])
    setQ('')
  }

  return (
    <section className="poi-ask" aria-label="Zapytaj o to miejsce">
      <p className="t-label poi-ask__label">
        <Sparkle size={14} /> Zapytaj o to miejsce
      </p>

      {thread.map((row, i) => (
        <div key={i} className="poi-ask__row">
          <p className="t-body-sm poi-ask__q">{row.q}</p>
          <p className="t-body-sm poi-ask__a">{row.a}</p>
        </div>
      ))}

      <div className="poi-ask__field">
        <input
          className="poi-ask__input"
          value={q}
          placeholder={thread.length ? 'I jeszcze…' : 'O co chcesz dopytać?'}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void send()
          }}
          disabled={busy}
        />
        <button
          className="poi-ask__send"
          onClick={() => void send()}
          disabled={busy || !q.trim()}
          aria-label="Wyślij pytanie"
        >
          <CornerDownLeft size={16} />
        </button>
      </div>

      {err && (
        <p className="t-caption poi-ask__note -bad" role="status">
          {err}
        </p>
      )}
      <p className="t-caption poi-ask__note">
        Odpowiada model językowy i może się mylić. Reszta tej karty jest
        sprawdzona, ta odpowiedź nie.
        {askedToday() > 0 ? ` Dziś zadałeś ${askedToday()} pytań.` : ''}
      </p>
    </section>
  )
}
