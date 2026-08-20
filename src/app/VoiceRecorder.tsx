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
 * Hold the button, talk, let go, hear it back. Nothing is saved until you say
 * so, because a walk is full of accidental presses and half sentences.
 */
export function VoiceRecorder({
  parkId,
  journeyId,
  coords,
  onSaved,
  onClose,
}: {
  parkId: string
  journeyId?: string
  coords?: [number, number]
  onSaved?: (id: string) => void
  onClose: () => void
}) {
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [hint, setHint] = useState<string | null>(null)
  const [review, setReview] = useState<{ blob: Blob; url: string; ms: number } | null>(null)
  const rec = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const startedAt = useRef(0)

  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setSeconds(Math.round((Date.now() - startedAt.current) / 1000)), 250)
    return () => clearInterval(t)
  }, [recording])

  useEffect(
    () => () => {
      rec.current?.stream.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  const start = async () => {
    if (recording || review) return
    setHint(null)
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
          setHint('Za krótko. Przytrzymaj przycisk i mów.')
          return
        }
        setReview({ blob, url: URL.createObjectURL(blob), ms })
      }
      startedAt.current = Date.now()
      setSeconds(0)
      recorder.start()
      rec.current = recorder
      setRecording(true)
      navigator.vibrate?.(20)
    } catch {
      setHint('Brak dostępu do mikrofonu. Sprawdź uprawnienia w ustawieniach.')
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
    <BottomSheet open onClose={onClose} title="Notatka głosowa">
      <div className="voice">
        {review ? (
          <>
            <p className="t-body voice__lead">
              {Math.round(review.ms / 1000)} sekund. Przesłuchaj i zdecyduj, czy zostaje na mapie.
            </p>
            <audio className="marksheet__audio" src={review.url} controls autoPlay />
            <div className="voice__actions">
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
                  onClose()
                  onSaved?.(saved.id)
                }}
              >
                Zostaw tutaj
              </Button>
              <Button full variant="ghost" icon={<Trash2 size={18} />} onClick={discard}>
                Nagraj jeszcze raz
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="t-body voice__lead">
              {recording
                ? `Nagrywam… ${seconds} s. Puść, kiedy skończysz.`
                : 'Przytrzymaj przycisk i mów. Nagranie zostanie tam, gdzie teraz stoisz.'}
            </p>
            <button
              className={`voice__mic${recording ? ' -recording' : ''}`}
              aria-label="Przytrzymaj, żeby nagrać"
              onPointerDown={(e) => {
                e.preventDefault()
                void start()
              }}
              onPointerUp={stop}
              onPointerCancel={stop}
              onPointerLeave={stop}
            >
              <Mic size={34} />
            </button>
            {hint && <p className="t-caption voice__hint">{hint}</p>}
          </>
        )}
      </div>
    </BottomSheet>
  )
}
