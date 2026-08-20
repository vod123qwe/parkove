import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button } from '../ds'
import './errorboundary.css'

/**
 * Without this, a render error leaves the last painted frame on screen and
 * nothing reacts: it looks like the app froze. Here it shows a way out.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[parkove] render error', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="crash">
        <div className="crash__body">
          <h1 className="t-headline crash__title">Coś się zacięło</h1>
          <p className="t-body crash__text">
            Aplikacja przestała odpowiadać. Odświeżenie zwykle wystarcza, a Twój postęp jest
            zapisany.
          </p>
          <Button size="lg" icon={<RotateCcw size={18} />} onClick={() => window.location.reload()}>
            Odśwież aplikację
          </Button>
          {import.meta.env.DEV && (
            <pre className="crash__detail">{String(this.state.error?.message ?? this.state.error)}</pre>
          )}
        </div>
      </div>
    )
  }
}
