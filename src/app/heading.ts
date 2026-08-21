import { useEffect, useState } from 'react'

/**
 * Kierunek, w którym patrzy telefon, w stopniach od północy.
 *
 * Na iOS kompas wymaga zgody, o którą można poprosić TYLKO w reakcji na
 * dotknięcie, więc `askHeading` wywołujemy przy wyborze celu. Gdy zgody nie ma
 * albo telefon nie ma magnetometru, hook zwraca null i strzałki po prostu nie
 * pokazujemy: fałszywy kierunek w terenie jest gorszy niż żaden.
 */
type Orientation = DeviceOrientationEvent & { webkitCompassHeading?: number }

export async function askHeading() {
  const api = DeviceOrientationEvent as unknown as {
    requestPermission?: () => Promise<'granted' | 'denied'>
  }
  if (typeof api?.requestPermission !== 'function') return true // Android i desktop nie pytają
  try {
    return (await api.requestPermission()) === 'granted'
  } catch {
    return false
  }
}

export function useHeading(active: boolean) {
  const [heading, setHeading] = useState<number | null>(null)
  useEffect(() => {
    if (!active) return
    const onOrient = (e: Event) => {
      const o = e as Orientation
      /*
       * webkitCompassHeading to gotowy azymut (0 = północ, rośnie zgodnie z
       * ruchem wskazówek). Na Androidzie liczymy go z alpha, które biegnie w
       * drugą stronę i tylko przy absolute jest odniesione do północy.
       */
      const ios = o.webkitCompassHeading
      if (typeof ios === 'number' && !Number.isNaN(ios)) {
        setHeading(ios)
        return
      }
      if (o.absolute && typeof o.alpha === 'number') setHeading((360 - o.alpha) % 360)
    }
    window.addEventListener('deviceorientation', onOrient)
    window.addEventListener('deviceorientationabsolute', onOrient)
    return () => {
      window.removeEventListener('deviceorientation', onOrient)
      window.removeEventListener('deviceorientationabsolute', onOrient)
    }
  }, [active])
  return heading
}

/** azymut z punktu A do B, w stopniach od północy */
export function bearing([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]) {
  const r = Math.PI / 180
  const dLon = (lon2 - lon1) * r
  const y = Math.sin(dLon) * Math.cos(lat2 * r)
  const x =
    Math.cos(lat1 * r) * Math.sin(lat2 * r) - Math.sin(lat1 * r) * Math.cos(lat2 * r) * Math.cos(dLon)
  return (Math.atan2(y, x) / r + 360) % 360
}
