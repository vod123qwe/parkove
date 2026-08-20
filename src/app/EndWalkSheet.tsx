import { Check, MapPin } from 'lucide-react'
import { BottomSheet, Button, List, ListItem, Stat } from '../ds'
import { collectPoint, useGameState } from './state'
import { questForPark } from './data/quests'
import { distanceM, formatDistance } from './geo'
import { usePhotos } from './photos'

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${m} min`
}

/**
 * The last question of a walk. It exists because ending is irreversible and
 * because GPS misses things: a point walked past but never registered can be
 * ticked here by hand, before the walk becomes a journal entry.
 */
export function EndWalkSheet({ onClose, onConfirm }: { onClose: () => void; onConfirm: () => void }) {
  const { expedition, parks } = useGameState()
  const photos = usePhotos()
  if (!expedition) return null

  const quest = questForPark(expedition.parkId)
  const collected = new Set(parks[expedition.parkId]?.points ?? [])
  const missed = (quest?.pois ?? []).filter((p) => !collected.has(p.id))
  const total = quest?.pois.length ?? 0
  const done = total - missed.length
  const here = expedition.where?.coords ?? expedition.track[expedition.track.length - 1]
  const shots = photos.filter((ph) => ph.journeyId === expedition.id).length

  return (
    <BottomSheet
      open
      onClose={onClose}
      title={missed.length ? 'Jeszcze nie wszystko' : 'Kończysz wyprawę?'}
    >
      <div className="endwalk">
        <p className="t-body endwalk__lead">
          {missed.length
            ? `Zaliczyłeś ${done} z ${total} punktów. Jeśli któryś minąłeś, a aplikacja go nie złapała, odhacz go teraz: po zakończeniu wyprawa idzie do dziennika taka, jaka jest.`
            : total > 0
              ? 'Komplet punktów. Zapisuję wyprawę w dzienniku i przybijam pieczątkę.'
              : 'Spacer bez punktów też się liczy: zapiszę trasę, czas i dystans.'}
        </p>

        <div className="endwalk__stats">
          <Stat value={fmtTime(Date.now() - expedition.startedAt)} label="czas" />
          <Stat
            value={`${(expedition.distanceM / 1000).toFixed(1).replace('.', ',')} km`}
            label="dystans"
          />
          {total > 0 && <Stat value={`${done}/${total}`} label="punkty" />}
          {shots > 0 && <Stat value={String(shots)} label="zdjęcia" />}
        </div>

        {missed.length > 0 && (
          <>
            <h3 className="t-title endwalk__title">Niezaliczone punkty</h3>
            <List>
              {missed.map((poi) => (
                <ListItem
                  key={poi.id}
                  icon={<MapPin />}
                  title={poi.name}
                  meta={here ? `${formatDistance(distanceM(here, poi.coords))} od Ciebie` : poi.teaser}
                  className="-stacked"
                  trailing={
                    <Button
                      variant="ghost"
                      icon={<Check size={16} />}
                      onClick={() => collectPoint(expedition.parkId, poi.id)}
                    >
                      Byłem tu
                    </Button>
                  }
                />
              ))}
            </List>
          </>
        )}

        <div className="endwalk__actions">
          <Button full size="lg" onClick={onConfirm}>
            Zakończ i zapisz
          </Button>
          <Button full variant="ghost" onClick={onClose}>
            Wracam na szlak
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
