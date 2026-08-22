import { useRef, useState } from 'react'
import { CornerDownLeft, LocateFixed, Sparkle } from 'lucide-react'
import { BottomSheet } from '../ds'
import { askAbout, askedToday } from './ask'
import { buildGuideContext } from './guideContext'
import type { GuideInput } from './guideContext'

/**
 * Przewodnik: jedna rozmowa w całej aplikacji, wiele wejść do niej.
 *
 * Decyzja Jarka (2026-08-22): to ma być przewodnik, nie widget w karcie. Widget
 * odpowiada na pytanie o akapit, który właśnie przeczytałeś. Przewodnik idzie z
 * Tobą i wie, gdzie stoisz, co zebrałeś i czy zdążysz przed deszczem. Dlatego
 * kontekst zbiera guideContext.ts, a nie sama karta.
 *
 * Wątek trzyma App, nie ten komponent: arkusz przy zamknięciu jest odmontowywany,
 * a rozmowa ma przeżyć zamknięcie, bo w terenie zamyka się wszystko odruchowo.
 */

/** 1 pytanie, 2 pytania, 5 pytań: bez tego licznik pisze „1 pytań" */
const plQ = (n: number) => (n === 1 ? 'pytanie' : n % 10 >= 2 && n % 10 <= 4 && n % 100 < 12 ? 'pytania' : 'pytań')

/** pytania na start: puste pole to najgorsze, co można dać komuś w terenie */
const STARTERS = [
  'Co tu jest najciekawsze?',
  'Zdążę przed deszczem?',
  'Co zostało do pieczątki?',
  'Co tu zainteresuje dziecko?',
]

export type GuideTurn = { q: string; a: string }

export function GuideSheet({
  open,
  onClose,
  input,
  thread,
  onThread,
  onLocate,
}: {
  open: boolean
  onClose: () => void
  input: GuideInput
  thread: GuideTurn[]
  onThread: (next: GuideTurn[]) => void
  /** dopytanie telefonu o pozycję, gdy jej jeszcze nie mamy */
  onLocate?: () => void
}) {
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const send = async (text?: string) => {
    const question = (text ?? q).trim()
    if (!question || busy) return
    setBusy(true)
    setErr(null)
    setQ('')
    const ctx = buildGuideContext(input)
    const res = await askAbout(question, ctx)
    setBusy(false)
    if (res.error) {
      setErr(res.error)
      return
    }
    onThread([...thread, { q: question, a: res.text ?? '' }])
    window.setTimeout(() => endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }), 60)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Przewodnik">
      {/*
        Nazwa po dwukropku, nie w zdaniu: polskiej odmiany nazw własnych nie da
        się zrobić szablonem („w Dolina Będkowska"), a lista miejsc ma i doliny, i
        kopce, i parki.
      */}
      <p className="t-body-sm guide__lead">
        {input.parkName ? (
          <>
            Rozmawiamy o miejscu: <strong>{input.parkName}</strong>. Wiem, gdzie stoisz, co już
            zebrałeś i jaka jest pogoda. Pytaj swoimi słowami.
          </>
        ) : (
          'Pytaj o miejsca, trasy i pogodę. Gdy wybierzesz miejsce, będę wiedział też, gdzie stoisz.'
        )}
      </p>

      {/*
        Bez pozycji przewodnik jest tylko wyszukiwarką, więc mówimy o tym wprost i
        dajemy jeden przycisk, zamiast czekać, aż ktoś domyśli się sam.
      */}
      {!input.here && onLocate && (
        <button className="guide__locate" onClick={onLocate}>
          <LocateFixed size={16} />
          <span>
            <strong>Nie wiem, gdzie jesteś.</strong> Udostępnij lokalizację, a powiem, co masz
            dookoła i jak daleko.
          </span>
        </button>
      )}

      {thread.length === 0 && (
        <div className="guide__starters">
          {STARTERS.map((s) => (
            <button key={s} className="guide__starter" onClick={() => void send(s)} disabled={busy}>
              {s}
            </button>
          ))}
        </div>
      )}

      {thread.map((row, i) => (
        <div key={i} className="guide__turn">
          <p className="t-body-strong guide__q">{row.q}</p>
          <p className="t-body guide__a">{row.a}</p>
        </div>
      ))}
      {busy && (
        <p className="t-body-sm guide__thinking" role="status">
          Myślę…
        </p>
      )}
      <div ref={endRef} />

      <div className="guide__field">
        <input
          className="guide__input"
          value={q}
          placeholder={thread.length ? 'I jeszcze…' : 'O co chcesz zapytać?'}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void send()
          }}
          disabled={busy}
        />
        <button
          className="guide__send"
          onClick={() => void send()}
          disabled={busy || !q.trim()}
          aria-label="Wyślij pytanie"
        >
          <CornerDownLeft size={18} />
        </button>
      </div>

      {err && (
        <p className="t-caption guide__note -bad" role="status">
          {err}
        </p>
      )}
      <p className="t-caption guide__note">
        <Sparkle size={12} /> Odpowiada model językowy i może się mylić. Treść punktów w aplikacji
        jest sprawdzona, ta rozmowa nie.
        {askedToday() > 0 ? ` Dziś: ${askedToday()} ${plQ(askedToday())}.` : ''}
      </p>
    </BottomSheet>
  )
}
