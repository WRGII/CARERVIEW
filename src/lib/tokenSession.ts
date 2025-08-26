import { supabase } from './supabaseClient'

type ValidateRow = {
  valid?: boolean
  role?: string
  token_id?: string
  tokenId?: string
  tokenid?: string
}

export async function establishSessionFromToken(): Promise<{ role: string; tokenId: string }> {
  const url = new URL(window.location.href)
  const token = url.searchParams.get('token')
  if (!token) throw new Error('Missing token in URL')

  // 1) Validate token (schema-qualified)
  const { data: vData, error: vErr } = await supabase.rpc('app.validate_token', { _raw_token: token })
  if (vErr) throw new Error(vErr.message)

  const const { data: vData, error: vErr } = await supabase.rpc('validate_token', { _raw_token: token })
: ValidateRow | undefined = Array.isArray(vData) ? vData[0] : (vData as any)
  if (!row || !row.valid) throw new Error('Invalid or expired token')

  const tokenId = row.token_id || row.tokenId || row.tokenid
  const role = row.role
  if (!tokenId || !role) throw new Error('Token context missing token_id or role')

  // 2) Set DB session context for RLS
  const { error: sErr } = await supabase.rpc('app.set_token_context', { p_token_id: tokenId, p_role: role })
  if (sErr) throw new Error(sErr.message)

  return { role, tokenId }
}