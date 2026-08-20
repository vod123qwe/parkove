import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Camera } from 'lucide-react'
import { Button } from '../ds'
import { addPhoto } from './photos'

/**
 * Takes a photo and files it under the park (and point, and walk). It never
 * stops to ask for a caption: a blocking dialog in the middle of a walk is
 * both slow and, in an installed app, a good way to freeze the screen. The
 * caption is written afterwards in the photo sheet.
 */
export function PhotoButton({
  parkId,
  poiId,
  journeyId,
  coords,
  onSaved,
  label = 'Dodaj zdjęcie',
  full = true,
  variant = 'primary',
  className,
  style,
}: {
  parkId: string
  poiId?: string
  /** the walk this picture belongs to, so it shows up on that route */
  journeyId?: string
  /** where the phone was standing: the photo becomes a pin there */
  coords?: [number, number]
  onSaved?: (id: string) => void
  label?: string
  full?: boolean
  variant?: 'primary' | 'tonal' | 'ghost'
  className?: string
  style?: CSSProperties
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const saved = await addPhoto({ parkId, blob: file, caption: '', poiId, journeyId, coords })
      onSaved?.(saved.id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button
        full={full}
        variant={variant}
        icon={<Camera size={18} />}
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={className}
        style={style}
      >
        {busy ? 'Zapisuję…' : label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={onPick}
      />
    </>
  )
}
