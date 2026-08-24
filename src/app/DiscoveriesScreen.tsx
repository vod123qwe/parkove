/*
 * Twoje odkrycia: mapa Krakowa pod chmurami (fog of war z briefu, makiety 13a
 * i 13b, koncepcja w docs/odkrycia.md).
 *
 * Zasady tego ekranu:
 * - odkryte miejsca to CZYSTE OKNA w mgle: pełny kolor, obwódka limonkowa,
 *   złota dla domkniętych na 100%;
 * - nieodkryte śpią pod chmurami, z ledwie widocznym kreskowanym zarysem i
 *   znakiem zapytania. Zarys mówi „tu coś jest", nie mówi co;
 * - chmury dryfują powoli (dwie warstwy, różne prędkości i kierunki) i lekko
 *   reagują na ruch mapy (paralaksa);
 * - świeżo odkryte miejsce dostaje RAZ animację rozchodzenia się chmur.
 *
 * Technika: mgła to jeden canvas 2D nad mapą. Dwie warstwy kafelkowanego PNG,
 * potem destination-out wycina miękkie okna nad odkrytymi parkami, a na mgle
 * dorysowują się kreskowane zarysy ukrytych. Wszystko liczone z pozycji kamery
 * (map.project), przerysowywane w jednej pętli rAF, żywej tylko na tym ekranie.
 */
import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import { NavBar } from '../ds'
import { useLightChrome } from '../ds/useLightChrome'
import { resolveMapStyle } from './data/mapstyles'
import parksData from './data/parks.json'
import { isParkComplete } from './progress'
import { useGameState } from './state'
import { asset } from './assets'
import type { ParkFeature } from './ParkSheet'

const FEATURES = (parksData as unknown as { features: ParkFeature[] }).features.filter(
  (f) => f.id !== 'test-piltza',
)

const SEEN_KEY = 'pk-disc-seen'
const readSeen = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

/** zewnętrzne pierścienie geometrii miejsca (Polygon i MultiPolygon) */
function outerRings(f: ParkFeature): number[][][] {
  const g = f.geometry as { type: string; coordinates: unknown }
  if (g.type === 'Polygon') return [(g.coordinates as number[][][])[0]]
  if (g.type === 'MultiPolygon') return (g.coordinates as number[][][][]).map((poly) => poly[0])
  return []
}

/** promień okna w mgle: z powierzchni miejsca, w pikselach na aktualnym zoomie */
function windowRadiusPx(map: maplibregl.Map, f: ParkFeature): number {
  const c = f.properties.center
  const p1 = map.project(c as [number, number])
  const p2 = map.project([c[0] + 0.001, c[1]])
  const pxPerDeg = (p2.x - p1.x) / 0.001
  const rM = Math.sqrt(((f.properties.areaHa || 4) * 10000) / Math.PI)
  const rPx = (rM / 71000) * pxPerDeg
  return Math.min(170, Math.max(30, rPx * 1.25))
}

