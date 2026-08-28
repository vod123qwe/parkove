import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import { Modal, Segmented, Stamp } from '../ds'
import { useGameState } from './state'
import { useMarks } from './photos'
import { isParkComplete } from './progress'
import { GROUP_LABEL, challengeStates } from './data/challenges'
import type { ChallengeGroup, ChallengeState } from './data/challenges'
import parksData from './data/parks.json'
import type { ParkFeature } from './ParkSheet'
import { kindIcon } from './kinds'

const FEATURES = parksData.features as unknown as ParkFeature[]

const ORDER: ChallengeGroup[] = ['places', 'points', 'walks', 'marks']

const fmt = (n: number, unit?: 'km' | 'h') =>
  unit ? n.toFixed(n < 10 ? 1 : 0).replace('.', ',') : String(Math.round(n))

type Tab = 'stamps' | 'challenges'

/**
 * Osiągnięcia: pieczątki i wyzwania, w dwóch zakładkach.
 *
 * Droga do tego kształtu jest warta zapisania, bo pokazuje, czego nie widziałem
 * za pierwszym razem. Najpierw były „Pieczątki", potem „Album" (miejsce, do
 * którego się wraca i patrzy), potem „Wyzwania" z pieczątkami dorzuconymi jako
 * ostatnia sekcja. Ostatnie było gorsze niż wygląda: **jedna z dwóch równych
 * rzeczy była schowana pod drugą**, bo trzeba było przewinąć 26 wierszy, żeby
 * zobaczyć naklejki.
 *
 * Jarek: „to też powinny być taby, pierwszy to pieczątki, a drugi wyzwania, a
 * zakładka powinna nazywać się osiągnięcia". I to jest właściwa hierarchia:
 * **osiągnięcie** to parasol, a pieczątka i wyzwanie to dwa jego rodzaje, równe
 * sobie. Nazwa półki mówi więc o rodzaju, a nie o jednym z egzemplarzy.
 *
 * Pieczątki są pierwsze, bo są obrazkiem. Wchodzisz tu, żeby popatrzeć, a lista
 * z paskami postępu jest do czytania: patrzenie idzie przed czytaniem.
 */
export function AchievementsModal({
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
  const [tab, setTab] = useState<Tab>('stamps')

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
    <Modal open={open} onClose={onClose} title="Osiągnięcia" action="back" presentation="push">
      {/* liczba przy nazwie zakładki, żeby wybór nie był w ciemno */}
      <Segmented
        className="ach__tabs"
        aria-label="Rodzaj osiągnięć"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'stamps', label: `Pieczątki ${stamped}` },
          { value: 'challenges', label: `Wyzwania ${done}` },
        ]}
      />

      {tab === 'stamps' ? (
        <>
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
                fallback={kindIcon(f.properties.kind)}
                onClick={onPick ? () => onPick(f.id) : undefined}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="t-body-sm settings-lead">
            Zrobione: <strong>{done}</strong> z {list.length}. Nic tu nie wygasa, więc nic nie jest
            obowiązkiem: możesz wrócić po miesiącu i doliczyć swoje. Wszystko liczy się z tego, co
            apka już wie, także z wypraw sprzed wprowadzenia wyzwań.
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
        </>
      )}
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
