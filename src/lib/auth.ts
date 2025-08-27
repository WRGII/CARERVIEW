// src/lib/auth.ts
import { supabase } from './supabase'

export type SessionToken = {
  tokenId: string
  role: 'admin' | 'caregiver'
}

export const validateToken = async (rawToken: string): Promise<SessionToken | null> => {
  console.log('validateToken: Starting validation for token')
  // Ask the DB to validate the RAW token (it hashes inside Postgres)
  const { data, error } = await supabase.rpc('validate_token', { _raw_token: rawToken })
  console.log('validateToken: RPC validate_token result:', { data, error })
  if (error || !data || !data[0]?.valid) return null

  const { token_id, role } = data[0] as { token_id: string; role: 'admin' | 'caregiver'; valid: boolean }
  console.log('validateToken: Extracted token_id and role:', { token_id, role })

  // Set session GUCs so RLS policies recognize this session’s role
  console.log('validateToken: Setting token context...')
  await supabase.rpc('set_token_context', { p_token_id: token_id, p_role: role })
  console.log('validateToken: Token context set successfully')

  return { tokenId: token_id, role }
}

// Always URL-encode in case tokens contain + or /
export const generateInviteLink = (role: 'admin' | 'caregiver', token: string): string => {
  const baseUrl = window.location.origin
  const path = role === 'admin' ? '/admin' : '/caregiver'
  return `${baseUrl}${path}?token=${encodeURIComponent(token)}`
}
