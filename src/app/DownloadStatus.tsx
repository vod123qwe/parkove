import { useEffect, useState } from 'react'
import { Check, CloudDownload, X } from 'lucide-react'
import { cancelDownload, clearJob, currentJob, fmtMB, jobEta, watchJob } from './offline'

/**
 * Pasek pobierania u góry ekranu.
 *
 * Jarek: „gdy pobieram mapę, powinienem móc zamknąć dany widok, i gdzieś
 * powinienem mieć komunikat z odliczaniem pobierania mapy, może jakiś komunikat
 * u góry ekranu, subtelny, ze statusem, który znika".
 *
 * Stoi u samej góry i nad wszystkim, bo to jedyna rzecz w apce, która dzieje się
 * dalej po zamknięciu widoku, w którym ją zaczęto. Nie jest komunikatem od dołu
 * (tam żyją powiadomienia o tym, co się właśnie stało): to stan, który trwa, a
 * stan mieszka w pasku, nie w powiadomieniu.
 *
 * Znika sam trzy i pół sekundy po skończeniu. Odliczanie jest z pomiaru, nie z
 * obietnicy: bierze tempo z tego, co już zeszło, i dlatego pojawia się dopiero
 * po dwóch sekundach, gdy jest z czego liczyć.
 */
export function DownloadStatus() {
  const [job, setJob] = useState(currentJob)
  useEffect(() => watchJob(() => setJob(currentJob())), [])

  /* skończone schodzi samo; przerwane też, tylko szybciej */
  useEffect(() => {
    if (!job || job.state === 'run') return
    const t = window.setTimeout(clearJob, job.state === 'done' ? 3500 : 1800)
    return () => window.clearTimeout(t)
  }, [job])

  if (!job) return null

  const pct = job.total > 0 ? Math.min(100, Math.round((job.done / job.total) * 100)) : 0
  const eta = job.state === 'run' ? jobEta(job) : null
  const label =
    job.state === 'done'
      ? job.failed > 0
        ? `${job.parkName}: ${job.failed} kafli nie weszło`
        : `${job.parkName} działa offline`
      : job.state === 'stopped'
        ? 'Pobieranie przerwane'
        : job.parkName

  return (
    <div className={`dlbar -${job.state}`} role="status" aria-live="polite">
      {job.state === 'done' ? (
        <span className="dlbar__mark" aria-hidden="true">
          <Check size={14} />
        </span>
      ) : (
        <span
          className="dlbar__ring"
          style={{ ['--pct' as string]: `${pct}%` }}
          aria-hidden="true"
        >
          <CloudDownload size={12} />
        </span>
      )}
      <span className="dlbar__text">{label}</span>
      {job.state === 'run' && (
        <>
          <span className="dlbar__num">
            {pct}%{eta !== null ? ` · ${eta < 60 ? `${eta} s` : `${Math.round(eta / 60)} min`}` : ''}
          </span>
          <button className="dlbar__stop" aria-label="Przerwij pobieranie" onClick={cancelDownload}>
            <X size={14} />
          </button>
        </>
      )}
      {job.state === 'done' && <span className="dlbar__num">{fmtMB(job.bytes)}</span>}
    </div>
  )
}
