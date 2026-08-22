import { cx } from '../cx'
import './switch.css'

export type SwitchProps = {
  checked: boolean
  onChange: (next: boolean) => void
  /** widoczna etykieta; wiersz cały jest klikalny */
  label: string
  /** druga linia, gdy sama nazwa nie mówi, co się stanie */
  hint?: string
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}

/**
 * Przełącznik jednej rzeczy: włączona albo wyłączona, skutek natychmiastowy.
 *
 * Kiedy on, a kiedy Segmented: Segmented wybiera JEDNĄ z kilku możliwości
 * (jasny, ciemny, auto), Switch odpowiada na pytanie tak-nie i nie ma stanu
 * pośredniego. Filtry mapy są tak-nie, więc są switchami.
 *
 * Cały wiersz jest przyciskiem, nie tylko sam suwak: na telefonie 44 px wysokości
 * i pełna szerokość trafiają się palcem bez patrzenia.
 */
export function Switch({
  checked,
  onChange,
  label,
  hint,
  icon,
  disabled,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={cx('pk-switch', checked && '-on', className)}
      onClick={() => onChange(!checked)}
    >
      {icon && (
        <span className="pk-switch__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="pk-switch__text">
        <span className="pk-switch__label">{label}</span>
        {hint && <span className="pk-switch__hint t-caption">{hint}</span>}
      </span>
      <span className="pk-switch__track" aria-hidden="true">
        <span className="pk-switch__knob" />
      </span>
    </button>
  )
}
