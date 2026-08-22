import { useEffect, useRef, useState } from 'react'
import { Check, CloudDownload, Trash2, X } from 'lucide-react'
import { downloadPack, dropPack, estimatePack, fmtMB, packIndex, verifyPack } from './offline'
import type { PackInfo, PackProgress } from './offline'

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
 */
export function OfflineRow({ parkId, parkName }: { parkId: string; parkName: string }) {
  const [info, setInfo] = useState<PackInfo | null>(() => packIndex()[parkId] ?? null)
  const [guess, setGuess] = useState<{ tiles: number; bytes: number } | null>(null)
  const [sharpGuess, setSharpGuess] = useState<{ tiles: number; bytes: number } | null>(null)
  const [busy, setBusy] = useState<PackProgress | null>(null)
  const [done, setDone] = useState<string | null>(null)
  /** paczka byla, a zniknela: system wyczyscil dane strony */
  const [gone, setGone] = useState(false)
  const stop = useRef<AbortController | null>(null)

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

  useEffect(() => () => stop.current?.abort(), [])

  const run = async (sharp: boolean) => {
    const ctrl = new AbortController()
    stop.current = ctrl
    setBusy({ done: 0, total: (sharp ? sharpGuess : guess)?.tiles ?? 0, bytes: 0 })
    const out = await downloadPack(parkId, sharp, setBusy, ctrl.signal)
    stop.current = null
    setBusy(null)
    if (!out || out.aborted) return
    setInfo(packIndex()[parkId] ?? null)
    setDone(
      out.failed > 0
        ? `Pobrane, ale ${out.failed} kafli się nie udało. Spróbuj jeszcze raz przy lepszym łączu.`
        : `${parkName} zmieści się w kieszeni.`,
    )
  }

  if (busy) {
    const pct = busy.total > 0 ? Math.round((busy.done / busy.total) * 100) : 0
    return (
      <div className="offline -busy">
        <span className="offline__ring" style={{ ['--pct' as string]: `${pct}%` }} aria-hidden="true">
          {pct}
        </span>
        <div className="offline__body">
          <p className="t-label offline__name">Pobieram mapę…</p>
          <p className="t-caption offline__hint">
            {busy.done} z {busy.total} kafli · {fmtMB(busy.bytes)}. Możesz zamknąć kartę, pobieranie
            idzie dalej.
          </p>
        </div>
        <button
          className="offline__stop"
          aria-label="Przerwij pobieranie"
          onClick={() => stop.current?.abort()}
        >
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
            : 'W dolinkach nie ma zasięgu, a mapa bez sieci pokazuje tylko to, co już widziała. Pobierz teraz, w domu.'}
        </p>
        <div className="offline__picks">
          <button className="offline__pick" disabled={!guess} onClick={() => void run(false)}>
            {guess ? `Zwykła · ${fmtMB(guess.bytes)}` : 'Liczę…'}
          </button>
          <button className="offline__pick -alt" disabled={!sharpGuess} onClick={() => void run(true)}>
            {sharpGuess ? `Ostrzejsza · ${fmtMB(sharpGuess.bytes)}` : ''}
          </button>
        </div>
      </div>
      {done && (
        <p className="t-caption offline__said" role="status">
          {done}
        </p>
      )}
    </div>
  )
}
