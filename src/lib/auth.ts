// src/lib/auth.ts
import { supabase } from './supabase'

export type SessionToken = {
  tokenId: string
  role: 'admin' | 'caregiver'
}

export const validateToken = async (rawToken: string): Promise<SessionToken | null> => {
  // Ask the DB to validate the RAW token (it hashes inside Postgres)
  const { data, error } = await supabase.rpc('validate_token', { _raw_token: rawToken })
  if (error || !data || !data[0]?.valid) return null

  const { token_id, role } = data[0] as { token_id: string; role: 'admin' | 'caregiver'; valid: boolean }

  // Set session GUCs so RLS policies recognize this session’s role
  await supabase.rpc('app.set_token_context', { p_token_id: token_id, p_role: role })

  return { tokenId: token_id, role }
}

// Always URL-encode in case tokens contain + or /
export const generateInviteLink = (role: 'admin' | 'caregiver', token: string): string => {
  const baseUrl = window.location.origin
  const path = role === 'admin' ? '/admin' : '/caregiver'
  return `${baseUrl}${path}?token=${encodeURIComponent(token)}`
}
