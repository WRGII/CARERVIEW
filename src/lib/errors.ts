export type ErrorClass =
  | 'network'
  | 'auth'
  | 'rate_limit'
  | 'server'
  | 'validation'
  | 'offline'
  | 'unknown'

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export interface ClassifiedError {
  errorClass: ErrorClass
  severity: Severity
  message: string
  originalError: unknown
  retryable: boolean
}

interface SupabasePostgrestError {
  code?: string
  message?: string
  details?: string
  hint?: string
}

interface SupabaseAuthError {
  message?: string
  status?: number
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getHttpStatus(err: unknown): number | undefined {
  if (isObject(err)) {
    if (typeof err.status === 'number') return err.status
    if (typeof err.statusCode === 'number') return err.statusCode
  }
  return undefined
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (isObject(err) && typeof err.message === 'string') return err.message
  return 'Unknown error'
}

export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}

export function classifyError(err: unknown): ClassifiedError {
  const message = getErrorMessage(err)
  const status = getHttpStatus(err)
  const lowerMessage = message.toLowerCase()

  if (isOffline() || lowerMessage.includes('offline') || lowerMessage.includes('network request failed')) {
    return {
      errorClass: 'offline',
      severity: 'medium',
      message,
      originalError: err,
      retryable: true,
    }
  }

  if (lowerMessage.includes('failed to fetch') || lowerMessage.includes('networkerror') || lowerMessage.includes('err_connection')) {
    return {
      errorClass: 'network',
      severity: 'high',
      message,
      originalError: err,
      retryable: true,
    }
  }

  if (status === 401 || lowerMessage.includes('jwt') || lowerMessage.includes('session') && lowerMessage.includes('expired')) {
    return {
      errorClass: 'auth',
      severity: 'high',
      message,
      originalError: err,
      retryable: false,
    }
  }

  if (status === 403 || (isObject(err) && (err as SupabasePostgrestError).code === '42501')) {
    return {
      errorClass: 'auth',
      severity: 'high',
      message,
      originalError: err,
      retryable: false,
    }
  }

  if (status === 429 || lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests')) {
    return {
      errorClass: 'rate_limit',
      severity: 'medium',
      message,
      originalError: err,
      retryable: true,
    }
  }

  if (status === 400 || status === 422) {
    return {
      errorClass: 'validation',
      severity: 'low',
      message,
      originalError: err,
      retryable: false,
    }
  }

  if (status && status >= 500) {
    return {
      errorClass: 'server',
      severity: 'high',
      message,
      originalError: err,
      retryable: true,
    }
  }

  const pgCode = isObject(err) ? (err as SupabasePostgrestError).code : undefined
  if (pgCode === '23505' || pgCode === '23502' || pgCode === '23503' || pgCode === '23514') {
    return {
      errorClass: 'validation',
      severity: 'low',
      message,
      originalError: err,
      retryable: false,
    }
  }

  if (lowerMessage.includes('invalid login') || lowerMessage.includes('invalid email or password')) {
    return {
      errorClass: 'auth',
      severity: 'medium',
      message,
      originalError: err,
      retryable: false,
    }
  }

  return {
    errorClass: 'unknown',
    severity: 'medium',
    message,
    originalError: err,
    retryable: true,
  }
}
