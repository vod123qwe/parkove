import { Sparkle } from 'lucide-react'
import { askEnabled } from './ask'

/**
 * Wejście do przewodnika z karty punktu.
 *
 * Wcześniej było tu całe pole pytania i osobna rozmowa. Jarek zwrócił uwagę, że
 * to złe miejsce: widget na końcu karty odpowiada na pytanie o przeczytany
 * akapit, a on chciał przewodnika, który idzie z nim po terenie. Została więc
 * jedna rzecz: przycisk, który otwiera tę samą rozmowę co przewodnik, z
 * kontekstem tego punktu. Jedna rozmowa w całej aplikacji, wiele wejść do niej.
 */
export function AskBox({ pointName, onAsk }: { pointName: string; onAsk: () => void }) {
  if (!askEnabled()) return null
  return (
    <button className="poi-ask" onClick={onAsk}>
      <span className="poi-ask__icon" aria-hidden="true">
        <Sparkle size={16} />
      </span>
      <span className="poi-ask__text">
        <span className="t-body-strong poi-ask__title">Zapytaj przewodnika</span>
        <span className="t-caption poi-ask__sub">
          O {pointName} albo o cokolwiek wokół. Odpowiada model i może się mylić.
        </span>
      </span>
    </button>
  )
}
