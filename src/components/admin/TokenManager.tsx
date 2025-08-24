import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { generateToken, hashToken } from '../../lib/utils'
import { generateInviteLink } from '../../lib/auth'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Loading } from '../ui/Loading'
import { Copy, Plus, Trash2, Link } from 'lucide-react'
import { AlertCircle } from 'lucide-react'
import type { AccessToken } from '../../lib/supabase'

export const TokenManager: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTokenRole, setNewTokenRole] = useState<'admin' | 'caregiver'>('caregiver')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [createTokenError, setCreateTokenError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: tokens, isLoading } = useQuery({
    queryKey: ['admin-tokens'],
    queryFn: async (): Promise<AccessToken[]> => {
      const { data, error } = await supabase
        .from('access_tokens')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch tokens: ${error.message}`)
      }

      return data
    }
  })

  const createToken = useMutation({
  mutationFn: async (role: 'admin' | 'caregiver') => {
    setCreateTokenError(null)

    // 1) Generate the RAW token and its HASH (RAW shown once in UI; HASH stored in DB)
    const raw = generateToken()
    const tokenHash = await hashToken(raw)

    // 2) Call the SECURITY DEFINER RPC (bypasses RLS safely, checks admin via session GUCs)
    const { data, error } = await supabase.rpc('app.create_token', {
      _role: role,
      _display_name: null, // or pass a name field if you add it to the form
      _email: null,        // or pass an email if you add it to the form
      _token_hash: tokenHash
    })

    if (error) {
      throw new Error(`Failed to create token: ${error.message}`)
    }

    // 3) RPC returns the new token id (UUID). For the success card we only need role + RAW.
    return { id: data as string, role, plainToken: raw }
  },
  onSuccess: () => {
    // Refresh list of active tokens
    queryClient.invalidateQueries({ queryKey: ['admin-tokens'] })
  },
  onError: (err: any) => {
    setCreateTokenError(err.message || String(err))
  }
})


  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedToken(text)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  if (isLoading) {
    return <Loading message="Loading tokens..." />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Access Token Management</h3>
            <Button
              variant="primary"
              onClick={() => {
                setShowCreateForm(true)
                setCreateTokenError(null)
                createToken.reset()
              }}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Token</span>
            </Button>
          </div>
        </CardHeader>
        
        {showCreateForm && (
          <CardContent>
            <div className="border-t border-slate-200 pt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Token Role
                  </label>
                  <select
                    value={newTokenRole}
                    onChange={(e) => setNewTokenRole(e.target.value as 'admin' | 'caregiver')}
                    className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="caregiver">Caregiver</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="primary"
                    onClick={() => createToken.mutate(newTokenRole)}
                    disabled={createToken.isPending}
                  >
                    Generate Token
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
                {createTokenError && (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span>Error: {createTokenError}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {createToken.data && (
        <Card>
          <CardContent>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Token Created Successfully</h4>
              <p className="text-sm text-green-700 mb-3">
                Copy this invite link and share it securely. This is the only time you'll see the full token.
              </p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-green-200 font-mono text-sm break-all">
                  {generateInviteLink(createToken.data.role, createToken.data.plainToken)}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(generateInviteLink(createToken.data.role, createToken.data.plainToken))}
                  className="flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Invite Link</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-slate-900">Active Tokens</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tokens?.filter(t => t.is_active).map(token => (
              <div key={token.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      token.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {token.role}
                    </span>
                    <span className="text-sm text-slate-600">
                      Created {new Date(token.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {token.token_hash.substring(0, 16)}...
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deactivateToken.mutate(token.id)}
                  disabled={deactivateToken.isPending}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Deactivate</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}