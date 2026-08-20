import { useEffect, useRef, useState } from 'react'
import { Mic, Move, StickyNote, Trash2, X } from 'lucide-react'
import { deleteMark, updateMark } from './photos'
import { noteType } from './memory'
import { WavePlayer } from './WavePlayer'
import type { WalkMark } from './photos'

const fmtWhen = (at: number) =>
  new Date(at).toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * Everything a walk left behind, one thing per slide, over a dimmed and
 * blurred version of the screen it came from. Swipe to move between them,
 * because that is how you go through a stack of pictures: one after another,
 * not by returning to a list each time.
 */
export function MemoryViewer({
  marks,
  startId,
  onClose,
  onMove,
}: {
  marks: Array<WalkMark & { url?: string }>
  startId: string
  onClose: () => void
  /** hands the map over so the pin can be dropped somewhere else; without it
   * the viewer is read only, which is what a replay wants */
  onMove?: (markId: string) => void
}) {
  const rail = useRef<HTMLDivElement>(null)
  const startIndex = Math.max(
    0,
    marks.findIndex((m) => m.id === startId),
  )
  const [index, setIndex] = useState(startIndex)
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  // open on the slide that was tapped, without animating there
  useEffect(() => {
    const el = rail.current
    if (!el) return
    el.scrollTo({ left: startIndex * el.clientWidth, behavior: 'instant' as ScrollBehavior })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const current = marks[Math.min(index, marks.length - 1)]
  if (!current) return null

  const commit = (id: string) => {
    setEditing(null)
    if (draft.trim() !== (marks.find((m) => m.id === id)?.caption ?? '')) {
      void updateMark(id, { caption: draft.trim() })
    }
  }

  return (
    <div className="memview">
      <div className="memview__top">
        <button className="memview__close" aria-label="Zamknij" onClick={onClose}>
          <X size={20} />
        </button>
        <span className="t-caption memview__count">
          {index + 1} z {marks.length}
        </span>
      </div>

      <div
        className="memview__rail"
        ref={rail}
        onScroll={(e) => {
          const el = e.currentTarget
          const next = Math.round(el.scrollLeft / el.clientWidth)
          if (next !== index) setIndex(next)
        }}
      >
        {marks.map((m) => (
          <section className="memview__slide" key={m.id}>
            {m.kind === 'photo' && m.url && (
              <img className="memview__photo" src={m.url} alt={m.caption || 'Zdjęcie z wyprawy'} />
            )}
            {m.kind === 'audio' && m.url && (
              <div className="memview__audio">
                <span className="memview__kind">
                  <Mic size={16} /> Notatka głosowa
                </span>
                <WavePlayer src={m.url} blob={m.blob} />
              </div>
            )}
            {m.kind === 'note' && (
              <div className="memview__note">
                <span className="memview__kind">
                  <StickyNote size={16} /> Notatka
                </span>
                {editing === m.id ? (
                  <textarea
                    className="memview__notefield"
                    value={draft}
                    autoFocus
                    rows={6}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => commit(m.id)}
                  />
                ) : (
                  <button
                    className="memview__notetext"
                    style={noteType(m.caption || 'Napisz notatkę', 30, 16)}
                    onClick={() => {
                      setDraft(m.caption)
                      setEditing(m.id)
                    }}
                  >
                    {m.caption || 'Napisz notatkę'}
                  </button>
                )}
              </div>
            )}

            {m.kind !== 'note' && (
              <div className="memview__caption">
                {editing === m.id ? (
                  <input
                    className="memview__capfield"
                    value={draft}
                    autoFocus
                    placeholder="Podpis"
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => commit(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    }}
                  />
                ) : (
                  <button
                    className="memview__captext"
                    onClick={() => {
                      setDraft(m.caption)
                      setEditing(m.id)
                    }}
                  >
                    {m.caption || 'Dodaj podpis'}
                  </button>
                )}
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="memview__foot">
        <span className="t-caption memview__when">{fmtWhen(current.at)}</span>
        <div className="memview__actions">
          {onMove && (
            <button className="memview__action" onClick={() => onMove(current.id)}>
              <Move size={17} /> Przesuń pin
            </button>
          )}
          <button
            className="memview__action"
            onClick={() => {
              const gone = current.id
              const next = marks.length > 1 ? Math.max(0, index - 1) : 0
              setIndex(next)
              void deleteMark(gone)
              if (marks.length <= 1) onClose()
            }}
          >
            <Trash2 size={17} /> Usuń
          </button>
        </div>
      </div>
    </div>
  )
}
