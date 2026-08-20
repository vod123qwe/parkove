import { useEffect, useRef, useState } from 'react'
import { Mic, Trash2 } from 'lucide-react'
import { BottomSheet, Button } from '../ds'
import { addMark } from './photos'

/** below this a press was a tap, not a recording */
const MIN_MS = 600

function pickMime() {
  const wanted = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']
  for (const type of wanted) if (MediaRecorder.isTypeSupported?.(type)) return type
  return ''
}

/**
 * Hold to record, release to hear it back. Nothing is saved until you say so,
 * because a walk is full of accidental presses and half sentences.
 */
export function VoiceButton({
  parkId,
  journeyId,
  coords,
  onSaved,
  onHint,
}: {
  parkId: string
  journeyId?: string
  coords?: [number, number]
  onSaved?: (id: string) => void
  /** something to say when the press was too short or the mic was refused */
  onHint?: (message: string) => void
}) {
  const [recording, setRecording] = useState(false)
  const [review, setReview] = useState<{ blob: Blob; url: string; ms: number } | null>(null)
  const rec = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const startedAt = useRef(0)
  const hintRef = useRef(onHint)
  hintRef.current = onHint

  useEffect(
    () => () => {
      rec.current?.stream.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  const start = async () => {
    if (recording || review) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = pickMime()
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
      chunks.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const ms = Date.now() - startedAt.current
        const blob = new Blob(chunks.current, { type: mime || 'audio/webm' })
        if (ms < MIN_MS || blob.size === 0) {
          hintRef.current?.('Przytrzymaj przycisk, żeby nagrać')
          return
        }
        setReview({ blob, url: URL.createObjectURL(blob), ms })
      }
      startedAt.current = Date.now()
      recorder.start()
      rec.current = recorder
      setRecording(true)
      navigator.vibrate?.(20)
    } catch {
      hintRef.current?.('Brak dostępu do mikrofonu')
    }
  }

  const stop = () => {
    if (!recording) return
    setRecording(false)
    try {
      rec.current?.stop()
    } catch {
      // already stopped: nothing to do
    }
  }

  const discard = () => {
    if (review) URL.revokeObjectURL(review.url)
    setReview(null)
  }

  return (
    <>
      <button
        className={`app-voicebtn${recording ? ' -recording' : ''}`}
        aria-label={recording ? 'Nagrywam, puść żeby zakończyć' : 'Przytrzymaj, żeby nagrać notatkę'}
        onPointerDown={(e) => {
          e.preventDefault()
          void start()
        }}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={stop}
      >
        <Mic size={20} />
      </button>

      {review && (
        <BottomSheet open onClose={discard} title="Nagranie">
          <div className="voicereview">
            <p className="t-body voicereview__lead">
              {Math.round(review.ms / 1000)} sekund. Przesłuchaj i zdecyduj, czy zostaje na mapie.
            </p>
            <audio className="marksheet__audio" src={review.url} controls autoPlay />
            <div className="voicereview__actions">
              <Button
                full
                size="lg"
                onClick={async () => {
                  const saved = await addMark({
                    kind: 'audio',
                    parkId,
                    journeyId,
                    coords,
                    caption: '',
                    blob: review.blob,
                  })
                  discard()
                  onSaved?.(saved.id)
                }}
              >
                Zostaw tutaj
              </Button>
              <Button full variant="ghost" icon={<Trash2 size={18} />} onClick={discard}>
                Odrzuć
              </Button>
            </div>
          </div>
        </BottomSheet>
      )}
    </>
  )
}
