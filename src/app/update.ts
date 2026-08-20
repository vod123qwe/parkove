import { useEffect, useState } from 'react'

/**
 * An installed app on iOS often resumes the old page instead of navigating, so
 * a deployed update can sit there unnoticed for days. This compares the
 * scripts this document is running against the ones the server currently
 * serves: different entry file, new build.
 */
async function isOutdated() {
  try {
    const running = new Set(
      [...document.querySelectorAll('script[src]')].map((s) => (s as HTMLScriptElement).src),
    )
    if (running.size === 0) return false // dev server: modules are not in the HTML
    const res = await fetch(`${import.meta.env.BASE_URL}index.html`, { cache: 'no-store' })
    if (!res.ok) return false
    const html = await res.text()
    const deployed = [...html.matchAll(/src="([^"]+\.js)"/g)].map(
      (m) => new URL(m[1], location.href).href,
    )
    return deployed.length > 0 && deployed.some((url) => !running.has(url))
  } catch {
    // offline, or the check itself failed: never a reason to bother anyone
    return false
  }
}

const EVERY_MS = 5 * 60 * 1000

/** true once a newer build is live; checked on open and on coming back */
export function useUpdateAvailable() {
  const [outdated, setOutdated] = useState(false)

  useEffect(() => {
    if (!import.meta.env.PROD) return
    let last = 0
    let alive = true
    const check = async () => {
      if (outdated || document.hidden) return
      if (Date.now() - last < EVERY_MS) return
      last = Date.now()
      if ((await isOutdated()) && alive) setOutdated(true)
    }
    const onVisible = () => void check()
    void check()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      alive = false
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [outdated])

  return outdated
}
