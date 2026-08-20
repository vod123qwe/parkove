import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../cx'
import './button.css'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'tonal' | 'ghost'
  size?: 'md' | 'lg'
  icon?: ReactNode
  full?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, full, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cx('pk-btn', `-${variant}`, `-${size}`, full && '-full', className)}
      {...rest}
    >
      {icon != null && <span className="pk-btn__icon">{icon}</span>}
      {children}
    </button>
  )
})

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'tonal' | 'ghost'
  'aria-label': string
  children: ReactNode
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'ghost', className, children, ...rest },
  ref,
) {
  return (
    <button ref={ref} className={cx('pk-btn pk-iconbtn', `-${variant}`, className)} {...rest}>
      {children}
    </button>
  )
})
