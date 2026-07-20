import React from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ERROR_BOUNDARY_KEYS } from '../../lib/errorMessages'
import { logError } from '../../lib/errorLogger'
import { classifyError } from '../../lib/errors'

type Props = { children: React.ReactNode; fallback?: React.ReactNode }
type State = { error: any; showDetails: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null, showDetails: false }
  }

  static getDerivedStateFromError(error: any) {
    return { error }
  }

  componentDidCatch(error: any, info: any) {
    const classified = classifyError(error)
    logError(classified)
    console.error('[CarerView] ErrorBoundary caught:', error, info?.componentStack)
  }

  reset = () => {
    this.setState({ error: null, showDetails: false })
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const errorMessage = this.state.error?.message || String(this.state.error)

      return (
        <ErrorBoundaryFallback
          errorMessage={errorMessage}
          showDetails={this.state.showDetails}
          onReset={this.reset}
          onToggleDetails={() => this.setState((s) => ({ ...s, showDetails: !s.showDetails }))}
        />
      )
    }
    return this.props.children
  }
}

interface FallbackProps {
  errorMessage: string
  showDetails: boolean
  onReset: () => void
  onToggleDetails: () => void
}

function ErrorBoundaryFallback({ errorMessage, showDetails, onReset, onToggleDetails }: FallbackProps) {
  const { t } = useLocale()

  return (
    <div className="min-h-[40vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">
          {t(ERROR_BOUNDARY_KEYS.title)}
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          {t(ERROR_BOUNDARY_KEYS.description)}
        </p>
        <div className="flex gap-3 justify-center mb-4">
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {t(ERROR_BOUNDARY_KEYS.retry)}
          </button>
          <button
            onClick={() => {
              window.location.href = '/caregiver'
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            {t(ERROR_BOUNDARY_KEYS.dashboard)}
          </button>
        </div>
        <button
          onClick={onToggleDetails}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showDetails ? t(ERROR_BOUNDARY_KEYS.hide) : t(ERROR_BOUNDARY_KEYS.details)}
        </button>
        {showDetails && (
          <pre className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs text-slate-600 overflow-auto max-h-40 whitespace-pre-wrap break-words">
            {errorMessage}
          </pre>
        )}
      </div>
    </div>
  )
}
