import { useEffect } from 'react'

/**
 * The height of the window, measured rather than guessed. Inside an installed
 * app vh, lvh and dvh do not agree with each other, and whichever one is short
 * leaves a white strip above the home indicator. innerHeight is the height we
 * actually got, and unlike visualViewport it does not shrink when a keyboard
 * opens, so a note being typed does not resize the screen underneath it.
 */
export function trackScreenHeight() {
  /*
   * Diagnostyka białego paska na telefonie: adres z ?ground=debug maluje tło
   * dokumentu na magentę. Magentowy pasek u dołu = żaden ekran nie dosięga
   * krawędzi. Biały = maluje go coś innego, niż myślimy.
   */
  if (location.search.includes('ground=debug')) {
    document.documentElement.dataset.pkGround = 'debug'
  }
  const apply = () => {
    document.documentElement.style.setProperty('--screen-h', `${Math.round(window.innerHeight)}px`)
  }
  apply()
  window.addEventListener('resize', apply)
  // iOS reports the old size for a moment after a turn
  window.addEventListener('orientationchange', () => window.setTimeout(apply, 260))
}

/**
 * Marks the document while a dark screen is in front of everything, so the few
 * pixels the browser keeps for itself are dark as well.
 */
export function useDarkChrome() {
  useEffect(() => {
    const root = document.documentElement
    const before = root.dataset.pkDark
    root.dataset.pkDark = 'on'
    return () => {
      if (before) root.dataset.pkDark = before
      else delete root.dataset.pkDark
    }
  }, [])
}
