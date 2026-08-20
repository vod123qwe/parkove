import type { ReactNode } from 'react'
import { ChevronLeft, X } from 'lucide-react'
import { cx } from '../cx'
import { IconButton } from './Button'
import './navbar.css'

export type NavBarProps = {
  title?: string
  /** close (X) for overlays, back (<) for drill-in navigation */
  variant?: 'close' | 'back'
  onAction: () => void
  /** optional right-side slot; the title stays centered regardless */
  trailing?: ReactNode
  /** true once the content under the bar has scrolled: translucent blur backdrop */
  scrolled?: boolean
  /** floats over a map: no background, no title, a white button that always reads */
  transparent?: boolean
  className?: string
}

/** top bar for full-screen views: action always on the left, title centered */
export function NavBar({
  title,
  variant = 'close',
  onAction,
  trailing,
  scrolled,
  transparent,
  className,
}: NavBarProps) {
  return (
    <header
      className={cx(
        'pk-navbar',
        scrolled && !transparent && '-scrolled',
        transparent ? '-transparent' : null,
        className,
      )}
    >
      <IconButton
        aria-label={variant === 'close' ? 'Zamknij' : 'Wstecz'}
        variant="tonal"
        onClick={onAction}
        className="pk-navbar__action"
      >
        {variant === 'close' ? <X size={20} /> : <ChevronLeft size={20} />}
      </IconButton>
      {title != null && !transparent && <h2 className="pk-navbar__title">{title}</h2>}
      {trailing != null && <span className="pk-navbar__trailing">{trailing}</span>}
    </header>
  )
}
