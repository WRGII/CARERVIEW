import { classifyError } from './errors'
import { logError, flushLogs } from './errorLogger'

let initialized = false

export function initGlobalErrorHandler(): void {
  if (initialized || typeof window === 'undefined') return
  initialized = true

  window.addEventListener('error', (event) => {
    const classified = classifyError(event.error ?? event.message)
    logError(classified)
  })

  window.addEventListener('unhandledrejection', (event) => {
    const classified = classifyError(event.reason)
    logError(classified)
  })

  window.addEventListener('beforeunload', () => {
    void flushLogs()
  })

  window.addEventListener('online', () => {
    void flushLogs()
  })
}
