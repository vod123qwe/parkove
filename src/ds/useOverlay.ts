import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Shared open/close lifecycle for overlays (sheets, modals): keeps the node
 * mounted through the exit animation and funnels every close path (scrim,
 * Escape, drag, external prop change) through one animated route.
 */
export function useOverlay(open: boolean, onClose: () => void, exitMs: number) {
  const [shown, setShown] = useState(open)
  const [closing, setClosing] = useState(false)
  const timer = useRef<number | null>(null)
  const notifyRef = useRef(onClose)
  notifyRef.current = onClose

  const beginClose = useCallback(
    (notify: boolean) => {
      setClosing((already) => {
        if (already) return already
        timer.current = window.setTimeout(() => {
          setShown(false)
          setClosing(false)
          if (notify) notifyRef.current()
        }, exitMs)
        return true
      })
    },
    [exitMs],
  )

  useEffect(() => {
    if (open) {
      if (timer.current) window.clearTimeout(timer.current)
      setClosing(false)
      setShown(true)
    } else if (shown && !closing) {
      beginClose(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const requestClose = useCallback(() => beginClose(true), [beginClose])

  return { shown, closing, requestClose }
}
