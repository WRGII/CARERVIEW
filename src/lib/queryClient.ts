import { QueryClient } from '@tanstack/react-query'
import { classifyError, isOffline } from './errors'
import { logError } from './errorLogger'

function shouldRetry(failureCount: number, error: unknown): boolean {
  const classified = classifyError(error)

  if (!classified.retryable) return false
  if (isOffline()) return false
  if (classified.errorClass === 'auth') return false
  if (classified.errorClass === 'validation') return false

  return failureCount < 3
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: shouldRetry,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: shouldRetry,
      networkMode: 'offlineFirst',
    },
  },
})

queryClient.setDefaultOptions({
  queries: {
    ...queryClient.getDefaultOptions().queries,
  },
  mutations: {
    ...queryClient.getDefaultOptions().mutations,
    onError: (error) => {
      const classified = classifyError(error)
      logError(classified)
    },
  },
})
