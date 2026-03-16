import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'admin_token'

export function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, token)
  } catch { }
}

export function clearAdminToken(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch { }
}

export function useAdminSession() {
  const navigate = useNavigate()
  const token = getAdminToken()
  const isAuthenticated = token !== null

  const signOut = useCallback(() => {
    clearAdminToken()
    navigate('/admin/login', { replace: true })
  }, [navigate])

  return { isAuthenticated, token, signOut }
}
