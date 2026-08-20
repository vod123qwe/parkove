import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Mic, Plus, Square, StickyNote, X } from 'lucide-react'
import { Button, Card } from '../ds'
import { useGameState } from './state'
import { PhotoButton } from './PhotoButton'
import { VoiceRecorder } from './VoiceRecorder'
import { addMark } from './photos'

function fmtTime(ms: number) {
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${m} min`
}

/**
 * The action row of a walk. Progress and the next point live in the top status
 * card, so this one only carries what the thumb needs: one plus that opens the
 * three ways of leaving something behind, the effort so far, and the way out.
 */
export function ExpeditionBar({
  onRequestStop,
  onPhoto,
  onMark,
}: {
  /** ending is irreversible, so the bar only asks for it */
  onRequestStop: () => void
  /** a picture only gets a notice: writing can wait */
  onPhoto?: (markId: string) => void
  /** a note or a recording opens right away, because it needs words */
  onMark?: (markId: string) => void
}) {
  const { expedition } = useGameState()
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [, tick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 10000)
    return () => clearInterval(t)
  }, [])

  // the stack sinks back one by one, so it has to outlive the click that closed it
  const shut = () => {
    setClosing(true)
    window.setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, 280)
  }

  if (!expedition) return null
  const km = (expedition.distanceM / 1000).toFixed(1).replace('.', ',')
  const here = expedition.where?.coords ?? expedition.track[expedition.track.length - 1]

  return (
    <>
      {/* a tap anywhere else closes the menu instead of poking the map */}
      {open && !closing && (
        <button className="app-addmenu__catch" aria-label="Zamknij menu" onClick={shut} />
      )}

      {open && (
        <div className={`app-addmenu${closing ? ' -out' : ''}`}>
          <PhotoButton
            parkId={expedition.parkId}
            journeyId={expedition.id}
            coords={here}
            label="Dodaj zdjęcie"
            full={false}
            className="app-addmenu__item"
            style={{ '--rise': 2, '--sink': 0 } as CSSProperties}
            onSaved={(id) => {
              shut()
              onPhoto?.(id)
            }}
          />
          <Button
            className="app-addmenu__item"
            style={{ '--rise': 1, '--sink': 1 } as CSSProperties}
            icon={<Mic size={18} />}
            onClick={() => {
              shut()
              setRecording(true)
            }}
          >
            Dodaj nagranie
          </Button>
          <Button
            className="app-addmenu__item"
            style={{ '--rise': 0, '--sink': 2 } as CSSProperties}
            icon={<StickyNote size={18} />}
            onClick={async () => {
              shut()
              const saved = await addMark({
                kind: 'note',
                parkId: expedition.parkId,
                journeyId: expedition.id,
                coords: here,
                caption: '',
              })
              onMark?.(saved.id)
            }}
          >
            Dodaj notatkę
          </Button>
        </div>
      )}

      {recording && (
        <VoiceRecorder
          parkId={expedition.parkId}
          journeyId={expedition.id}
          coords={here}
          onClose={() => setRecording(false)}
          onSaved={onMark}
        />
      )}

      <div className="app-expbar">
        <Card className="app-expbar__card">
          <button
            className={`app-addbtn${open ? ' -open' : ''}`}
            aria-label={open ? 'Zamknij' : 'Dodaj zdjęcie, nagranie albo notatkę'}
            aria-expanded={open}
            onClick={() => (open ? shut() : setOpen(true))}
          >
            {open ? <X size={20} /> : <Plus size={22} />}
          </button>
          <span className="t-caption app-expbar__meta">
            {fmtTime(Date.now() - expedition.startedAt)} · {km} km
          </span>
          <button className="app-expbar__stop" aria-label="Zakończ wyprawę" onClick={onRequestStop}>
            <Square size={16} />
            Koniec
          </button>
        </Card>
      </div>
    </>
  )
}
