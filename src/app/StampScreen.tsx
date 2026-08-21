import { Award, Camera, Footprints, MapPin, Trees } from 'lucide-react'
import { Button, Modal, Polaroid, Stamp, Stat, StatGrid } from '../ds'
import { useGameState } from './state'
import { questForPark } from './data/quests'
import { isParkComplete, stampNeed } from './progress'
import { useMarks } from './photos'
import type { ParkFeature } from './ParkSheet'

const fmtDate = (at: string) =>
  new Date(at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })

/**
 * One sticker, up close: where it comes from, when you first stood there and
 * what you brought back. A stamp is the app's souvenir, so tapping it should
 * lead somewhere rather than just sit in a grid.
 */
export function StampScreen({
  park,
  onGoToPark,
  onClose,
}: {
  park: ParkFeature
  onGoToPark: (parkId: string) => void
  onClose: () => void
}) {
  const { parks: progress } = useGameState()
  const mine = progress[park.id]
  const quest = questForPark(park.id)
  const collected = new Set(mine?.points ?? [])
  const complete = isParkComplete(park.id, progress)
  const photos = useMarks().filter((m) => m.parkId === park.id && m.kind === 'photo' && m.url)
  const need = stampNeed(park.id)
  const left = Math.max(0, need - collected.size)
  const extra = quest ? Math.max(0, quest.pois.length - need) : 0
  const plPoints = (n: number) =>
    n === 1 ? 'punkt' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'punkty' : 'punktów'
  const ruleText = !quest
    ? complete
      ? 'Za bycie na miejscu. Zameldowałeś się i pieczątka jest Twoja.'
      : 'Za bycie na miejscu: wejdź do parku i zamelduj się w aplikacji.'
    : complete
      ? `Za ${need} ${plPoints(need)} wyprawy. Zebrane, więc pieczątka jest Twoja.`
      : `Za ${need} ${plPoints(need)} wyprawy. Masz ${collected.size}, brakuje ${left}.`

  return (
    <Modal open onClose={onClose} title="Pieczątka" action="back" presentation="push">
      <div className="stampscreen">
        <div className="stampscreen__art">
          <Stamp
            parkId={park.id}
            name={park.properties.name}
            earned={complete}
            size="xl"
            fallback={<Trees />}
          />
        </div>

        <h2 className="t-headline stampscreen__name">{park.properties.name}</h2>
        <p className="t-body-sm park-muted stampscreen__meta">
          {complete ? 'Zdobyta' : 'Jeszcze zablokowana'}
          {mine ? ` · pierwszy raz ${fmtDate(mine.firstAt)}` : ''}
        </p>

        <StatGrid cols={3} className="stampscreen__stats">
          <Stat icon={<MapPin />} value={`${collected.size}/${quest?.pois.length ?? 1}`} label="punkty" />
          <Stat icon={<Footprints />} value={String(mine?.visits ?? 0)} label="wizyty" />
          <Stat icon={<Camera />} value={String(photos.length)} label="zdjęcia" />
        </StatGrid>

        {/*
          Za co jest ta pieczątka. Wcześniej ekran mówił tylko „brakuje X z Y punktów"
          i liczył wszystkie punkty, co przy miejscach z prógiem (`stampAt`) było
          po prostu nieprawdą. Teraz reguła jest wypisana wprost, a nadwyżka punktów
          nazwana tym, czym jest: ciekawostkami do zebrania kiedy indziej.
        */}
        <section className="stampscreen__rule">
          <p className="t-label stampscreen__rule-label">
            <Award size={14} /> Za co jest
          </p>
          <p className="t-body stampscreen__rule-text">{ruleText}</p>
          {extra > 0 && (
            <p className="t-body-sm park-muted stampscreen__rule-extra">
              Pozostałe {extra} {plPoints(extra)} tego miejsca to ciekawostki: możesz je zebrać
              kiedy indziej, pieczątka na nie nie czeka.
            </p>
          )}
        </section>

        {photos.length > 0 && (
          <>
            <h3 className="t-title stampscreen__section">Zdjęcia z tego miejsca</h3>
            <div className="stampscreen__photos">
              {photos.map((ph, i) => (
                <Polaroid
                  key={ph.id}
                  src={ph.url!}
                  caption={ph.caption || undefined}
                  tilt={i % 2 ? 1.5 : -1.5}
                />
              ))}
            </div>
          </>
        )}

        <div className="stampscreen__actions">
          <Button full size="lg" icon={<MapPin size={18} />} onClick={() => onGoToPark(park.id)}>
            Pokaż na mapie
          </Button>
        </div>
      </div>
    </Modal>
  )
}
