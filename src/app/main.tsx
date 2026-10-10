import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ErrorBoundary } from './ErrorBoundary'
import { initTheme } from './theme'
import { trackScreenHeight, trackWide } from './screen'
import { readTripFromUrl } from './data/trip'

/* link z wyprawa ustawia dom mapy, zanim cokolwiek sie wyrenderuje */
readTripFromUrl()

initTheme()
trackScreenHeight()
/* uklad webowy (panel + mapa) tez przed pierwszym renderem: mapa ma od razu
   wlasciwa szerokosc, bez przeskoku i bez map.resize() po fakcie */
trackWide()

// only in a build: in dev the worker would serve stale modules
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {})
  })
}
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
