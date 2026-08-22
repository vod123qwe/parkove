import { useEffect, useState } from 'react'
import { Check, CloudDownload, Trash2, X } from 'lucide-react'
import {
  cancelDownload,
  currentJob,
  dropPack,
  estimatePack,
  fmtMB,
  jobEta,
  packIndex,
  startDownload,
  verifyPack,
  watchJob,
} from './offline'
import type { PackInfo } from './offline'

/**
 * „Mapa offline" w karcie miejsca.
 *
 * Stoi tutaj, a nie w ustawieniach, bo to decyzja planowania: podejmujesz ją w
 * domu, patrząc na miejsce, do którego jedziesz. Ustawienia są o aplikacji,
 * a to jest o wyprawie.
 *
 * Wiersz mówi wprost, ile to waży, i mówi to PRZED pobraniem, z próbki
 * prawdziwych kafli, a nie z tabelki. Dane komórkowe są Jarka, nie moje, więc
 * nic nie zaczyna się samo.
 *
 * Sam wiersz NIE trzyma pobierania. Pobieranie żyje w module (`offline.ts`),
 * więc przeżywa zamknięcie karty, a ten wiersz jest tylko jednym z dwóch okien
 * na ten sam stan; drugim jest pasek u góry ekranu.
 */
export function OfflineRow({ parkId, parkName }: { parkId: string; parkName: string }) {
  const [info, setInfo] = useState<PackInfo | null>(() => packIndex()[parkId] ?? null)
  const [guess, setGuess] = useState<{ tiles: number; bytes: number } | null>(null)
  const [sharpGuess, setSharpGuess] = useState<{ tiles: number; bytes: number } | null>(null)
  const [job, setJob] = useState(currentJob)
  /** paczka była, a zniknęła: system wyczyścił dane strony */
  const [gone, setGone] = useState(false)

  useEffect(() => watchJob(() => setJob(currentJob())), [])

  /* skończone pobieranie tego miejsca odświeża wiersz na „gotowe" */
  useEffect(() => {
    if (job?.parkId === parkId && job.state === 'done') setInfo(packIndex()[parkId] ?? null)
  }, [job, parkId])

  /*
   * Ufaj, ale sprawdź. Spis pobranych miejsc i koszyk z kaflami to dwa osobne
   * magazyny, a system może wyczyścić drugi bez pytania. Bez tego wiersz mógłby
   * obiecywać mapę, której już nie ma, i dowiedziałbyś się o tym w dolinie.
   */
  useEffect(() => {
    if (!info) return
    let alive = true
    void verifyPack(parkId).then((ok) => {
      if (alive && !ok) {
        setInfo(null)
        setGone(true)
      }
    })
    return () => {
      alive = false
    }
  }, [parkId, info])

  /* szacunek liczymy raz, przy wejściu do karty, i tylko gdy nie ma paczki */
  useEffect(() => {
    if (info) return
    let alive = true
    void (async () => {
      const core = await estimatePack(parkId, false)
      if (alive) setGuess(core)
      const sharp = await estimatePack(parkId, true)
      if (alive) setSharpGuess(sharp)
    })()
    return () => {
      alive = false
    }
  }, [parkId, info])

  const mine = job?.parkId === parkId && job.state === 'run' ? job : null
  const busyElsewhere = job?.state === 'run' && job.parkId !== parkId

  if (mine) {
    const pct = mine.total > 0 ? Math.round((mine.done / mine.total) * 100) : 0
    const eta = jobEta(mine)
    return (
      <div className="offline -busy">
        <span
          className="offline__ring"
          style={{ ['--pct' as string]: `${pct}%` }}
          aria-hidden="true"
        >
          {pct}
        </span>
        <div className="offline__body">
          <p className="t-label offline__name">Pobieram mapę…</p>
          <p className="t-caption offline__hint">
            {mine.done} z {mine.total} kafli · {fmtMB(mine.bytes)}
            {eta !== null
              ? ` · jeszcze ${eta < 60 ? `${eta} s` : `${Math.round(eta / 60)} min`}`
              : ''}
            . Możesz zamknąć kartę, pobieranie idzie dalej.
          </p>
        </div>
        <button className="offline__stop" aria-label="Przerwij pobieranie" onClick={cancelDownload}>
          <X size={18} />
        </button>
      </div>
    )
  }

  if (info) {
    return (
      <div className="offline -ready">
        <span className="offline__mark" aria-hidden="true">
          <Check size={17} />
        </span>
        <div className="offline__body">
          <p className="t-label offline__name">Mapa działa offline</p>
          <p className="t-caption offline__hint">
            {info.tiles} kafli · {fmtMB(info.bytes)}
            {info.sharp ? ' · wariant ostrzejszy' : ''}
          </p>
        </div>
        <button
          className="offline__stop"
          aria-label="Usuń pobraną mapę"
          onClick={() => {
            void dropPack(parkId).then(() => setInfo(null))
          }}
        >
          <Trash2 size={17} />
        </button>
      </div>
    )
  }

  return (
    <div className="offline">
      <span className="offline__mark" aria-hidden="true">
        <CloudDownload size={17} />
      </span>
      <div className="offline__body">
        <p className="t-label offline__name">Pobierz mapę na offline</p>
        <p className="t-caption offline__hint">
          {gone
            ? 'Ta mapa była pobrana, ale telefon posprzątał dane, żeby zrobić miejsce. Trzeba jeszcze raz.'
            : busyElsewhere
              ? `Najpierw kończy się pobieranie ${job?.parkName}. Jedno naraz, żeby nie dzielić łącza.`
              : 'W dolinkach nie ma zasięgu, a mapa bez sieci pokazuje tylko to, co już widziała. Pobierz teraz, w domu.'}
        </p>
        <div className="offline__picks">
          <button
            className="offline__pick"
            disabled={!guess || busyElsewhere}
            onClick={() => guess && startDownload(parkId, parkName, false, guess.tiles)}
          >
            {guess ? `Zwykła · ${fmtMB(guess.bytes)}` : 'Liczę…'}
          </button>
          <button
            className="offline__pick -alt"
            disabled={!sharpGuess || busyElsewhere}
            onClick={() => sharpGuess && startDownload(parkId, parkName, true, sharpGuess.tiles)}
          >
            {sharpGuess ? `Ostrzejsza · ${fmtMB(sharpGuess.bytes)}` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
