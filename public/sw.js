/*
 * Offline shell for Parkove. The point: once the app has been opened on the
 * phone, a dead dev server (or no network in a park) must not take it down.
 *
 * shell   - app entry, cached on install so a cold start always has something
 * runtime - hashed build assets, photos, stamps, fonts: stale-while-revalidate
 * tiles   - map tiles, cache-first with a cap so the cache cannot grow forever
 */
const VERSION = 'v1'
const SHELL = `parkove-shell-${VERSION}`
const RUNTIME = `parkove-runtime-${VERSION}`
const TILES = `parkove-tiles-${VERSION}`
const TILE_LIMIT = 900

const SHELL_URLS = ['', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'apple-touch-icon.png']
const TILE_HOSTS = ['tiles.openfreemap.org', 'server.arcgisonline.com', 'services.arcgisonline.com']
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']

const scoped = (path) => new URL(path, self.registration.scope).toString()

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL)
      // one bad URL must not fail the whole install, so add them one by one
      await Promise.all(SHELL_URLS.map((u) => cache.add(scoped(u)).catch(() => {})))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, RUNTIME, TILES])
      for (const key of await caches.keys()) if (!keep.has(key)) await caches.delete(key)
      await self.clients.claim()
      await warmAssets()
    })(),
  )
})

/**
 * On the very first visit the page loads its assets before this worker takes
 * control, so nothing of the build would be cached yet and the second, offline
 * open would fail. Read the cached shell and pull in what it references.
 */
async function warmAssets() {
  const shell = await caches.open(SHELL)
  const res = (await shell.match(scoped('index.html'))) ?? (await shell.match(scoped('')))
  if (!res) return
  const html = await res.clone().text()
  const urls = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))"/g)].map((m) =>
    new URL(m[1], self.registration.scope).toString(),
  )
  const runtime = await caches.open(RUNTIME)
  await Promise.all(
    urls.map(async (url) => {
      if (await runtime.match(url)) return
      await runtime.add(url).catch(() => {})
    }),
  )
}

async function trim(cache, limit) {
  if (!limit) return
  const keys = await cache.keys()
  if (keys.length <= limit) return
  for (const key of keys.slice(0, keys.length - limit)) await cache.delete(key)
}

async function cacheFirst(request, cacheName, limit) {
  const cache = await caches.open(cacheName)
  const hit = await cache.match(request)
  if (hit) return hit
  try {
    const res = await fetch(request)
    if (res && (res.ok || res.type === 'opaque')) {
      await cache.put(request, res.clone())
      trim(cache, limit)
    }
    return res
  } catch {
    return new Response('', { status: 504, statusText: 'offline' })
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const hit = await cache.match(request)
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) cache.put(request, res.clone())
      return res
    })
    .catch(() => null)
  if (hit) return hit
  const res = await network
  return res ?? new Response('', { status: 504, statusText: 'offline' })
}

async function shellFirst(request) {
  try {
    return await fetch(request)
  } catch {
    const cache = await caches.open(SHELL)
    return (
      (await cache.match(scoped('index.html'))) ??
      (await cache.match(scoped(''))) ??
      new Response('<h1>Parkove jest offline</h1>', {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      })
    )
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (request.mode === 'navigate') return event.respondWith(shellFirst(request))
  if (TILE_HOSTS.includes(url.hostname)) return event.respondWith(cacheFirst(request, TILES, TILE_LIMIT))
  if (FONT_HOSTS.includes(url.hostname)) return event.respondWith(cacheFirst(request, RUNTIME))
  if (url.origin === self.location.origin) return event.respondWith(staleWhileRevalidate(request, RUNTIME))
})
