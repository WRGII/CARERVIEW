import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const generateToken = (): string => {
  return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
}

export const hashToken = async (token: string): Promise<string> => {
  // In production, use proper hashing with CARERVIEW_HASH_SECRET
  // For demo purposes, we'll use a simple hash
  const encoder = new TextEncoder()
  const data = encoder.encode(token + (import.meta.env.CARERVIEW_HASH_SECRET || 'default-secret'))
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}