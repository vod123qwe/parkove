import { BookOpen, Lock, MapPin, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Modal, Segmented } from '../ds'
import { Dilemma } from './Dilemma'
import { AskBox } from './AskBox'
import type { QuestPoi } from './data/quests'
import { asset } from './assets'

const MODE_KEY = 'pk-story-mode'

/** nazwa hosta, gdy źródło jest adresem; null, gdy to zwykły opis */
function urlHost(s: string) {
  try {
    return new URL(s).hostname.replace('www.', '')
  } catch {
    return null
  }
}

/** full-screen point card: photos and the whole story, readable anytime */
export function PoiModal({
  poi,
  parkId,
  collected,
  onClose,
  onAskGuide,
}: {
  poi: QuestPoi | null
  parkId: string | null
  collected: boolean
  onClose: () => void
  /** otwiera przewodnika z kontekstem tego punktu */
  onAskGuide?: (poi: QuestPoi) => void
}) {
  /* nawyk czytania trzymamy w pamięci przeglądarki: kto raz wybrał całość, dostaje
     całość przy następnym punkcie, bez klikania za każdym razem */
  const [mode, setModeState] = useState<'short' | 'long'>(
    () => (localStorage.getItem(MODE_KEY) === 'long' ? 'long' : 'short'),
  )
  const setMode = (m: 'short' | 'long') => {
    setModeState(m)
    localStorage.setItem(MODE_KEY, m)
  }
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
          {/*
            Przełącznik u góry, nie przycisk na końcu, i to jest różnica jakościowa:
            na dole dowiadujesz się, że jest więcej, dopiero gdy skończysz czytać.
            U góry wybierasz, JAK teraz czytasz: krótko w terenie, całość przy planowaniu.
            Wybór zapamiętany, bo to nawyk, nie decyzja na jeden punkt.
          */}
          {poi.long && poi.long.length > 0 && (
            <Segmented
              className="poi-mode"
              aria-label="Ile opowieści"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'short', label: 'Krótko' },
                { value: 'long', label: 'Cała historia' },
              ]}
            />
          )}
          {poi.description.map((p, i) => (
            <p key={i} className="t-body poi-para">
              {p}
            </p>
          ))}
          {poi.long && mode === 'long' && (
            <div className="poi-long">
              {poi.long.map((p, i) => (
                <p key={i} className="t-body poi-para">
                  {p}
                </p>
              ))}
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
          {/*
            Pytanie na końcu, po całej sprawdzonej treści i po dylemacie: dopiero
            wtedy wiesz, czego jeszcze nie wiesz. Wcześniej rozpraszałoby czytanie.
          */}
          {onAskGuide && <AskBox pointName={poi.name} onAsk={() => onAskGuide(poi)} />}

          {poi.sources && poi.sources.length > 0 && (
            <p className="t-caption poi-sources">
              Źródła:{' '}
              {poi.sources.map((s, i) => {
                const sep = i < poi.sources!.length - 1 ? ', ' : ''
                /*
                 * Źródło nie musi być linkiem. Część punktów opisuje, skąd wzięte
                 * są liczby („OpenStreetMap: Wielka Turnia, 45 m, 55 dróg"), a
                 * new URL() na takim tekście rzuca wyjątkiem i zabierał całą kartę.
                 */
                const host = urlHost(s)
                return host ? (
                  <a key={s} href={s} target="_blank" rel="noreferrer">
                    {host}
                    {sep}
                  </a>
                ) : (
                  <span key={s}>
                    {s}
                    {sep}
                  </span>
                )
              })}
            </p>
          )}
        </>
      )}
    </Modal>
  )
}
