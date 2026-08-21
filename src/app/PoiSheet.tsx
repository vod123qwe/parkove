import { BookOpen, Lock, MapPin, Sparkles } from 'lucide-react'
import { Collapsible, Modal } from '../ds'
import { Dilemma } from './Dilemma'
import type { QuestPoi } from './data/quests'
import { asset } from './assets'

/** full-screen point card: photos and the whole story, readable anytime */
export function PoiModal({
  poi,
  parkId,
  collected,
  onClose,
}: {
  poi: QuestPoi | null
  parkId: string | null
  collected: boolean
  onClose: () => void
}) {
  return (
    <Modal open={poi != null} onClose={onClose} title={poi?.name} action="back" presentation="push">
      {poi && (
        <>
          {poi.photo && (
            <figure className="poi-photo">
              <img src={asset(poi.photo)} alt={poi.name} loading="lazy" />
              {poi.photoCredit && <figcaption className="t-caption">{poi.photoCredit}</figcaption>}
            </figure>
          )}
          {poi.description.map((p, i) => (
            <p key={i} className="t-body poi-para">
              {p}
            </p>
          ))}
          {/* rozwinięcie tylko tam, gdzie historia na to zasługuje: krótka wersja
              zostaje domyślna, żeby czytanie nie zastąpiło chodzenia */}
          {poi.long && poi.long.length > 0 && (
            <div className="poi-long">
              <Collapsible lines={0} moreLabel="Czytaj dalej" lessLabel="Zwiń">
                {poi.long.map((p, i) => (
                  <p key={i} className="t-body poi-para">
                    {p}
                  </p>
                ))}
              </Collapsible>
            </div>
          )}
          {/* podanie pod własnym nagłówkiem i innym krojem: fakt to fakt, legenda to legenda */}
          {poi.legend && poi.legend.length > 0 && (
            <section className="poi-legend">
              <p className="t-label poi-legend__label">
                <BookOpen size={14} /> Legenda
              </p>
              {poi.legend.map((p, i) => (
                <p key={i} className="poi-legend__text">
                  {p}
                </p>
              ))}
            </section>
          )}
          {poi.findHint && (
            <div className="poi-hint">
              <MapPin size={16} />
              <div>
                <p className="t-label poi-hint__label">Jak trafić</p>
                <p className="t-body-sm poi-hint__text">{poi.findHint}</p>
              </div>
            </div>
          )}
          {collected ? (
            <>
              <div className="poi-reveal -open">
                <p className="t-label poi-reveal__label">
                  <Sparkles size={14} /> Odkryte na miejscu
                </p>
                <p className="t-body-sm poi-reveal__text">{poi.reveal}</p>
              </div>
              {poi.dilemma && parkId && (
                <Dilemma parkId={parkId} poiId={poi.id} dilemma={poi.dilemma} />
              )}
            </>
          ) : (
            <div className="poi-reveal -locked">
              <p className="t-label poi-reveal__label">
                <Lock size={14} /> Na miejscu czeka jeszcze jedna historia
              </p>
              <p className="t-body-sm poi-reveal__text">
                Dojdź do tego punktu podczas wyprawy, a apka opowie Ci coś, czego tu nie przeczytasz.
              </p>
            </div>
          )}
          {poi.sources && poi.sources.length > 0 && (
            <p className="t-caption poi-sources">
              Źródła:{' '}
              {poi.sources.map((s, i) => (
                <a key={s} href={s} target="_blank" rel="noreferrer">
                  {new URL(s).hostname.replace('www.', '')}
                  {i < poi.sources!.length - 1 ? ', ' : ''}
                </a>
              ))}
            </p>
          )}
        </>
      )}
    </Modal>
  )
}
