import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'admin_token'

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (payload.role !== 'admin') return false
    if (!payload.exp) return false
    return payload.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export function getAdminToken(): string | null {
  try {
    const token = sessionStorage.getItem(STORAGE_KEY)
    if (!token) return null
    if (!isTokenValid(token)) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return token
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
