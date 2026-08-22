import { useMemo } from 'react'
import { Check } from 'lucide-react'
import { Modal, Stamp } from '../ds'
import { useGameState } from './state'
import { useMarks } from './photos'
import { isParkComplete } from './progress'
import { GROUP_LABEL, challengeStates } from './data/challenges'
import type { ChallengeGroup, ChallengeState } from './data/challenges'
import parksData from './data/parks.json'
import type { ParkFeature } from './ParkSheet'

const FEATURES = parksData.features as unknown as ParkFeature[]

const ORDER: ChallengeGroup[] = ['places', 'points', 'walks', 'marks']

const fmt = (n: number, unit?: 'km' | 'h') =>
  unit ? n.toFixed(n < 10 ? 1 : 0).replace('.', ',') : String(Math.round(n))

/**
 * Wyzwania, a pod nimi pieczątki.
 *
 * Zastąpiło Album w menu (Jarek: „zamiast albumu powinny być wyzwania"), ale
 * pieczątki zostały: siedzą sekcją na dole tego samego ekranu. Dzięki temu jedna
 * półka odpowiada na całe pytanie „co zdobyłem", a pieczątka zostaje tym, czym
 * była, czyli tożsamością miejsca, nie nagrodą za wyzwanie.
 *
 * Wszystko liczy się z tego, co apka i tak wie, więc wyzwania **działają wstecz**:
 * to, co przeszliście przed ich wprowadzeniem, liczy się od pierwszego wejścia.
 */
export function ChallengesModal({
  open,
  onClose,
  onPick,
}: {
  open: boolean
  onClose: () => void
  /** dotknięcie pieczątki: ekran, który mówi za co jest i ile brakuje */
  onPick?: (parkId: string) => void
}) {
  const { parks, journeys, answers } = useGameState()
  const marks = useMarks()

  const list = useMemo(
    () => challengeStates({ parks, journeys, answers, marks }),
    [parks, journeys, answers, marks],
  )
  const done = list.filter((c) => c.done).length

  const stamped = FEATURES.filter((f) => isParkComplete(f.id, parks)).length
  const sorted = useMemo(
    () =>
      [...FEATURES].sort((a, b) => {
        const ea = isParkComplete(a.id, parks)
        const eb = isParkComplete(b.id, parks)
        if (ea !== eb) return ea ? -1 : 1
        return a.properties.name.localeCompare(b.properties.name, 'pl')
      }),
    [parks],
  )

  return (
    <Modal open={open} onClose={onClose} title="Wyzwania" action="back" presentation="push">
      <p className="t-body-sm settings-lead">
        Zrobione: <strong>{done}</strong> z {list.length}. Nic tu nie wygasa, więc nic nie jest
        obowiązkiem: możesz wrócić po miesiącu i doliczyć swoje. Wszystko liczy się z tego, co apka
        już wie, także z wypraw sprzed wprowadzenia wyzwań.
      </p>

      {ORDER.map((group) => {
        const rows = list.filter((c) => c.group === group)
        if (rows.length === 0) return null
        return (
          <div key={group}>
            <h3 className="t-title chal__title">{GROUP_LABEL[group]}</h3>
            <div className="chal__list">
              {rows.map((c) => (
                <Row key={c.id} c={c} />
              ))}
            </div>
          </div>
        )
      })}

      {/*
        Pieczątki na dole, bo to nagroda za miejsce, nie za wyzwanie, a jednak
        odpowiedź na to samo pytanie: co już mam.
      */}
      <h3 className="t-title chal__title">Pieczątki z miejsc</h3>
      <p className="t-body-sm settings-lead">
        Zdobyte: <strong>{stamped}</strong> z {FEATURES.length}. Większość dostajesz za punkty
        wyprawy, część miejsc ma próg niższy niż komplet. Dotknij pieczątki, żeby zobaczyć, za co
        dokładnie jest ta jedna.
      </p>
      <div className="stamps-grid">
        {sorted.map((f) => (
          <Stamp
            key={f.id}
            name={f.properties.name}
            parkId={f.id}
            earned={isParkComplete(f.id, parks)}
            onClick={onPick ? () => onPick(f.id) : undefined}
          />
        ))}
      </div>
    </Modal>
  )
}

function Row({ c }: { c: ChallengeState }) {
  const pct = Math.min(100, (c.got / c.target) * 100)
  return (
    <div className={`chal${c.done ? ' -done' : ''}`}>
      <span className="chal__mark" aria-hidden="true">
        {c.done ? <Check size={15} /> : fmt(c.got, c.unit)}
      </span>
      <div className="chal__body">
        <p className="t-body-strong chal__name">{c.name}</p>
        <p className="t-caption chal__hint">{c.hint}</p>
        {/* pasek tylko tam, gdzie jest co pokazać: przy celu 1 to zero informacji */}
        {c.target > 1 && !c.done && (
          <span className="chal__track">
            <span className="chal__fill" style={{ width: `${pct}%` }} />
          </span>
        )}
      </div>
      {!c.done && (
        <span className="t-caption chal__num">
          {fmt(c.got, c.unit)} / {c.target}
          {c.unit === 'km' ? ' km' : c.unit === 'h' ? ' h' : ''}
        </span>
      )}
    </div>
  )
}
