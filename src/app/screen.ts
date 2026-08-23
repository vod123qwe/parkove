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
  if (location.search.includes('ground=debug') || localStorage.getItem(GROUND_KEY) === '1') {
    document.documentElement.dataset.pkGround = 'debug'
  }
  if (location.search.includes('sim=phone') || localStorage.getItem(SIM_KEY) === '1') {
    document.documentElement.dataset.pkSim = 'phone'
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

export const GROUND_KEY = 'pk-ground-debug'
export const SIM_KEY = 'pk-sim-phone'

/**
 * Symulacja bezpiecznych obszarów telefonu na dowolnym ekranie.
 *
 * Jarek: „dalej na dole jest przerwa na telefonie, jak możemy to rozwiązać?
 * możesz zasymulować taką przestrzeń?". Można, i to jest właściwa kolejność:
 * najpierw odtworzyć problem tam, gdzie widać kod, a potem naprawiać.
 *
 * Wcięcia idą przez zmienne `--sa-*` (patrz ds.css), więc wystarczy je nadpisać.
 * Do tego dwa przezroczyste, pasiaste pasy dokładnie tam, gdzie na telefonie
 * jest wcięcie: przez nie widać, co jest pod spodem.
 */
export function toggleSimPhone() {
  const root = document.documentElement
  const on = root.dataset.pkSim === 'phone'
  if (on) {
    delete root.dataset.pkSim
    localStorage.removeItem(SIM_KEY)
  } else {
    root.dataset.pkSim = 'phone'
    localStorage.setItem(SIM_KEY, '1')
  }
  return !on
}

/**
 * Przełącznik diagnostyki białego paska, dostępny w zainstalowanej aplikacji
 * (adresu z parametrem nie da się tam wpisać): trzy dotknięcia numeru wersji.
 * Podczas diagnostyki tło dokumentu jest magentowe, więc od razu widać, czy pasek
 * u dołu to nasza szpara, czy coś innego. Zwraca stan po przełączeniu.
 */
export function toggleGroundDebug() {
  const root = document.documentElement
  const on = root.dataset.pkGround === 'debug'
  if (on) {
    delete root.dataset.pkGround
    localStorage.removeItem(GROUND_KEY)
  } else {
    root.dataset.pkGround = 'debug'
    localStorage.setItem(GROUND_KEY, '1')
  }
  return !on
}

/** Liczby, które rozstrzygają spór o dolną krawędź: co mówi okno, co ekran, ile
 *  systemu zabrał na wskaźnik, i czy element przyklejony do dołu tam dosięga. */
export function screenReport() {
  const probe = document.createElement('div')
  probe.style.cssText =
    'position:fixed;left:0;bottom:0;width:1px;height:env(safe-area-inset-bottom,0px);pointer-events:none;'
  document.body.appendChild(probe)
  const safe = Math.round(probe.getBoundingClientRect().height)
  const fixedBottom = Math.round(probe.getBoundingClientRect().bottom)
  probe.remove()
  const dpr = window.devicePixelRatio || 1
  return [
    `okno ${Math.round(window.innerHeight)}`,
    `ekran ${Math.round(window.screen.height)}`,
    `widok ${Math.round(window.visualViewport?.height ?? 0)}`,
    `safe ${safe}`,
    `fixed-dol ${fixedBottom}`,
    `dpr ${dpr}`,
    `standalone ${window.matchMedia('(display-mode: standalone)').matches ? 'tak' : 'nie'}`,
  ].join(' · ')
}
