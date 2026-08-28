import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavBar, Segmented } from '../ds'
import { DiscoveriesScreen } from './DiscoveriesScreen'
import { MemoryJournal } from './MemoryJournal'
import { useGameState } from './state'
import { useLightChrome } from '../ds/useLightChrome'

/**
 * Pamiętnik is the narrative record of a walk: route, places and everything
 * the person left behind. Odkrycia is its spatial twin, so both stay under one
 * roof. The older technical Wyprawy list was replaced, not kept as a third mode.
 */
export type JournalTab = 'pamietnik' | 'odkrycia'

export function JournalScreen({
  initialTab = 'pamietnik',
  onClose,
  onOpenJourney,
}: {
  initialTab?: JournalTab
  onClose: () => void
  onOpenJourney: (id: string) => void
}) {
  const [tab, setTab] = useState<JournalTab>(initialTab)
  const { journeys } = useGameState()
  useLightChrome(tab === 'pamietnik')

  const rows = useMemo(() => [...journeys].sort((a, b) => b.startedAt - a.startedAt), [journeys])

  return createPortal(
    <div className={`jrnl${tab === 'odkrycia' ? ' -dark' : ''}`}>
      <NavBar
        className="jrnl__nav"
        title="Pamiętnik"
        variant="back"
        scrolled
        onAction={onClose}
      />
      <div className="jrnl__seg">
        <Segmented
          aria-label="Widok pamiętnika"
          options={[
            { value: 'pamietnik', label: 'Pamiętnik' },
            { value: 'odkrycia', label: 'Odkrycia' },
          ]}
          value={tab}
          onChange={(value) => setTab(value as JournalTab)}
        />
      </div>

      {tab === 'pamietnik' ? (
        <div className="jrnl__body -memory">
          <MemoryJournal journeys={rows} onOpenJourney={onOpenJourney} />
        </div>
      ) : (
        <div className="jrnl__disc">
          <DiscoveriesScreen embedded onClose={onClose} />
        </div>
      )}
    </div>,
    document.body,
  )
}
