import {
  Award,
  BookOpen,
  ChevronRight,
  Footprints,
  Info,
  List as ListIcon,
  Palette,
  Route,
} from 'lucide-react'
import { List, ListHead, ListItem, Modal, Stat, StatGrid } from '../ds'
import { useGameState } from './state'
import { isParkComplete } from './progress'
import parksData from './data/parks.json'
import { CHALLENGES } from './data/challenges'
import { VERSION } from '../changelog'
import { plMiejsca, plNaklejki, plWyprawy } from './naming'

const FEATURE_COUNT =
  (parksData as { features: Array<{ id: string }> }).features.filter((feature) => feature.id !== 'test-piltza')
    .length

const TARGETS = [1, 3, 5, 10, 15, 20, 30, 40, FEATURE_COUNT]

export function ProfileScreen({
  open,
  challengeDone,
  onClose,
  onStats,
  onAchievements,
  onJournal,
  onAllParks,
  onLooks,
  onAbout,
}: {
  open: boolean
  challengeDone: number
  onClose: () => void
  onStats: () => void
  onAchievements: () => void
  onJournal: () => void
  onAllParks: () => void
  onLooks: () => void
  onAbout: () => void
}) {
  const { parks, journeys } = useGameState()
  const visited = Object.keys(parks).filter((id) => id !== 'test-piltza').length
  const golden = Object.keys(parks).filter(
    (id) => id !== 'test-piltza' && isParkComplete(id, parks),
  ).length
  const totalKm = journeys.reduce((sum, journey) => sum + journey.distanceM, 0) / 1000
  const points = Object.values(parks).reduce((sum, park) => sum + park.points.length, 0)
  const percent = Math.min(100, Math.round((visited / FEATURE_COUNT) * 100))
  const nextTarget = TARGETS.find((target) => target > visited) ?? FEATURE_COUNT
  const toNext = Math.max(0, nextTarget - visited)

  return (
    <Modal open={open} onClose={onClose} title="Ty" action="close" presentation="push">
      <section className="prof-progress" aria-label="Postęp odkrywania Krakowa">
        <div className="prof-progress__top">
          <span className="t-caption">Twój Kraków</span>
          <span className="t-caption prof-progress__percent">{percent}%</span>
        </div>
        <div className="prof-progress__score">
          <strong>{visited}</strong>
          <span>
            z {FEATURE_COUNT}<br />
            miejsc odkrytych
          </span>
        </div>
        <div
          className="prof-progress__track"
          role="progressbar"
          aria-label="Odkryte miejsca"
          aria-valuemin={0}
          aria-valuemax={FEATURE_COUNT}
          aria-valuenow={visited}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="t-caption prof-progress__next">
          {visited >= FEATURE_COUNT
            ? 'Kraków odkryty. Teraz możesz wracać po własne historie.'
            : `${toNext} ${plMiejsca(toNext)} do kolejnego celu: ${nextTarget}`}
        </p>
      </section>

      <StatGrid cols={3} className="prof-stats">
        <Stat icon={<Footprints size={16} />} value={String(journeys.length)} label={plWyprawy(journeys.length)} />
        <Stat
          icon={<Route size={16} />}
          value={totalKm >= 10 ? String(Math.round(totalKm)) : totalKm.toFixed(1).replace('.', ',')}
          label="km w nogach"
        />
        <Stat icon={<Award size={16} />} value={String(golden)} label="złotych" />
      </StatGrid>

      <ListHead>Twoja historia</ListHead>
      <List divided={false} className="prof-cells">
        <ListItem
          className="prof-cell -featured"
          icon={<BookOpen />}
          leadTone="accent"
          leadShape="squircle"
          title="Pamiętnik"
          meta={
            journeys.length
              ? `${journeys.length} ${plWyprawy(journeys.length)} · wspomnienia i mapa odkryć`
              : 'Wyprawy, zdjęcia, notatki i mapa odkryć w jednej historii'
          }
          trailing={<ChevronRight size={18} />}
          onClick={onJournal}
        />
      </List>

      <ListHead>Odkrywaj</ListHead>
      <List divided={false} className="prof-cells">
        <ListItem
          className="prof-cell"
          icon={<ListIcon />}
          leadTone="clay"
          leadShape="squircle"
          title="Wszystkie parki"
          meta={`${FEATURE_COUNT} miejsc · ${visited} odwiedzonych`}
          trailing={<ChevronRight size={18} />}
          onClick={onAllParks}
        />
        <ListItem
          className="prof-cell"
          icon={<Award />}
          leadTone="gold"
          leadShape="squircle"
          title="Osiągnięcia"
          meta={`${golden} ${plNaklejki(golden)} · ${challengeDone} z ${CHALLENGES.length} wyzwań`}
          trailing={<ChevronRight size={18} />}
          onClick={onAchievements}
        />
      </List>

      <ListHead>Twoje dane</ListHead>
      <List divided={false} className="prof-cells">
        <ListItem
          className="prof-cell"
          icon={<Route />}
          leadTone="sky"
          leadShape="squircle"
          title="Moje liczby"
          meta={`${points} odkrytych punktów · postępy i rekordy`}
          trailing={<ChevronRight size={18} />}
          onClick={onStats}
        />
      </List>

      <ListHead>Aplikacja</ListHead>
      <List divided={false} className="prof-cells -last">
        <ListItem
          className="prof-cell"
          icon={<Palette />}
          leadTone="plum"
          leadShape="squircle"
          title="Wygląd"
          meta="Motyw i styl mapy"
          trailing={<ChevronRight size={18} />}
          onClick={onLooks}
        />
        <ListItem
          className="prof-cell"
          icon={<Info />}
          leadShape="squircle"
          title="O aplikacji"
          meta={`Wersja ${VERSION} · aktualizacje i katalog DS`}
          trailing={<ChevronRight size={18} />}
          onClick={onAbout}
        />
      </List>
    </Modal>
  )
}
