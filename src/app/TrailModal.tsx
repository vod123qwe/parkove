import { Check, Footprints, Signpost } from 'lucide-react'
import { Modal, PlaceRow } from '../ds'
import { TileMap } from './TileMap'
import { COLOUR_PL, TRAIL_INK, trailsFor } from './data/trails'
import type { Trail } from './data/trails'
import { formatDistance } from './geo'
import { chooseTrail, useGameState } from './state'
import { plPunkty } from './naming'

/**
 * Wybór szlaku dla miejsca.
 *
 * Dwa rodzaje wariantów stoją tu obok siebie świadomie (decyzja Jarka
 * 2026-08-22: „jedno i drugie"). Szlak znakowany to prawda z terenu, więc
 * dostaje swój kolor i nazwę taką, jaką znajdziesz na drzewie. Trasa przez
 * punkty jest nasza: router pieszy układa kolejność punktów wyprawy i wraca
 * na parking.
 *
 * Warianty są gotowe, bez edycji. Wszystko policzone w scripts/build-trails.mjs
 * i zapisane w danych, bo w dolinie nie ma zasięgu, a router bez sieci nie
 * policzy nic.
 */

function pillsFor(t: Trail) {
  const out = [formatDistance(t.m), `${t.min} min`]
  if (t.kind === 'points' && t.stops?.length) out.push(`${t.stops.length} ${plPunkty(t.stops.length)}`)
  if (t.kind === 'osm') out.push('znakowany')
  return out
}

export function TrailModal({
  parkId,
  parkName,
  open,
  onClose,
}: {
  parkId: string
  parkName: string
  open: boolean
  onClose: () => void
}) {
  const state = useGameState()
  const trails = trailsFor(parkId)
  const chosenId = state.trails[parkId] ?? null

  return (
    <Modal open={open} onClose={onClose} title="Szlak" action="back" presentation="push">
      {/* wyjaśnienie raz, nad listą: w każdym kaflu były to same dwa zdania */}
      <p className="t-body-sm parking-lead">
        Warianty przejścia przez <strong>{parkName}</strong>. Pętle liczymy ścieżkami od
        sugerowanego parkingu, a szlaki znakowane bierzemy z terenu i przycinamy do granic miejsca.
        Wybrany rysuje się na mapie i zostaje na wyprawę, a dotknięcie go jeszcze raz zdejmuje.
      </p>
      <div className="app-placelist">
        {trails.map((t) => {
          const on = chosenId === t.id
          const ink = t.colour ? TRAIL_INK[t.colour] : undefined
          return (
            <PlaceRow
              key={t.id}
              icon={on ? <Check size={16} /> : t.kind === 'osm' ? <Signpost size={16} /> : <Footprints size={16} />}
              map={
                <TileMap
                  parkId={parkId}
                  line={t.line}
                  ink={ink}
                  height={148}
                  caption={
                    t.kind === 'osm'
                      ? `odcinek w granicach miejsca, ${formatDistance(t.m)}`
                      : `pętla od parkingu, ${formatDistance(t.m)}`
                  }
                />
              }
              title={t.name}
              pills={pillsFor(t)}
              note={t.kind === 'osm' ? t.note : 'Wraca w to samo miejsce, więc auto zostaje tam, gdzie stoi.'}
              selected={on}
              onClick={() => {
                chooseTrail(parkId, t.id)
                onClose()
              }}
            />
          )
        })}
      </div>
      {trails.some((t) => t.colour) && (
        <p className="t-caption park-credits">
          Kolory szlaków i ich przebieg z OpenStreetMap. W terenie szukaj znaku w kolorze:{' '}
          {[...new Set(trails.map((t) => t.colour).filter(Boolean))]
            .map((c) => COLOUR_PL[c as string])
            .join(', ')}
          .
        </p>
      )}
    </Modal>
  )
}
