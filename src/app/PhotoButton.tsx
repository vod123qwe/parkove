import { useRef, useState } from 'react'
import { Camera } from 'lucide-react'
import { Button } from '../ds'
import { addPhoto } from './photos'

/**
 * Takes a photo during a walk and files it under the park (and point).
 * The caption is optional: an empty note still gives a dated picture.
 */
export function PhotoButton({
  parkId,
  poiId,
  journeyId,
  coords,
  defaultCaption,
  label = 'Dodaj zdjęcie',
  full = true,
  variant = 'tonal',
  className,
}: {
  parkId: string
  poiId?: string
  /** the walk this picture belongs to, so it shows up on that route */
  journeyId?: string
  /** where the phone was standing: the photo becomes a pin there */
  coords?: [number, number]
  defaultCaption?: string
  label?: string
  full?: boolean
  variant?: 'primary' | 'tonal' | 'ghost'
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    const note = window.prompt('Podpis pod zdjęciem (możesz zostawić puste)', defaultCaption ?? '')
    await addPhoto({ parkId, blob: file, caption: (note ?? '').trim(), poiId, journeyId, coords })
    setBusy(false)
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
