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
  /**
   * How the screen arrives, following the platform conventions:
   * 'cover' rises from the bottom, for something presented over what you were
   * doing; 'push' slides in from the right, for going one level deeper.
   */
  presentation?: 'cover' | 'push'
}

/** full-screen screen, presented or pushed; for content that deserves the whole stage */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  action = 'close',
  presentation = 'cover',
}: ModalProps) {
  const { shown, closing, requestClose } = useOverlay(open, onClose, 280)
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

  // the screen underneath slides back a little while something sits on top of it,
  // which is what makes a push feel like navigation rather than a swap
  useEffect(() => {
    if (!shown || closing) return
    const root = document.documentElement
    const key = presentation === 'push' ? 'pkPushed' : 'pkCovered'
    const n = Number(root.dataset[key] ?? 0) + 1
    root.dataset[key] = String(n)
    return () => {
      const left = Number(root.dataset[key] ?? 1) - 1
      if (left > 0) root.dataset[key] = String(left)
      else delete root.dataset[key]
    }
  }, [shown, closing, presentation])

  if (!shown) return null

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    setScrolled((e.target as HTMLDivElement).scrollTop > 4)
  }

  return (
    <div className={cx('pk-modal', `-${presentation}`, closing && '-closing', className)}>
      <div className="pk-modal__panel" role="dialog" aria-modal="true" aria-label={title}>
        <NavBar title={title} variant={action} onAction={requestClose} scrolled={scrolled} className="pk-modal__nav" />
        <div className="pk-modal__content" onScroll={onScroll}>
          <div className="pk-modal__inner">{children}</div>
        </div>
      </div>
    </div>
  )
}
