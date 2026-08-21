import { ChevronRight, Clock, Coffee, ToyBrick } from 'lucide-react'
import { List, ListItem, Modal } from '../ds'
import { KIND_LABEL, amenitiesFor, fmtHours, isFood } from './data/amenities'
import { detailFor } from './data/amenity-details'

/** the list behind a food or playground pin, with walking directions */
export function AmenityModal({
  parkId,
  parkName,
  kind,
  onClose,
  onPick,
}: {
  parkId: string
  parkName: string
  kind: 'food' | 'playground' | null
  onClose: () => void
  /** wybór konkretnego miejsca: mapa jedzie do pinu, pin się zaznacza */
  onPick: (id: string) => void
}) {
  const wantFood = kind === 'food'
  const spots = amenitiesFor(parkId).filter((s) => isFood(s.kind) === wantFood)

  return (
    <Modal
      presentation="push"
      open={kind != null}
      onClose={onClose}
      title={wantFood ? 'Kawiarnie i jedzenie' : 'Place zabaw'}
      action="back"
    >
      <p className="t-body-sm parking-lead">
        {wantFood ? 'Jedzenie i kawa' : 'Place zabaw'} w okolicy: <strong>{parkName}</strong>. Dotknij
        wiersza, żeby zobaczyć to miejsce na mapie. Dane z OpenStreetMap, więc godziny warto
        sprawdzić na miejscu.
      </p>
      {/* wiersz jest klikalny, więc nie może mieć przycisku w środku: to byłby
          zagnieżdżony button. Prowadzenie siedzi na karcie po wyborze miejsca */}
      <List className="parking-list">
        {spots.map((s) => {
          /* „Plac zabaw" nic nie mówi. „Plac zabaw · piasek · ogrodzony" już tak */
          const d = detailFor(parkId, s.id)
          /* nie powtarzamy nazwy w podpisie: bezimienny plac nazywa sie
             wlasnie "Plac zabaw", wiec podpis ma dodac cechy, nie echo */
          const label = s.name === KIND_LABEL[s.kind] ? [] : [KIND_LABEL[s.kind]]
          /* w liście dwie cechy, nie trzy: trzecia zawijała podpis na dwie linie */
          const bits = [...label, ...(d?.chips ?? []).slice(0, 2)]
          return (
            <ListItem
              key={s.id}
              icon={wantFood ? <Coffee /> : <ToyBrick />}
              leadTone="accent"
              title={s.name}
              meta={bits.length ? bits.join(' · ') : undefined}
              metaExtra={
                d?.hours ? (
                  <span className="park-amenity__hours">
                    <Clock size={12} />
                    {fmtHours(d.hours)}
                  </span>
                ) : undefined
              }
              onClick={() => onPick(s.id)}
              trailing={<ChevronRight size={18} className="park-parking__chevron" />}
            />
          )
        })}
      </List>
    </Modal>
  )
}
