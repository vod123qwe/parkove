/**
 * Adres naszego pośrednika (Cloudflare Worker, workers/plant-proxy).
 *
 * Jedna stała na dwie funkcje: rozpoznawanie roślin i pytania o punkt. Oba
 * potrzebują klucza, a klucz w statycznej aplikacji jest publiczny, więc oba
 * chodzą przez ten sam Worker, który trzyma klucze u siebie. Dzięki temu
 * stawiasz go raz.
 *
 * Wklej adres po `npm run plant:deploy`, na przykład
 * 'https://parkove-plant.twoj-login.workers.dev'. Pusty = obie funkcje wyłączone
 * i ich przyciski w ogóle się nie pokazują.
 */
export const PROXY: string = 'https://parkove-plant.vod123qwe.workers.dev'

export const proxyUrl = (path: 'plant' | 'ask') =>
  PROXY ? `${PROXY.replace(/\/$/, '')}/${path}` : ''

export const proxyReady = () => PROXY.length > 0
