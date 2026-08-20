import { useEffect, useRef, useState } from 'react'
import { Mic, Trash2 } from 'lucide-react'
import { BottomSheet, Button } from '../ds'
import { addMark } from './photos'
import { WavePlayer } from './WavePlayer'

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
  /** live levels while recording, so the bars are your voice and not a loop */
  const [levels, setLevels] = useState<number[]>([])
  const audioCtx = useRef<AudioContext | null>(null)
  const raf = useRef(0)

  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setSeconds(Math.round((Date.now() - startedAt.current) / 1000)), 250)
    return () => clearInterval(t)
  }, [recording])

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current)
      void audioCtx.current?.close()
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

      // read the microphone in parallel, only to draw it
      const ctx = new AudioContext()
      audioCtx.current = ctx
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analyser)
      const buf = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteTimeDomainData(buf)
        let peak = 0
        for (let i = 0; i < buf.length; i += 4) {
          const v = Math.abs(buf[i] - 128) / 128
          if (v > peak) peak = v
        }
        setLevels((prev) => [...prev.slice(-43), Math.max(0.08, Math.min(1, peak * 2.2))])
        raf.current = requestAnimationFrame(tick)
      }
      raf.current = requestAnimationFrame(tick)
      chunks.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.current.push(e.data)
      }
      recorder.onstop = () => {
        cancelAnimationFrame(raf.current)
        void audioCtx.current?.close()
        audioCtx.current = null
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
            <WavePlayer src={review.url} blob={review.blob} />
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
            <span className="voice__kicker">nagraj wspomnienie</span>
            <p className="t-headline voice__ask">
              {recording ? 'Słucham…' : 'Co Ci teraz chodzi po głowie?'}
            </p>

            <div className="voice__wave" aria-hidden="true">
              {Array.from({ length: 44 }, (_, i) => {
                const v = levels[levels.length - 44 + i]
                return (
                  <span
                    key={i}
                    className={v != null ? 'is-live' : undefined}
                    style={{ height: `${Math.round((v ?? 0.06) * 100)}%` }}
                  />
                )
              })}
            </div>

            <span className="voice__clock">
              {String(Math.floor(seconds / 60)).padStart(2, '0')} : {String(seconds % 60).padStart(2, '0')}
            </span>

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
              <Mic size={30} />
            </button>
            <span className="t-caption voice__hold">
              {recording ? 'puść, żeby zakończyć' : 'przytrzymaj, żeby nagrać'}
            </span>
            {hint && <p className="t-caption voice__hint">{hint}</p>}
          </>
        )}
      </div>
    </BottomSheet>
  )
}
