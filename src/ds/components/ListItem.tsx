import type { ReactNode } from 'react'
import { cx } from '../cx'
import './listitem.css'

export type ListItemProps = {
  icon?: ReactNode
  /** leading disc tone; accent for visited things, gold for completed */
  /**
   * Ton krążka ikony. Poza stanami gry (accent, gold) są trzy tony
   * SEMANTYCZNE z istniejącej palety HCT: sky (info), clay (jedzenie),
   * plum (zabawa). Każdy ma parę tło+znak w obu motywach, więc pokolorowana
   * lista (np. profil) nie wymaga żadnych nowych tokenów.
   */
  leadTone?: 'neutral' | 'accent' | 'gold' | 'sky' | 'clay' | 'plum'
  /** icon container geometry; squircle is for roomy navigation menus */
  leadShape?: 'round' | 'squircle'
  /**
   * tint (domyślnie) = kolorowa podkładka z pary tonu; paper = biała podkładka,
   * ton zostaje w samej ikonie. Do rzędów na przygaszonych kartach, gdzie
   * kolorowe plamy robiły się zbyt głośne.
   */
  leadSurface?: 'tint' | 'paper'
  /** square photo slot instead of the icon disc */
  photo?: { src: string; alt?: string }
  title: string
  meta?: string
  /** dopisek po metadanych, na ikonki w jednej linii z postępem */
  metaExtra?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
  className?: string
}

export function ListItem({
  icon,
  photo,
  leadTone = 'neutral',
  leadShape = 'round',
  leadSurface = 'tint',
  title,
  meta,
  metaExtra,
  trailing,
  onClick,
  className,
}: ListItemProps) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={cx('pk-listitem', className)} onClick={onClick} type={onClick ? 'button' : undefined}>
      {photo ? (
        <span className="pk-listitem__lead -photo">
          <img src={photo.src} alt={photo.alt ?? ''} loading="lazy" />
        </span>
      ) : (
        icon != null && (
          <span
            className={cx(
              'pk-listitem__lead',
              `-${leadTone}`,
              leadShape === 'squircle' && '-squircle',
              leadSurface === 'paper' && '-paper',
            )}
          >
            {icon}
          </span>
        )
      )}
      <span className="pk-listitem__text">
        <span className="pk-listitem__title">{title}</span>
        {(meta != null || metaExtra != null) && (
          <span className="pk-listitem__meta">
            {meta}
            {metaExtra}
          </span>
        )}
      </span>
      {trailing != null && <span className="pk-listitem__trailing">{trailing}</span>}
    </Tag>
  )
}
