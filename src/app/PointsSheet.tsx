import { Check, ChevronRight, Crosshair } from 'lucide-react'
import { BottomSheet, List, ListItem } from '../ds'
import { distanceM, formatDistance } from './geo'
import type { Pt } from './geo'
import { CATEGORY_LABEL } from './data/quests'
import type { QuestPoi } from './data/quests'

/**
 * Punkty wyprawy jako lista, do wybierania małych celów w terenie.
 *
 * Kolejność jest po dystansie, bo w terenie liczy się to, co masz obok, a nie
 * to, w jakiej kolejności ktoś opisał trasę. Zdobyte zjeżdżają na koniec:
 * przestały być zadaniem, ale nadal warto wiedzieć, że tam byłeś.
 */
export function PointsSheet({
  open,
  onClose,
  pois,
  collected,
  here,
  targetId,
  onPick,
}: {
  open: boolean
  onClose: () => void
  pois: QuestPoi[]
  collected: Set<string>
  /** twoja pozycja; bez niej lista zostaje w kolejności wyprawy */
  here: Pt | null
  targetId: string | null
  /** wybór punktu jako celu: karta wyprawy przestaje wybierać najbliższy */
  onPick: (poiId: string) => void
}) {
  const rows = pois
    .map((poi) => ({
      poi,
      done: collected.has(poi.id),
      away: here ? distanceM(here, poi.coords) : null,
    }))
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      if (a.away == null || b.away == null) return 0
      return a.away - b.away
    })

  return (
    <BottomSheet open={open} onClose={onClose} title="Punkty wyprawy" modal={false}>
      <p className="t-body-sm parking-lead">
        {here
          ? 'Od najbli\u017cszego. Dotknij punktu, \u017ceby zrobi\u0107 z niego cel: karta wyprawy b\u0119dzie pokazywa\u0107 w\u0142a\u015bnie jego.'
          : 'Szukam sygna\u0142u, wi\u0119c na razie bez dystans\u00f3w. Dotknij punktu, \u017ceby zrobi\u0107 z niego cel.'}
      </p>
      <List className="parking-list">
        {rows.map(({ poi, done, away }) => {
          const meta = [
            done ? 'zdobyty' : null,
            away != null ? formatDistance(away) : null,
            CATEGORY_LABEL[poi.category],
          ]
            .filter(Boolean)
            .join(' \u00b7 ')
          return (
            <ListItem
              key={poi.id}
              icon={done ? <Check /> : targetId === poi.id ? <Crosshair /> : undefined}
              photo={poi.photo ? { src: poi.photo } : undefined}
              leadTone={done ? 'gold' : 'accent'}
              title={poi.name}
              meta={meta}
              onClick={() => onPick(poi.id)}
              trailing={<ChevronRight size={18} className="park-parking__chevron" />}
              className={done ? 'app-pointrow -done' : undefined}
            />
          )
        })}
      </List>
    </BottomSheet>
  )
}
