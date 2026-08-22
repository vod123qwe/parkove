import { Navigation, X } from 'lucide-react'
import { Button, Modal } from '../ds'
import { TileMap } from './TileMap'
import type { Pt } from './geo'
import type { WalkRoute } from './data/walk-routes'

/**
 * Dojście do jednego miejsca, w dużym kadrze.
 *
 * Kafel w liście pokazuje trasę na 132 pikselach, co wystarcza do wyboru, ale
 * nie do zapamiętania drogi. Tutaj ten sam kadr dostaje pół ekranu, żeby dało
 * się zobaczyć, którędy to właściwie idzie, zanim wyjdziesz z auta.
 */
export function RouteModal({
  open,
  onClose,
  parkId,
  title,
  point,
  route,
}: {
  open: boolean
  onClose: () => void
  parkId: string
  title: string
  point: Pt
  route?: WalkRoute | null
}) {
  return (
    <Modal open={open} onClose={onClose} title="Dojście" action="back" presentation="push">
      <p className="t-body-sm parking-lead">
        <strong>{title}</strong>
        {route
          ? route.m <= 70
            ? ': szlak zaczyna się przy samym parkingu.'
            : `: ${route.m >= 1000 ? (route.m / 1000).toFixed(1).replace('.', ',') + ' km' : route.m + ' m'} ścieżkami do wejścia na szlak, około ${route.min} min.`
          : ': trasy pieszej nie policzyliśmy, więc linia pokazuje tylko kierunek i odległość.'}
      </p>
      <TileMap parkId={parkId} point={point} route={route} showStraight height={Math.round(window.innerHeight * 0.46)} />
      <div className="app-routeactions">
        <Button
          full
          size="lg"
          icon={<Navigation size={18} />}
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${point[1]},${point[0]}&travelmode=walking`,
              '_blank',
              'noopener',
            )
          }
        >
          Prowadź w Google
        </Button>
        <Button full variant="ghost" icon={<X size={18} />} onClick={onClose}>
          Zamknij
        </Button>
      </div>
    </Modal>
  )
}
