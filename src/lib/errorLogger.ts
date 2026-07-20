import { supabase } from './supabaseClient'
import type { ClassifiedError, ErrorClass, Severity } from './errors'

interface LogEntry {
  severity: Severity
  error_class: ErrorClass
  message: string
  stack?: string
  url?: string
  user_agent?: string
}

const BATCH_SIZE = 5
const FLUSH_DELAY_MS = 10_000

let queue: LogEntry[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null

function scheduleFlush(): void {
  if (flushTimer) return
  flushTimer = setTimeout(() => {
    flushTimer = null
    void flush()
  }, FLUSH_DELAY_MS)
}

async function flush(): Promise<void> {
  if (queue.length === 0) return
  const batch = queue.splice(0, BATCH_SIZE)
  try {
    const { error } = await supabase.from('error_logs').insert(batch).maybeSingle()
    if (error) {
      console.error('[CarerView] errorLogger insert failed:', error.message)
    }
  } catch (err) {
    console.error('[CarerView] errorLogger flush failed:', err)
  }
  if (queue.length > 0) scheduleFlush()
}

export function logError(classified: ClassifiedError): void {
  const entry: LogEntry = {
    severity: classified.severity,
    error_class: classified.errorClass,
    message: classified.message,
    stack: classified.originalError instanceof Error ? classified.originalError.stack : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  }

  console.error(`[CarerView] ${classified.errorClass} (${classified.severity}):`, classified.message)

  queue.push(entry)
  if (queue.length >= BATCH_SIZE) {
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    void flush()
  } else {
    scheduleFlush()
  }
}

export async function flushLogs(): Promise<void> {
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
  await flush()
}

export function clearLogQueue(): void {
  queue = []
  if (flushTimer) {
    clearTimeout(flushTimer)
    flushTimer = null
  }
}
