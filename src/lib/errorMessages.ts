import type { ErrorClass } from './errors'

export const ERROR_MESSAGE_KEYS: Record<ErrorClass, string> = {
  network: 'errors.network_failure',
  auth: 'errors.auth_expired',
  rate_limit: 'errors.rate_limited',
  server: 'errors.server_error',
  validation: 'errors.validation_failed',
  offline: 'errors.offline',
  unknown: 'errors.unknown',
}

export function getErrorMessageKey(errorClass: ErrorClass): string {
  return ERROR_MESSAGE_KEYS[errorClass] ?? ERROR_MESSAGE_KEYS.unknown
}

export const ERROR_BOUNDARY_KEYS = {
  title: 'errors.boundary_title',
  description: 'errors.boundary_description',
  retry: 'errors.boundary_retry',
  dashboard: 'errors.boundary_dashboard',
  details: 'errors.boundary_details',
  hide: 'errors.boundary_hide',
} as const

export const OFFLINE_BANNER_KEYS = {
  title: 'errors.offline_banner_title',
  body: 'errors.offline_banner_body',
} as const
