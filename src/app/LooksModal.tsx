import { useState } from 'react'
import { Check } from 'lucide-react'
import { Modal, cx } from '../ds'
import { getTheme, setTheme } from './theme'
import type { Theme } from './theme'
import { MAP_STYLES } from './data/mapstyles'
import type { MapStyleId } from './data/mapstyles'

/**
 * Wygląd: motyw aplikacji i styl mapy na jednym ekranie.
 *
 * Dwie zmiany względem tego, co było (decyzje Jarka 2026-08-22). Po pierwsze
 * jeden ekran zamiast dwóch: „jasny czy ciemny" i „satelita czy minimal" to to
 * samo pytanie, jak ma wyglądać, i dotąd stały w dwóch miejscach naraz, w menu i
 * w profilu. Po drugie **wybór przez podgląd, nie przez nazwę**: przy trzech
 * stylach mapy nazwy nie mówią nic, dopóki się ich nie spróbuje.
 *
 * Podglądy są rysowane, nie fotografowane. Prawdziwy kadr wymagałby albo trzech
 * instancji mapy GL naraz (drogo), albo zdjęć w repozytorium (martwe przy każdej
 * zmianie palety). Rysunek bierze kolory z tej samej definicji stylu, więc
 * zawsze zgadza się z tym, co potem zobaczysz.
 */

const THEMES: Array<{ value: Theme; label: string; note: string }> = [
  { value: 'light', label: 'Jasny', note: 'Dzień, mocne słońce' },
  { value: 'dark', label: 'Ciemny', note: 'Wieczór, mniej światła' },
  { value: 'auto', label: 'Auto', note: 'Za ustawieniem telefonu' },
]

/** miniatura interfejsu w danym motywie: pasek, karta i mapa pod nią */
function ThemeArt({ kind }: { kind: Theme }) {
  const dark = { bg: '#111a12', card: '#1d2a1f', ink: '#e8f0e4', line: '#2c3d2e' }
  const light = { bg: '#e9ece4', card: '#ffffff', ink: '#1b2a1c', line: '#cfd6c8' }
  const c = kind === 'dark' ? dark : light
  const half = kind === 'auto'
  return (
    <svg viewBox="0 0 96 64" className="looks__art" aria-hidden="true">
      <defs>
        <clipPath id={`half-${kind}`}>
          <polygon points="48,0 96,0 96,64 24,64" />
        </clipPath>
      </defs>
      <rect x="0" y="0" width="96" height="64" rx="8" fill={c.bg} />
      <path d="M0 40 Q24 30 48 42 T96 34" stroke={c.line} strokeWidth="3" fill="none" />
      <rect x="10" y="8" width="34" height="6" rx="3" fill={c.line} />
      <rect x="8" y="44" width="80" height="14" rx="6" fill={c.card} />
      <rect x="14" y="49" width="30" height="4" rx="2" fill={c.ink} opacity="0.75" />
      {half && (
        <g clipPath={`url(#half-${kind})`}>
          <rect x="0" y="0" width="96" height="64" rx="8" fill={dark.bg} />
          <path d="M0 40 Q24 30 48 42 T96 34" stroke={dark.line} strokeWidth="3" fill="none" />
          <rect x="10" y="8" width="34" height="6" rx="3" fill={dark.line} />
          <rect x="8" y="44" width="80" height="14" rx="6" fill={dark.card} />
          <rect x="14" y="49" width="30" height="4" rx="2" fill={dark.ink} opacity="0.75" />
        </g>
      )}
    </svg>
  )
}

/** miniatura mapy: rzeka, droga i park w kolorach danego stylu */
function MapArt({ from, to }: { from: string; to: string }) {
  return (
    <svg viewBox="0 0 96 64" className="looks__art" aria-hidden="true">
      <defs>
        <linearGradient id={`g-${from.replace('#', '')}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0.35" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="96" height="64" rx="8" fill={`url(#g-${from.replace('#', '')})`} />
      {/* woda, droga i obrys parku: trzy rzeczy, które na mapie widać najpierw */}
      <path d="M-2 46 Q22 36 44 48 T98 40" stroke="#5d87b1" strokeWidth="5" fill="none" opacity="0.85" />
      <path d="M12 66 L30 22 L58 6" stroke="#ffffff" strokeWidth="2.4" fill="none" opacity="0.7" />
      <path
        d="M56 20 L82 16 L88 34 L70 44 L54 36 Z"
        fill="#c3ec47"
        fillOpacity="0.32"
        stroke="#ffffff"
        strokeWidth="1.6"
      />
    </svg>
  )
}

export function LooksModal({
  open,
  onClose,
  mapStyle,
  onMapStyle,
}: {
  open: boolean
  onClose: () => void
  mapStyle: MapStyleId
  onMapStyle: (id: MapStyleId) => void
}) {
  const [theme, setThemeState] = useState<Theme>(getTheme)
  const pickTheme = (t: Theme) => {
    setThemeState(t)
    setTheme(t)
  }

  return (
    <Modal open={open} onClose={onClose} title="Wygląd" action="back" presentation="push">
      <h3 className="t-title looks__title">Motyw aplikacji</h3>
      <p className="t-body-sm settings-lead">
        Zmiana działa od razu, także w katalogu komponentów.
      </p>
      <div className="looks__grid" role="radiogroup" aria-label="Motyw">
        {THEMES.map((t) => (
          <button
            key={t.value}
            type="button"
            role="radio"
            aria-checked={theme === t.value}
            className={cx('looks__tile', theme === t.value && '-active')}
            onClick={() => pickTheme(t.value)}
          >
            <ThemeArt kind={t.value} />
            <span className="looks__label">{t.label}</span>
            <span className="t-caption looks__note">{t.note}</span>
            {theme === t.value && (
              <span className="looks__check" aria-hidden="true">
                <Check size={13} />
              </span>
            )}
          </button>
        ))}
      </div>

      <h3 className="t-title looks__title">Styl mapy</h3>
      <p className="t-body-sm settings-lead">
        Ortofoto to polskie zdjęcia lotnicze i są najostrzejsze. Satelita działa wszędzie, więc
        zostaje na zapas. Minimal czyta się najlepiej w słońcu, a rzeźba terenu pokazuje, gdzie jest
        stromo.
      </p>
      <div className="looks__grid" role="radiogroup" aria-label="Styl mapy">
        {MAP_STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={s.id === mapStyle}
            className={cx('looks__tile', s.id === mapStyle && '-active')}
            onClick={() => onMapStyle(s.id)}
          >
            <MapArt from={s.swatch[0]} to={s.swatch[1]} />
            <span className="looks__label">{s.label}</span>
            {s.id === mapStyle && (
              <span className="looks__check" aria-hidden="true">
                <Check size={13} />
              </span>
            )}
          </button>
        ))}
      </div>
    </Modal>
  )
}
