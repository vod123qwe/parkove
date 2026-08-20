export type Theme = 'auto' | 'light' | 'dark'

// same key as the catalog, so the whole project shares one preference
const THEME_KEY = 'pk-theme'

export function applyTheme(theme: Theme) {
  const el = document.documentElement
  if (theme === 'auto') el.removeAttribute('data-theme')
  else el.setAttribute('data-theme', theme)
}

/** light is the default: the app is made for daylight walks */
export function getTheme(): Theme {
  return (localStorage.getItem(THEME_KEY) as Theme) ?? 'light'
}

export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme)
  applyTheme(theme)
}

export function initTheme() {
  applyTheme(getTheme())
}

/** true when the app currently renders dark (explicit choice or system preference) */
export function isDarkNow() {
  const forced = document.documentElement.getAttribute('data-theme')
  if (forced) return forced === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** subscribe to darkness changes from both the theme toggle and the system */
export function onDarkChange(cb: () => void) {
  const observer = new MutationObserver(cb)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', cb)
  return () => {
    observer.disconnect()
    mq.removeEventListener('change', cb)
  }
}
