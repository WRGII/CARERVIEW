import { supabase } from './supabase'
import type { AccessToken } from './supabase'

let currentTokenId: string | null = null

export const setTokenContext = async (tokenId: string): Promise<void> => {
  currentTokenId = tokenId
  await supabase.rpc('set_token_id', { token_uuid: tokenId })
}

export const getCurrentTokenId = (): string | null => {
  return currentTokenId
}

export const validateToken = async (token: string): Promise<AccessToken | null> => {
  try {
    // In a real implementation, this would hash the token and look it up
    // For now, we'll simulate this by directly querying with the token
    const { data, error } = await supabase
      .from('access_tokens')
      .select('*')
      .eq('token_hash', token)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    // Check if token is expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null
    }

    await setTokenContext(data.id)
    return data
  } catch {
    return null
  }
}

export const generateInviteLink = (role: 'admin' | 'caregiver', token: string): string => {
  const baseUrl = window.location.origin
  const path = role === 'admin' ? '/admin' : '/caregiver'
  return `${baseUrl}${path}?token=${token}`
}