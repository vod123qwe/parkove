import { useState } from 'react'
import { Check } from 'lucide-react'
import { Modal, Segmented, cx } from '../ds'
import { getTheme, setTheme } from './theme'
import type { Theme } from './theme'
import { MAP_STYLES } from './data/mapstyles'
import type { MapStyleId } from './data/mapstyles'

const THEME_OPTIONS: Array<{ value: Theme; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'light', label: 'Jasny' },
  { value: 'dark', label: 'Ciemny' },
]

/** app appearance: theme now, more later */
export function AppearanceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [theme, setThemeState] = useState<Theme>(getTheme)
  const pick = (t: Theme) => {
    setThemeState(t)
    setTheme(t)
  }
  return (
    <Modal open={open} onClose={onClose} title="Wygląd aplikacji" action="back" presentation="push">
      <p className="t-body-sm settings-lead">
        Motyw stosuje się od razu, także do katalogu komponentów. Auto podąża za ustawieniem
        systemu.
      </p>
      <Segmented options={THEME_OPTIONS} value={theme} onChange={pick} aria-label="Motyw" />
    </Modal>
  )
}

/** map look: style picker with live preview behind the sheet */
export function MapStyleModal({
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
  return (
    <Modal open={open} onClose={onClose} title="Wygląd mapy" action="back" presentation="push">
      <p className="t-body-sm settings-lead">
        Domyślny styl podąża za motywem aplikacji. Zmiana jest widoczna od razu po zamknięciu tego
        ekranu.
      </p>
      <div className="mapopts" role="radiogroup" aria-label="Styl mapy">
        {MAP_STYLES.map((s) => {
          const active = s.id === mapStyle
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={cx('mapopt', active && '-active')}
              onClick={() => onMapStyle(s.id)}
            >
              <span
                className="mapopt__swatch"
                style={{ background: `linear-gradient(135deg, ${s.swatch[0]} 45%, ${s.swatch[1]})` }}
              >
                {active && (
                  <span className="mapopt__check">
                    <Check size={13} />
                  </span>
                )}
              </span>
              <span className="mapopt__label t-caption">{s.label}</span>
            </button>
          )
        })}
      </div>
    </Modal>
  )
}
