import { useEffect, useRef, useState } from 'react'
import { Check, Leaf, RotateCcw, X } from 'lucide-react'
import { identifyPlant, plantLabel } from './plant'
import type { PlantAnswer } from './plant'

/**
 * Sprawdzanie rośliny na pełnym ekranie.
 *
 * Przepływ zamówiony przez Jarka: kamera na cały ekran, spust jak w iOS, po
 * zdjęciu spust zamienia się w zielony ptaszek, dotknięcie ptaszka robi z niego
 * loader i wysyła zdjęcie, a odpowiedź pojawia się **w tym samym miejscu**, na
 * lekko rozmytym i przyciemnionym tle u dołu. Do tego dwie drogi wyjścia: zrób
 * zdjęcie jeszcze raz albo zamknij wszystko.
 *
 * Dlaczego własna kamera, a nie zwykły input z plikiem: input otwiera systemowy
 * aparat, wraca do aplikacji i traci ciągłość. Tu jedno okno prowadzi cię od
 * liścia do nazwy bez wychodzenia. Gdy przeglądarka nie da dostępu do kamery,
 * spadamy na input z plikiem, bo lepszy systemowy aparat niż nic.
 */

type Stage = 'live' | 'shot' | 'checking' | 'done'

export function PlantCamera({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  /** zapis zdjęcia w wyprawie z podpisem; brak = nie ma gdzie zapisać */
  onSave?: (blob: Blob, caption: string) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [stage, setStage] = useState<Stage>('live')
  const [shot, setShot] = useState<{ blob: Blob; url: string } | null>(null)
  const [answer, setAnswer] = useState<PlantAnswer | null>(null)
  const [camError, setCamError] = useState<string | null>(null)

  /* kamera żyje tylko tak długo, jak okno: inaczej dioda zostaje zapalona */
  useEffect(() => {
    if (!open) return
    let dead = false
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        })
        if (dead) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch {
        setCamError('Nie mam dostępu do kamery')
      }
    }
    void start()
    return () => {
      dead = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [open])

  /* adres podglądu zwalniamy ręcznie, inaczej zostaje w pamięci po każdym zdjęciu */
  useEffect(() => () => { if (shot) URL.revokeObjectURL(shot.url) }, [shot])

  if (!open) return null

  const reset = () => {
    if (shot) URL.revokeObjectURL(shot.url)
    setShot(null)
    setAnswer(null)
    setStage('live')
  }

  const close = () => {
    reset()
    onClose()
  }

  const capture = async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob((b) => res(b), 'image/jpeg', 0.92),
    )
    if (!blob) return
    setShot({ blob, url: URL.createObjectURL(blob) })
    setStage('shot')
  }

  const check = async () => {
    if (!shot) return
    setStage('checking')
    const res = await identifyPlant(shot.blob)
    setAnswer(res)
    setStage('done')
  }

  /* awaryjnie: systemowy aparat przez zwykły input */
  const fromFile = async (file: File | undefined) => {
    if (!file) return
    const blob = file.slice(0, file.size, file.type)
    setShot({ blob, url: URL.createObjectURL(blob) })
    setStage('shot')
  }

  const best = answer?.guesses[0]

  return (
    <div className="plantcam" role="dialog" aria-label="Sprawdź roślinę">
      {/* podgląd kamery albo zamrożone zdjęcie: jedno miejsce, dwa stany */}
      {stage === 'live' ? (
        <video ref={videoRef} className="plantcam__view" playsInline muted autoPlay />
      ) : (
        shot && <img className="plantcam__view" src={shot.url} alt="Zrobione zdjęcie" />
      )}

      <button className="plantcam__close" onClick={close} aria-label="Zamknij">
        <X size={22} />
      </button>

      {/*
        Komunikat o kamerze tylko dopóki nie ma zdjęcia. Bez tego po wybraniu
        pliku z systemowego aparatu zostawał na ekranie, a spust był ukryty razem
        z nim, więc nie było czym potwierdzić: droga awaryjna kończyła się ślepo.
      */}
      {camError && stage === 'live' && (
        <div className="plantcam__error">
          <p className="t-body-strong">{camError}</p>
          <p className="t-body-sm">
            Możesz zrobić zdjęcie systemowym aparatem, a ja je sprawdzę.
          </p>
          <label className="plantcam__file">
            Otwórz aparat
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => void fromFile(e.target.files?.[0])}
            />
          </label>
        </div>
      )}

      {/*
        Wynik siedzi tam, gdzie patrzyłeś: nad spustem, na rozmytym i
        przyciemnionym tle, żeby dało się go przeczytać na każdym zdjęciu.
      */}
      {stage === 'done' && (
        <div className="plantcam__result">
          {best ? (
            <>
              <p className="plantcam__name">
                <Leaf size={16} /> {plantLabel(best)}
              </p>
              <p className="t-body-sm plantcam__score">
                Pewność {Math.round(best.score * 100)} procent
                {best.family ? ` · rodzina ${best.family}` : ''}
                {answer?.left != null ? ` · zostało dziś ${answer.left}` : ''}
              </p>
              {answer!.guesses.length > 1 && (
                <p className="t-caption plantcam__other">
                  Model waha się też nad:{' '}
                  {answer!.guesses
                    .slice(1)
                    .map((g) => `${plantLabel(g)} (${Math.round(g.score * 100)}%)`)
                    .join(', ')}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="plantcam__name">
                <Leaf size={16} /> {answer?.note ?? 'Nie rozpoznałem'}
              </p>
              <p className="t-body-sm plantcam__score">
                Spróbuj z bliska: jeden liść, kwiat albo kora wypełniające kadr.
              </p>
            </>
          )}
          <div className="plantcam__actions">
            <button className="plantcam__act" onClick={reset}>
              <RotateCcw size={16} /> Jeszcze raz
            </button>
            {onSave && best && shot && (
              <button
                className="plantcam__act -save"
                onClick={() => {
                  onSave(shot.blob, plantLabel(best))
                  close()
                }}
              >
                Zapisz w wyprawie
              </button>
            )}
            <button className="plantcam__act" onClick={close}>
              Zamknij
            </button>
          </div>
        </div>
      )}

      {/*
        Spust: jedno kółko, trzy stany. Biały pierścień robi zdjęcie, zielony
        ptaszek wysyła je do sprawdzenia, kręcące się kółko mówi, że trwa.
      */}
      {stage !== 'done' && (stage !== 'live' || !camError) && (
        <div className="plantcam__bar">
          {stage === 'shot' && (
            <button className="plantcam__retake" onClick={reset} aria-label="Zrób jeszcze raz">
              <RotateCcw size={20} />
            </button>
          )}
          <button
            className={`plantcam__shutter${stage === 'shot' ? ' -ok' : ''}${stage === 'checking' ? ' -busy' : ''}`}
            onClick={() => {
              if (stage === 'live') void capture()
              else if (stage === 'shot') void check()
            }}
            disabled={stage === 'checking'}
            aria-label={
              stage === 'live' ? 'Zrób zdjęcie' : stage === 'shot' ? 'Sprawdź roślinę' : 'Sprawdzam'
            }
          >
            {stage === 'shot' && <Check size={30} strokeWidth={3} />}
          </button>
          <span className="plantcam__hint t-caption">
            {stage === 'live'
              ? 'Jeden liść, kwiat albo kora blisko kadru'
              : stage === 'shot'
                ? 'Dotknij ptaszka, żeby sprawdzić'
                : 'Sprawdzam…'}
          </span>
        </div>
      )}
    </div>
  )
}
