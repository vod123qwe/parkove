import { useState } from 'react'
import { Move, Pencil, Trash2 } from 'lucide-react'
import { BottomSheet, Button } from '../ds'
import { deletePhoto, updatePhoto } from './photos'
import type { WalkPhoto } from './photos'

const fmtWhen = (at: number) =>
  new Date(at).toLocaleString('pl-PL', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * One walk photo: the picture, its caption, and the three things worth doing
 * to it in the field. Non-modal, because moving a pin means tapping the map
 * behind this sheet.
 */
export function PhotoSheet({
  photo,
  onClose,
  onMove,
}: {
  photo: WalkPhoto & { url: string }
  onClose: () => void
  /** hands the map over: the next tap places the pin */
  onMove: () => void
}) {
  const [caption, setCaption] = useState(photo.caption)
  const [editing, setEditing] = useState(!photo.caption)

  return (
    <BottomSheet open modal={false} onClose={onClose} title="Zdjęcie z wyprawy">
      <div className="photosheet">
        <img className="photosheet__img" src={photo.url} alt={caption || 'Zdjęcie z wyprawy'} />
        <p className="t-caption photosheet__when">{fmtWhen(photo.at)}</p>

        {editing ? (
          <input
            className="photosheet__input"
            value={caption}
            autoFocus
            placeholder="Co tu było?"
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => {
              setEditing(false)
              if (caption !== photo.caption) void updatePhoto(photo.id, { caption: caption.trim() })
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
          />
        ) : (
          <button className="photosheet__caption" onClick={() => setEditing(true)}>
            {caption || 'Dodaj podpis'}
            <Pencil size={14} />
          </button>
        )}

        <div className="photosheet__actions">
          <Button variant="tonal" icon={<Move size={18} />} onClick={onMove}>
            Przesuń pin
          </Button>
          <Button
            variant="ghost"
            icon={<Trash2 size={18} />}
            onClick={() => {
              void deletePhoto(photo.id)
              onClose()
            }}
          >
            Usuń
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
