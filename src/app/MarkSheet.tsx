import { useEffect, useRef, useState } from 'react'
import { Leaf, Move, Pencil, Trash2 } from 'lucide-react'
import { ActionBar, BottomSheet, Button, IconButton } from '../ds'
import { deleteMark, updateMark } from './photos'
import type { WalkMark } from './photos'
import { WavePlayer } from './WavePlayer'
import { identifyPlant, plantEnabled, plantLabel } from './plant'
import type { PlantAnswer } from './plant'

const fmtWhen = (at: number) =>
  new Date(at).toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

const TITLES: Record<WalkMark['kind'], string> = {
  photo: 'Zdjęcie z wyprawy',
  audio: 'Notatka głosowa',
  note: 'Notatka z wyprawy',
  car: 'Tu stoi auto',
}

/**
 * One thing you left on a walk. All three kinds share the same shape: the
 * thing itself, a line of your own words, and the three moves worth having in
 * the field. Non-modal, because moving a pin means tapping the map behind it.
 */
export function MarkSheet({
  mark,
  onClose,
  onMove,
}: {
  mark: WalkMark & { url?: string }
  onClose: () => void
  /** hands the map over: the next tap places the pin */
  onMove: () => void
}) {
  const [text, setText] = useState(mark.caption)
  const [editing, setEditing] = useState(mark.kind === 'note' ? !mark.caption : !mark.caption)

  // a sheet closed by dragging fires no blur, and a note is all text
  const latest = useRef(text)
  latest.current = text
  useEffect(
    () => () => {
      if (latest.current !== mark.caption) void updateMark(mark.id, { caption: latest.current.trim() })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mark.id],
  )

  const isNote = mark.kind === 'note'

  /*
   * Rozpoznawanie rośliny. Osobny stan, bo to zapytanie do sieci: w dolinie
   * często nie wyjdzie i trzeba to powiedzieć wprost, a nie kręcić kółkiem.
   */
  const [plant, setPlant] = useState<PlantAnswer | null>(null)
  const [asking, setAsking] = useState(false)
  const canAsk = mark.kind === 'photo' && !!mark.blob && plantEnabled()

  const ask = async () => {
    if (!mark.blob) return
    setAsking(true)
    setPlant(null)
    setPlant(await identifyPlant(mark.blob))
    setAsking(false)
  }

  return (
    <BottomSheet open modal={false} onClose={onClose} title={TITLES[mark.kind]}>
      <div className="marksheet">
        <div className="marksheet__quick">
          <Button variant="tonal" size="md" icon={<Move size={16} />} onClick={onMove}>
            Przesuń pin
          </Button>
        </div>

        {mark.kind === 'photo' && mark.url && (
          <img className="marksheet__img" src={mark.url} alt={text || 'Zdjęcie z wyprawy'} />
        )}
        {mark.kind === 'audio' && mark.url && (
          <WavePlayer src={mark.url} blob={mark.blob} />
        )}

        <p className="t-caption marksheet__when">{fmtWhen(mark.at)}</p>

        {canAsk && (
          <div className="marksheet__plant">
            <Button
              variant="tonal"
              size="md"
              icon={<Leaf size={16} />}
              onClick={() => void ask()}
              disabled={asking}
            >
              {asking ? 'Pytam o roślinę…' : 'Co to za roślina?'}
            </Button>
            {plant && plant.guesses.length > 0 && (
              <ul className="marksheet__guesses">
                {plant.guesses.map((g) => (
                  <li key={g.latin}>
                    <button className="marksheet__guess" onClick={() => setText(plantLabel(g))}>
                      <span className="t-body-sm marksheet__guessname">{plantLabel(g)}</span>
                      <span className="t-caption marksheet__guessscore">
                        {Math.round(g.score * 100)}%
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {plant && (plant.note || !plant.guesses.length) && (
              <p className="t-caption marksheet__plantnote">
                {plant.note ?? 'Nie rozpoznałem, spróbuj z bliska liścia albo kwiatu'}
              </p>
            )}
            {plant && plant.left != null && plant.guesses.length > 0 && (
              <p className="t-caption marksheet__plantnote">
                Dotknij, żeby wstawić jako podpis. Zostało dziś {plant.left} pytań.
              </p>
            )}
          </div>
        )}

        {editing ? (
          isNote ? (
            <textarea
              className="marksheet__notefield"
              value={text}
              rows={4}
              autoFocus
              placeholder="Co tu się stało?"
              onChange={(e) => setText(e.target.value)}
              onBlur={() => setEditing(false)}
            />
          ) : (
            <input
              className="marksheet__input"
              value={text}
              autoFocus
              placeholder="Podpis"
              onChange={(e) => setText(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
              }}
            />
          )
        ) : (
          <button
            className={isNote ? 'marksheet__note' : 'marksheet__caption'}
            onClick={() => setEditing(true)}
          >
            {text || (isNote ? 'Napisz notatkę' : 'Dodaj podpis')}
            <Pencil size={14} />
          </button>
        )}

        <ActionBar>
          <Button size="lg" onClick={onClose}>
            Zamknij
          </Button>
          <IconButton
            aria-label="Usuń"
            variant="tonal"
            className="marksheet__delete"
            onClick={() => {
              void deleteMark(mark.id)
              onClose()
            }}
          >
            <Trash2 size={18} />
          </IconButton>
        </ActionBar>
      </div>
    </BottomSheet>
  )
}
