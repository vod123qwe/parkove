import { Award, ChevronRight, Footprints, Info, List as ListIcon, Palette, Route } from 'lucide-react'
import { List, ListHead, ListItem, Modal, ProgressRing, Stat, StatGrid } from '../ds'
import { useGameState } from './state'
import { isParkComplete } from './progress'
import parksData from './data/parks.json'
import { CHALLENGES } from './data/challenges'
import { VERSION } from '../changelog'
import { plMiejsca, plNaklejki, plWyprawy } from './naming'

/**
 * Menu jako PEŁNY EKRAN PROFILU (Jarek 2026-08-25: „mógłby być full screen,
 * gdzie u góry są jakieś podstawowe info o mnie, najważniejsze, a pod spodem
 * odpowiednio podzielone linki").
 *
 * U góry stoi to, co w tej grze naprawdę jest „o nas": ile Krakowa wyszło
 * spod chmur (pierścień), plus trzy liczby drogi: wyprawy, kilometry i złote
 * pieczątki. Linki niżej to zwykłe wiersze: ikona, tekst, chevron, z większym
 * oddechem niż w arkuszach (klasa prof-cells).
 */

const FEATURE_COUNT =
  (parksData as { features: Array<{ id: string }> }).features.filter((f) => f.id !== 'test-piltza')
    .length

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
  /** policzone w App, bo wymaga pelnego stanu gry (odpowiedzi, znaczniki) */
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
  const totalKm = journeys.reduce((s, j) => s + j.distanceM, 0) / 1000
  const points = Object.values(parks).reduce((s, p) => s + p.points.length, 0)

  return (
    <Modal open={open} onClose={onClose} title="Ty" action="close" presentation="push">
      <div className="prof-hero">
        <ProgressRing value={(visited / FEATURE_COUNT) * 100} size="lg" label={String(visited)} />
        <div className="prof-hero__text">
          <p className="t-title prof-hero__line">
            {visited} z {FEATURE_COUNT} {plMiejsca(FEATURE_COUNT)} odkrytych
          </p>
          <p className="t-caption prof-hero__sub">
            {points} punktów wypraw · {golden} {plNaklejki(golden)}
          </p>
        </div>
      </div>
      <StatGrid cols={3} className="prof-stats">
        <Stat icon={<Footprints size={16} />} value={String(journeys.length)} label={plWyprawy(journeys.length)} />
        <Stat
          icon={<Route size={16} />}
          value={totalKm >= 10 ? String(Math.round(totalKm)) : totalKm.toFixed(1).replace('.', ',')}
          label="km w nogach"
        />
        <Stat icon={<Award size={16} />} value={String(golden)} label="złotych" />
      </StatGrid>

      <ListHead>Ty</ListHead>
      <List inset={false} className="prof-cells">
        <ListItem
          icon={<Route />}
          leadTone="accent"
          title="Moje liczby"
          meta="Postępy, rekordy i miejsca na mapie"
          trailing={<ChevronRight size={18} />}
          onClick={onStats}
        />
        <ListItem
          icon={<Award />}
          leadTone="gold"
          title="Osiągnięcia"
          meta={`${golden} ${golden === 1 ? 'pieczątka' : golden < 5 ? 'pieczątki' : 'pieczątek'}, ${challengeDone} z ${CHALLENGES.length} wyzwań`}
          trailing={<ChevronRight size={18} />}
          onClick={onAchievements}
        />
        <ListItem
          icon={<Footprints />}
          leadTone="sky"
          title="Wyprawy i odkrycia"
          meta={
            journeys.length
              ? `${journeys.length} ${plWyprawy(journeys.length)} i mapa chmur`
              : 'Ślady wypraw i mapa chmur nad Krakowem'
          }
          trailing={<ChevronRight size={18} />}
          onClick={onJournal}
        />
      </List>

      <div className="prof-sep" aria-hidden="true" />
      <ListHead>Miejsca</ListHead>
      <List inset={false} className="prof-cells">
        <ListItem
          icon={<ListIcon />}
          leadTone="clay"
          title="Wszystkie parki"
          meta={`${FEATURE_COUNT} miejsc, ${golden} zdobytych`}
          trailing={<ChevronRight size={18} />}
          onClick={onAllParks}
        />
      </List>

      <div className="prof-sep" aria-hidden="true" />
      <ListHead>Ustawienia</ListHead>
      <List inset={false} className="prof-cells">
        <ListItem
          icon={<Palette />}
          leadTone="plum"
          title="Wygląd"
          meta="Motyw i styl mapy"
          trailing={<ChevronRight size={18} />}
          onClick={onLooks}
        />
        <ListItem
          icon={<Info />}
          title="O aplikacji"
          meta={`Wersja ${VERSION}, odświeżanie, katalog`}
          trailing={<ChevronRight size={18} />}
          onClick={onAbout}
        />
      </List>
    </Modal>
  )
}
