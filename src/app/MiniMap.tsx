import { useMemo } from 'react'
import parksData from './data/parks.json'
import type { Pt } from './geo'

/**
 * Mały schemat: obrys parku i numerowane punkty, rysowany w SVG.
 *
 * Świadomie BEZ kafli. Druga instancja mapy GL to drugi kontekst graficzny, a
 * to jest dokładnie ta klasa problemu, z którą walczyliśmy przy trybie 3D.
 * Obrys plus numery odpowiada na pytanie „który jest z której strony", rysuje
 * się natychmiast i działa bez sieci. Pozycję pokazujemy, gdy ją mamy.
 */
export function MiniMap({
  parkId,
  points,
  selected,
  me,
  onPick,
}: {
  parkId: string
  points: Array<{ id: string; coords: Pt }>
  selected?: string | null
  me?: Pt | null
  onPick?: (id: string) => void
}) {
  /*
   * Rzutujemy na STAŁE płótno w pikselach (320 na 190), a nie na viewBox liczony
   * z geografii. Powodem jest Dolina Będkowska: osiem kilometrów długości przy
   * kilkuset metrach szerokości daje viewBox tak wysoki, że numerki schodzą do
   * pięciu pikseli i przestają być czytelne. Tu jedna jednostka to jeden piksel,
   * więc pin ma zawsze te same 11 px, jaki kształt by nie był.
   */
  const view = useMemo(() => {
    const W = 320
    const H = 190
    const f = (parksData as { features: Array<{ id: string; geometry: { type: string; coordinates: unknown } }> }).features.find(
      (x) => x.id === parkId,
    )
    const rings: number[][][] = !f
      ? []
      : f.geometry.type === 'Polygon'
        ? (f.geometry.coordinates as number[][][])
        : (f.geometry.coordinates as number[][][][]).flat()
    const all = [...rings.flat(), ...points.map((p) => p.coords), ...(me ? [me] : [])]
    if (!all.length) return null
    const lons = all.map((c) => c[0])
    const lats = all.map((c) => c[1])
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2
    /* stopień długości jest krótszy niż stopień szerokości: bez tego mapa jest rozciągnięta */
    const k = Math.cos((midLat * Math.PI) / 180)
    const spanX = Math.max((Math.max(...lons) - Math.min(...lons)) * k, 1e-6)
    const spanY = Math.max(Math.max(...lats) - Math.min(...lats), 1e-6)
    const pad = 18
    const scale = Math.min((W - pad * 2) / spanX, (H - pad * 2) / spanY)
    const offX = (W - spanX * scale) / 2
    const offY = (H - spanY * scale) / 2
    const x = (lon: number) => offX + (lon - Math.min(...lons)) * k * scale
    const y = (lat: number) => H - offY - (lat - Math.min(...lats)) * scale
    return { rings, W, H, x, y }
  }, [parkId, points, me])

  if (!view) return null
  const { rings, W, H, x, y } = view
  return (
    <svg className="app-minimap" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Szkic rozmieszczenia">
      {rings.map((ring, i) => (
        <polygon
          key={i}
          className="app-minimap__park"
          points={ring.map((c) => `${x(c[0]).toFixed(1)},${y(c[1]).toFixed(1)}`).join(' ')}
        />
      ))}
      {me && <circle className="app-minimap__me" cx={x(me[0])} cy={y(me[1])} r={7} />}
      {points.map((p, i) => (
        <g
          key={p.id}
          className={`app-minimap__pin${selected === p.id ? ' -on' : ''}`}
          onClick={onPick ? () => onPick(p.id) : undefined}
        >
          <circle cx={x(p.coords[0])} cy={y(p.coords[1])} r={11} />
          <text x={x(p.coords[0])} y={y(p.coords[1]) + 4} textAnchor="middle">
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  )
}
