import { useState } from 'react'
import { Compass } from 'lucide-react'
import { IconButton, Modal, PlaceRow } from '../ds'
import { MiniMap } from './MiniMap'
import { KIND_LABEL, amenitiesFor, fmtHours, isFood, walkUrl } from './data/amenities'
import { detailFor } from './data/amenity-details'
import type { Pt } from './geo'

/**
 * Kawiarnie albo place zabaw jednego miejsca, ułożone tym samym wzorem co
 * parkingi: szkic z numerami na górze, a w wierszu pełna nazwa, cechy z OSM
 * jako znaczniki i godziny. Jeden wzór dla wszystkich list miejsc, bo to ta
 * sama czynność: wybieram, gdzie idę.
 */
export function AmenityModal({
  parkId,
  parkName,
  kind,
  onClose,
  onPick,
  me,
}: {
  parkId: string
  parkName: string
  kind: 'food' | 'playground' | null
  onClose: () => void
  /** wybór konkretnego miejsca: mapa jedzie do pinu, pin się zaznacza */
  onPick: (id: string) => void
  me?: Pt | null
}) {
  const wantFood = kind === 'food'
  const spots = amenitiesFor(parkId).filter((s) => isFood(s.kind) === wantFood)
  const [picked, setPicked] = useState<string | null>(null)

  return (
    <Modal
      presentation="push"
      open={kind != null}
      onClose={onClose}
      title={wantFood ? 'Kawiarnie i jedzenie' : 'Place zabaw'}
      action="back"
    >
      <p className="t-body-sm parking-lead">
        {wantFood ? 'Jedzenie i kawa' : 'Place zabaw'} w okolicy: <strong>{parkName}</strong>.
        Numery na szkicu odpowiadają wierszom. Dane z OpenStreetMap, więc godziny warto sprawdzić
        na miejscu.
      </p>
      <MiniMap
        parkId={parkId}
        points={spots.map((s) => ({ id: s.id, coords: s.coords }))}
        selected={picked}
        me={me ?? null}
        onPick={(id) => {
          setPicked(id)
          onPick(id)
        }}
      />
      <div className="app-placelist">
        {spots.map((s, i) => {
          const d = detailFor(parkId, s.id)
          /* nie powtarzamy nazwy w znacznikach: bezimienny plac nazywa się
             właśnie „Plac zabaw", więc znacznikiem jest to, co go wyróżnia */
          const label = s.name === KIND_LABEL[s.kind] ? [] : [KIND_LABEL[s.kind]]
          const pills = [...label, ...(d?.chips ?? []), d?.hours ? fmtHours(d.hours) : null].filter(
            Boolean,
          ) as string[]
          return (
            <PlaceRow
              key={s.id}
              index={i + 1}
              title={s.name}
              pills={pills}
              selected={picked === s.id}
              onClick={() => {
                setPicked(s.id)
                onPick(s.id)
              }}
              action={
                <IconButton
                  aria-label={`Prowadź: ${s.name}`}
                  variant="tonal"
                  onClick={() => window.open(walkUrl(s.coords), '_blank', 'noopener')}
                >
                  <Compass size={18} />
                </IconButton>
              }
            />
          )
        })}
      </div>
      {spots.length === 0 && (
        <p className="t-body-sm park-muted">
          {wantFood ? 'Nic tu nie znaleźliśmy w OpenStreetMap.' : 'Placu zabaw tu nie ma.'}
        </p>
      )}
    </Modal>
  )
}
