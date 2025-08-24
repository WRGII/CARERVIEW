import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Layout } from '../components/common/Layout'
import { Loading } from '../components/ui/Loading'
import { ErrorMessage } from '../components/ui/ErrorMessage'
import { Button } from '../components/ui/Button'
import { ExcelImport } from '../components/admin/ExcelImport'
import { TokenManager } from '../components/admin/TokenManager'
import { AggregateData } from '../components/admin/AggregateData'
import { Upload, Link, BarChart3 } from 'lucide-react'
import { supabase } from '../lib/supabase'

type AdminView = 'dashboard' | 'import' | 'tokens'

export const AdminPage: React.FC = () => {
  const { token, loading, error } = useAuth() // must return { tokenId, role, ... } when valid
  const [currentView, setCurrentView] = useState<AdminView>('dashboard')
  const [ctxReady, setCtxReady] = useState(false)

  // 1) Show spinner while validating the URL token
  if (loading) {
    return <Loading message="Validating admin access..." />
  }

  // 2) Hard deny when there is no valid admin token
  if (error || !token || token.role !== 'admin') {
    return <ErrorMessage message={error || 'Access denied. Invalid administrator token.'} />
  }

  // 3) Once we have a valid admin token, set the DB session context (Step 5A)
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      try {
        await supabase.rpc('app.set_token_context', {
          p_token_id: token.tokenId,  // UUID of access_tokens row
          p_role: token.role          // 'admin'
        })
        if (!cancelled) setCtxReady(true)
      } catch (e) {
        console.error('Failed to set token context', e)
      }
    }
    init()
    return () => { cancelled = true }
  }, [token?.tokenId, token?.role])

  if (!ctxReady) {
    return <Loading message="Preparing secure admin session..." />
  }

  // 4) Render the admin app
  const renderContent = () => {
    switch (currentView) {
      case 'import':
        return <ExcelImport />
      case 'tokens':
        return <TokenManager />
      default:
        return <AggregateData />
    }
  }

  return (
    <Layout title="Administrator Dashboard" role="admin">
      <div className="space-y-6">
        {/* Navigation */}
        <div className="flex space-x-4 border-b border-slate-200 pb-4">
          <Button
            variant={currentView === 'dashboard' ? 'primary' : 'ghost'}
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </Button>
          <Button
            variant={currentView === 'import' ? 'primary' : 'ghost'}
            onClick={() => setCurrentView('import')}
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Excel Import</span>
          </Button>
          <Button
            variant={currentView === 'tokens' ? 'primary' : 'ghost'}
            onClick={() => setCurrentView('tokens')}
            className="flex items-center space-x-2"
          >
            <Link className="w-4 h-4" />
            <span>Manage Tokens</span>
          </Button>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </Layout>
  )
}