export function DiscoveriesScreen({ onClose }: { onClose: () => void }) {
  const { parks } = useGameState()
  useLightChrome(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const fogRef = useRef<HTMLCanvasElement>(null)
  const [freshName, setFreshName] = useState<string | null>(null)

  const discovered = FEATURES.filter((f) => parks[f.id])
  const done = discovered.filter((f) => isParkComplete(f.id, parks))
  const valleys = FEATURES.filter((f) => f.properties.kind === 'valley')
  const valleysDone = valleys.filter((f) => parks[f.id]).length

  useEffect(() => {
    const el = mapRef.current
    const fog = fogRef.current
    if (!el || !fog) return

    const style = resolveMapStyle('ortho')
    const map = new maplibregl.Map({
      container: el,
      style: style.spec,
      center: [19.98, 50.05],
      zoom: 10.6,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    })
    map.touchZoomRotate.disableRotation()

    const visited = new Set(Object.keys(parks))
    const doneSet = new Set(FEATURES.filter((f) => isParkComplete(f.id, parks)).map((f) => f.id))
    const seen = new Set(readSeen())
    /* świeże odkrycia: odwiedzone, a jeszcze nie obejrzane na tej mapie */
    const fresh = FEATURES.filter((f) => visited.has(f.id) && !seen.has(f.id))
    if (fresh.length) setFreshName(fresh[0].properties.name)

    map.on('load', () => {
      /* styl ortho niesie wlasny center/zoom i nadpisuje opcje konstruktora,
         wiec kadr calego Krakowa trzeba wymusic po zaladowaniu */
      map.jumpTo({ center: [19.98, 50.05], zoom: 10.6 })
      map.addSource('disc', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: FEATURES.filter((f) => visited.has(f.id)).map((f) => ({
            type: 'Feature' as const,
            geometry: f.geometry,
            properties: { name: f.properties.name, done: doneSet.has(f.id) },
          })),
        },
      })
      map.addLayer({
        id: 'disc-fill',
        type: 'fill',
        source: 'disc',
        paint: { 'fill-color': '#5a7a44', 'fill-opacity': 0.28 },
      })
      map.addLayer({
        id: 'disc-ring',
        type: 'line',
        source: 'disc',
        paint: {
          'line-color': ['case', ['get', 'done'], '#e0b43c', '#b8e84e'],
          'line-width': ['case', ['get', 'done'], 3, 2.2],
        },
      })
      map.addLayer({
        id: 'disc-name',
        type: 'symbol',
        source: 'disc',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11.5,
          'text-font': ['Noto Sans Bold'],
          'text-anchor': 'center',
        },
        paint: {
          'text-color': '#17220f',
          'text-halo-color': 'rgba(255,255,255,0.92)',
          'text-halo-width': 1.6,
        },
      })
    })

    /* --------------- mgła --------------- */
    const ctx = fog.getContext('2d')!
    /* warstwa dziur rysowana osobno: cień rzucany z daleka daje miękką krawędź
       bez ctx.filter, który na starszych WebKitach bywa ignorowany */
    const holes = document.createElement('canvas')
    const hctx = holes.getContext('2d')!
    const pats: (CanvasPattern | null)[] = [null, null, null]
    ;['/clouds/fog-a.png', '/clouds/fog-b.png', '/clouds/fog-c.png'].forEach((src, i) => {
      const img = new Image()
      img.src = asset(src)
      img.onload = () => {
        pats[i] = ctx.createPattern(img, 'repeat')
      }
    })

    const start = performance.now()
    /* animacja świeżych odkryć: dziura rośnie od zera przez 1,6 s */
    const freshIds = new Set(fresh.map((f) => f.id))
    let raf = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      const w = fog.clientWidth
      const h = fog.clientHeight
      if (w === 0) return
      if (fog.width !== w * dpr || fog.height !== h * dpr) {
        fog.width = w * dpr
        fog.height = h * dpr
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      /* paralaksa: stały punkt świata rzutowany na ekran przesuwa wzór */
      const ref = map.project([19.98, 50.05])
      const t = (now - start) / 1000

      const layer = (pat: CanvasPattern | null, alpha: number, ox: number, oy: number) => {
        if (!pat) return
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(ox % 512, oy % 512)
        ctx.fillStyle = pat
        ctx.fillRect(-512, -512, w + 1024, h + 1024)
        ctx.restore()
      }
      /*
       * Trzy warstwy zamiast dwóch (uwaga Jarka: „zasymuluj chmury lepiej"):
       * masa idzie wolno, kłęby z podcieniem średnio i z lekkim kołysaniem,
       * smugi najszybciej. Różne kierunki i sinusowe znoszenie łamią wrażenie
       * taśmy produkcyjnej.
       */
      layer(pats[0], 0.8, ref.x * 0.1 + t * 2.6, ref.y * 0.1 + t * 0.9)
      layer(
        pats[1],
        0.95,
        ref.x * 0.24 - t * 4.6 + Math.sin(t * 0.07) * 28,
        ref.y * 0.24 + t * 1.7 + Math.cos(t * 0.05) * 18,
      )
      layer(pats[2], 0.4, ref.x * 0.4 + t * 8.5, ref.y * 0.4 - t * 1.1 + Math.sin(t * 0.11) * 12)

      /*
       * Okna nad odkrytymi mają KSZTAŁT PARKU (uwaga Jarka), lekko nieregularny:
       * wierzchołki obrysu falują w czasie o kilka pikseli, obrys jest
       * rozpychany grubą kreską (dylatacja), a miękka krawędź bierze się z
       * triku z cieniem: ścieżka rysuje się 4096 px w lewo, a do kadru trafia
       * tylko jej rozmyty cień. Działa wszędzie, bez ctx.filter.
       */
      holes.width = fog.width
      holes.height = fog.height
      hctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      hctx.clearRect(0, 0, w, h)
      hctx.shadowColor = 'rgba(0,0,0,1)'
      /* offsety cienia NIE podlegaja transformacji plotna, sa w pikselach
         urzadzenia: bez mnozenia przez dpr cien ladowal poza kadrem i dziur
         nie bylo wcale */
      hctx.shadowBlur = 20 * dpr
      hctx.shadowOffsetX = 4096 * dpr
      hctx.fillStyle = '#000'
      hctx.strokeStyle = '#000'
      hctx.lineJoin = 'round'
      hctx.lineWidth = 22
      for (const f of FEATURES) {
        if (!visited.has(f.id)) continue
        const c = map.project(f.properties.center as [number, number])
        const rough = windowRadiusPx(map, f) * 2
        if (c.x < -rough || c.y < -rough || c.x > w + rough || c.y > h + rough) continue
        let scale = 1
        if (freshIds.has(f.id)) {
          const k = Math.min(1, (now - start) / 1600)
          scale = 0.12 + 0.88 * (1 - Math.pow(1 - k, 3))
        }
        const wob = (f.id.charCodeAt(0) * 7 + f.id.length * 13) % 97
        hctx.beginPath()
        for (const ring of outerRings(f)) {
          const step = Math.max(1, Math.floor(ring.length / 56))
          let first = true
          for (let i = 0; i < ring.length; i += step) {
            const pt = map.project(ring[i] as [number, number])
            const dx = Math.sin(t * 0.55 + i * 1.7 + wob) * 6
            const dy = Math.cos(t * 0.45 + i * 2.3 + wob) * 6
            const x = c.x + (pt.x - c.x) * scale + dx - 4096
            const y = c.y + (pt.y - c.y) * scale + dy
            if (first) {
              hctx.moveTo(x, y)
              first = false
            } else hctx.lineTo(x, y)
          }
          hctx.closePath()
        }
        hctx.fill()
        hctx.stroke()
      }
      ctx.globalCompositeOperation = 'destination-out'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(holes, 0, 0)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.globalCompositeOperation = 'source-over'

      /*
       * Kreskowane zarysy ukrytych, NA mgle. Z daleka pokazujemy tylko wieksze
       * miejsca: 50 elips ze znakiem zapytania naraz robi z mapy tapete, a
       * zarys ma kusic, nie spisywac.
       */
      const zoom = map.getZoom()
      ctx.setLineDash([5, 6])
      ctx.lineWidth = 1.4
      for (const f of FEATURES) {
        if (visited.has(f.id)) continue
        if (zoom < 11.4 && (f.properties.areaHa ?? 0) < 9) continue
        const p = map.project(f.properties.center as [number, number])
        if (p.x < -120 || p.y < -120 || p.x > w + 120 || p.y > h + 120) continue
        const r = windowRadiusPx(map, f) * 0.72
        ctx.strokeStyle = 'rgba(96,106,86,0.5)'
        ctx.beginPath()
        ctx.ellipse(p.x, p.y, r, r * 0.72, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = 'rgba(96,106,86,0.62)'
        ctx.font = '600 13px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('?', p.x, p.y)
      }
      ctx.setLineDash([])
    }
    raf = requestAnimationFrame(draw)

    /* świeże odkrycia zapisują się jako obejrzane po animacji */
    const t = window.setTimeout(() => {
      if (fresh.length) {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, ...fresh.map((f) => f.id)]))
      }
    }, 2200)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
      map.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="discscreen" ref={wrapRef}>
      <div className="discscreen__map" ref={mapRef} />
      <canvas className="discscreen__fog" ref={fogRef} />
      <NavBar transparent variant="back" onAction={onClose} className="discscreen__nav" />
      <div className="discscreen__title t-label">Twoje odkrycia</div>
      {freshName && (
        <div className="discscreen__fresh t-label">Chmury się rozeszły: {freshName}</div>
      )}
      <div className="discscreen__card">
        <p className="t-headline discscreen__count">
          {discovered.length} z {FEATURES.length} miejsc odkryte
        </p>
        <div className="discscreen__track">
          <div
            className="discscreen__fill"
            style={{ width: `${Math.round((discovered.length / FEATURES.length) * 100)}%` }}
          />
        </div>
        <p className="t-caption discscreen__meta">
          Złote: {done.length} · Dolinki: {valleysDone}/{valleys.length}
        </p>
        <p className="t-caption discscreen__rule">Chmury ustępują tylko w terenie.</p>
      </div>
    </div>
  )
}
