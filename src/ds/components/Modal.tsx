import { useEffect, useState } from 'react'
import type { ReactNode, UIEvent } from 'react'
import { cx } from '../cx'
import { useOverlay } from '../useOverlay'
import { NavBar } from './NavBar'
import './modal.css'

export type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  /** navbar action style: close (X) or back (<); always on the left */
  action?: 'close' | 'back'
}

/** full-screen modal with a gentle enter; for content that deserves the whole stage */
export function Modal({ open, onClose, title, children, className, action = 'close' }: ModalProps) {
  const { shown, closing, requestClose } = useOverlay(open, onClose, 220)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!shown) return
    setScrolled(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') requestClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [shown, requestClose])

  if (!shown) return null

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrolled((e.target as HTMLDivElement).scrollTop > 4)
  }

  return (
    <div className={cx('pk-modal', closing && '-closing', className)}>
      <div className="pk-modal__panel" role="dialog" aria-modal="true" aria-label={title}>
        <NavBar title={title} variant={action} onAction={requestClose} scrolled={scrolled} className="pk-modal__nav" />
        <div className="pk-modal__content" onScroll={onScroll}>
          <div className="pk-modal__inner">{children}</div>
        </div>
      </div>
    </div>
  )
}
