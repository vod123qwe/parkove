import { useState } from 'react'
import { Layers, Map as MapIcon, Moon, Mountain, Satellite, SunMedium, SunMoon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Modal, cx } from '../ds'
import { getTheme, setTheme } from './theme'
import type { Theme } from './theme'
import { MAP_STYLES } from './data/mapstyles'
import type { MapStyleId } from './data/mapstyles'

/**
 * Wygląd: motyw aplikacji i styl mapy na jednym ekranie.
 *
 * Prostszy widok (Jarek 2026-08-25: „radio buttony z ikonkami po lewej
 * zamiast takich boxów"). Kafle z rysowanymi podglądami wyleciały: wybór
 * to teraz zwykłe wiersze radiowe, ikona po lewej mówi rodzaj, kółko po
 * prawej mówi stan, a zmiana i tak działa od razu, więc najlepszym
 * podglądem jest sam ekran.
 */

const THEMES: Array<{ value: Theme; label: string; note: string; icon: ReactNode }> = [
  { value: 'light', label: 'Jasny', note: 'Dzień, mocne słońce', icon: <SunMedium size={18} /> },
  { value: 'dark', label: 'Ciemny', note: 'Wieczór, mniej światła', icon: <Moon size={18} /> },
  { value: 'auto', label: 'Auto', note: 'Za ustawieniem telefonu', icon: <SunMoon size={18} /> },
]

const MAP_ICON: Record<MapStyleId, ReactNode> = {
  satellite: <Satellite size={18} />,
  minimal: <MapIcon size={18} />,
  'satellite-3d': <Mountain size={18} />,
}

const MAP_NOTE: Record<MapStyleId, string> = {
  satellite: 'Zdjęcie z góry, najwięcej szczegółów',
  minimal: 'Rysunkowa, czyta się w słońcu',
  'satellite-3d': 'Zdjęcie na rzeźbie terenu, pokazuje strome',
}

function RadioRow({
  icon,
  label,
  note,
  checked,
  onPick,
}: {
  icon: ReactNode
  label: string
  note: string
  checked: boolean
  onPick: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className={cx('looks-row pk-press', checked && '-on')}
      onClick={onPick}
    >
      <span className="looks-row__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="looks-row__text">
        <span className="looks-row__label">{label}</span>
        <span className="t-caption looks-row__note">{note}</span>
      </span>
      <span className="looks-row__radio" aria-hidden="true" />
    </button>
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
      <p className="t-body-sm settings-lead">Zmiana działa od razu, więc podgląd masz przed sobą.</p>
      <div className="looks-rows" role="radiogroup" aria-label="Motyw">
        {THEMES.map((t) => (
          <RadioRow
            key={t.value}
            icon={t.icon}
            label={t.label}
            note={t.note}
            checked={theme === t.value}
            onPick={() => pickTheme(t.value)}
          />
        ))}
      </div>

      <h3 className="t-title looks__title">
        <Layers size={16} aria-hidden="true" /> Styl mapy
      </h3>
      <div className="looks-rows" role="radiogroup" aria-label="Styl mapy">
        {MAP_STYLES.map((s) => (
          <RadioRow
            key={s.id}
            icon={MAP_ICON[s.id]}
            label={s.label}
            note={MAP_NOTE[s.id]}
            checked={s.id === mapStyle}
            onPick={() => onMapStyle(s.id)}
          />
        ))}
      </div>
    </Modal>
  )
}
