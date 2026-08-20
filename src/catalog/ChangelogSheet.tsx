import { BottomSheet } from '../ds'
import { CHANGELOG } from '../changelog'
import type { ChangeType } from '../changelog'
import './changelog.css'

const TAG: Record<ChangeType, string> = {
  added: 'ADD',
  changed: 'CHG',
  fixed: 'FIX',
}

export function ChangelogSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="What changed">
      <div className="clog">
        {CHANGELOG.map((rel) => (
          <section key={rel.version} className="clog-release">
            <header className="clog-head">
              <div className="clog-head__row">
                <span className="clog-version t-title">v{rel.version}</span>
                <span className="clog-date t-caption">{rel.date}</span>
              </div>
              <p className="clog-title t-body-sm">{rel.title}</p>
            </header>
            <ul className="clog-list">
              {rel.changes.map(([type, text], i) => (
                <li key={i} className="clog-item">
                  <code className={`clog-tag -${type}`}>{TAG[type]}</code>
                  <span className="clog-text">{text}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </BottomSheet>
  )
}
