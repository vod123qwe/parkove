import type { ReactNode } from 'react'
import { cx } from '../cx'
import './list.css'

export type ListProps = {
  children: ReactNode
  /** hairline dividers between rows */
  divided?: boolean
  /** divider starts past the leading icon, iOS style */
  inset?: boolean
  className?: string
}

/** rows of ListItem separated by hairline dividers */
export function List({ children, divided = true, inset = true, className }: ListProps) {
  return (
    <div className={cx('pk-list', divided && '-divided', inset && '-inset', className)}>
      {children}
    </div>
  )
}

export type ListHeadProps = {
  children: ReactNode
  className?: string
}

/**
 * Nagłówek sekcji listy: mały, wersalikowy, z oddechem nad sobą.
 *
 * Komponent, nie klasa w aplikacji (uwaga Jarka 2026-08-25: „uwzględniasz
 * jako komponent?"): każdy ekran z pogrupowaną listą ma mówić tym samym
 * głosem, a rozmiar i odstępy nagłówka to decyzja systemu, nie ekranu.
 */
export function ListHead({ children, className }: ListHeadProps) {
  return <p className={cx('pk-listhead', className)}>{children}</p>
}
